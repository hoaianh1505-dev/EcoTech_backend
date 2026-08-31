import { vnpayService } from '../services/vnpay.service.js';

// 1. [POST] /api/v1/payment/vnpay - Tạo URL chuyển hướng thanh toán
export const createPaymentUrl = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp mã đơn hàng (orderId) để thanh toán!'
      });
    }

    const paymentUrl = await vnpayService.createPaymentUrl(req, orderId);

    res.status(200).json({
      status: 'success',
      data: {
        paymentUrl
      }
    });
  } catch (error) {
    console.error('Lỗi createPaymentUrl:', error);
    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy đơn hàng tương ứng trên hệ thống!'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi tạo URL thanh toán VNPay!'
    });
  }
};

// 2. [GET] /api/v1/payment/vnpay_ipn - Webhook IPN nhận kết quả thanh toán từ VNPay
export const vnpayIpn = async (req, res) => {
  try {
    const result = await vnpayService.processIpn(req.query);
    
    // VNPay bắt buộc phản hồi đúng cấu trúc JSON gồm RspCode và Message này để xác nhận đã ghi nhận giao dịch thành công
    res.status(200).json({
      RspCode: result.rspCode,
      Message: result.message
    });
  } catch (error) {
    console.error('Lỗi vnpayIpn:', error);
    res.status(200).json({
      RspCode: '99',
      Message: 'System Error (Lỗi hệ thống)'
    });
  }
};
