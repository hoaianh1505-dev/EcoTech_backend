import crypto from 'crypto';
import { AppDataSource } from '../config/data-source.js';
import { Order } from '../entities/Order.js';

export const vnpayService = {
  // 1. Tạo đường dẫn chuyển hướng thanh toán (VNPay Payment URL)
  createPaymentUrl: async (req, orderId) => {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: Number(orderId) }
    });

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const tmnCode = process.env.VNP_TMN_CODE || 'CGV00001';
    const hashSecret = process.env.VNP_HASH_SECRET || '9A2294469596B7C125F4C7469B568979';
    const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/success';

    const date = new Date();
    // Định dạng thời gian YYYYMMDDHHmmss đúng chuẩn VNPay
    const createDate = date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0') +
      date.getHours().toString().padStart(2, '0') +
      date.getMinutes().toString().padStart(2, '0') +
      date.getSeconds().toString().padStart(2, '0');

    // Lấy IP của Client gửi yêu cầu
    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress || '127.0.0.1';

    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: `Thanh toan dat coc xe EcoTech. Don hang #${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(Number(order.totalAmount) * 100), // VNPay yêu cầu nhân 100 để triệt tiêu số thập phân
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    };

    // Sắp xếp các tham số theo bảng chữ cái
    vnpParams = sortObject(vnpParams);

    // Nối chuỗi các cặp key=value bằng ký tự &
    const signData = Object.keys(vnpParams)
      .map(key => `${key}=${vnpParams[key]}`)
      .join('&');

    // Ký thuật toán HMAC-SHA512 để bảo mật
    const hmac = crypto.createHmac("sha512", hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
    vnpParams['vnp_SecureHash'] = signed;

    // Trả về URL dẫn sang cổng thanh toán VNPAY
    const paymentUrl = vnpUrl + '?' + Object.keys(vnpParams)
      .map(key => `${key}=${vnpParams[key]}`)
      .join('&');

    return paymentUrl;
  },

  // 2. Kiểm duyệt IPN từ máy chủ VNPAY bắn ngầm sang Backend (Duyệt cọc tự động)
  processIpn: async (reqQuery) => {
    let vnpParams = { ...reqQuery };
    const secureHash = vnpParams['vnp_SecureHash'];

    // Xóa các tham số băm cũ để tự tính toán đối chiếu chữ ký
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sắp xếp lại theo bảng chữ cái
    vnpParams = sortObject(vnpParams);

    const hashSecret = process.env.VNP_HASH_SECRET || '9A2294469596B7C125F4C7469B568979';
    const signData = Object.keys(vnpParams)
      .map(key => `${key}=${vnpParams[key]}`)
      .join('&');

    const hmac = crypto.createHmac("sha512", hashSecret);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    // So khớp chữ ký xác thực
    if (secureHash === checkSum) {
      const orderId = vnpParams['vnp_TxnRef'];
      const responseCode = vnpParams['vnp_ResponseCode'];
      const vnpAmount = Number(vnpParams['vnp_Amount']) / 100; // Chia lại 100 lấy tiền gốc

      const orderRepository = AppDataSource.getRepository(Order);
      const order = await orderRepository.findOne({
        where: { id: Number(orderId) }
      });

      if (!order) {
        return { rspCode: '01', message: 'Order not found' };
      }

      // Kiểm tra trùng khớp số tiền thanh toán
      if (Math.round(Number(order.totalAmount)) !== Math.round(vnpAmount)) {
        return { rspCode: '04', message: 'Invalid amount' };
      }

      // Kiểm tra trạng thái đơn cọc đã được duyệt trước đó chưa (Chống trùng lặp - Double Spend)
      if (order.status === 'paid') {
        return { rspCode: '02', message: 'Order already confirmed' };
      }

      if (responseCode === '00') {
        // Giao dịch thành công -> Duyệt trạng thái Đã cọc xe
        order.status = 'paid';
        await orderRepository.save(order);
        return { rspCode: '00', message: 'Confirm Success' };
      } else {
        // Giao dịch thất bại -> Hủy đơn cọc
        order.status = 'cancelled';
        await orderRepository.save(order);
        return { rspCode: '00', message: 'Confirm Success (Transaction Failed)' };
      }
    } else {
      // Sai chữ ký bảo mật
      return { rspCode: '97', message: 'Invalid Checksum' };
    }
  }
};

// Hàm mã hóa URI và sắp xếp tham số chuẩn VNPAY
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
