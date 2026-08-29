import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';

// [POST] /api/v1/ai/chat - Trợ lý ảo tư vấn tự động kết nối Database
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nội dung tin nhắn không được để trống!',
      });
    }

    const cleanMsg = message.toLowerCase().trim();
    const productRepository = AppDataSource.getRepository(Product);

    // 1. Phân tích từ khóa để quét xe hơi trong PostgreSQL
    let keyword = '';
    if (cleanMsg.includes('vinfast') || cleanMsg.includes('vf')) keyword = 'vinfast';
    else if (cleanMsg.includes('porsche') || cleanMsg.includes('911')) keyword = 'porsche';
    else if (cleanMsg.includes('tesla') || cleanMsg.includes('plaid')) keyword = 'tesla';
    else if (cleanMsg.includes('mercedes') || cleanMsg.includes('eqs')) keyword = 'mercedes';
    else if (cleanMsg.includes('xe dien') || cleanMsg.includes('ev')) keyword = 'xe-dien';
    else if (cleanMsg.includes('suv')) keyword = 'suv';
    else if (cleanMsg.includes('sedan')) keyword = 'sedan';

    // 2. Nếu khớp từ khóa sản phẩm -> Query DB lấy thông tin xe hơi thực tế
    if (keyword) {
      // Chuẩn hóa từ khóa tìm kiếm
      const searchPattern = `%${keyword === 'xe-dien' ? 'điện' : keyword}%`;
      const products = await productRepository
        .createQueryBuilder('product')
        .where('product.name ILIKE :keyword OR product.brand ILIKE :keyword OR product.description ILIKE :keyword', {
          keyword: searchPattern,
        })
        .limit(3)
        .getMany();

      if (products.length > 0) {
        const prodList = products
          .map(
            (p) =>
              `- Xe ${p.name} (Hãng: ${p.brand}, Giá niêm yết: ${Number(p.price).toLocaleString('vi-VN')}đ)`
          )
          .join('\n');

        return res.status(200).json({
          status: 'success',
          reply: `Dựa trên yêu cầu của bạn, EcoTech gợi ý các mẫu xe phù hợp sau đây tại Showroom:\n\n${prodList}\n\nBạn có muốn tìm hiểu thêm về thông số pin, động cơ hay đăng ký lái thử trực tiếp dòng xe nào kể trên không?`,
        });
      }
    }

    // 3. Phản hồi thông minh nếu chỉ là lời chào hỏi thông thường
    if (cleanMsg.includes('chào') || cleanMsg.includes('hello') || cleanMsg.includes('hi')) {
      return res.status(200).json({
        status: 'success',
        reply: 'Chào bạn, tôi là EcoTech Advisor, trợ lý tư vấn số của EcoTech Auto. Bạn đang tìm hiểu dòng xe SUV gia đình rộng rãi hay dòng xe điện EV thông minh thế hệ mới?',
      });
    }

    // 4. Phản hồi mặc định nếu chưa tìm ra nhu cầu cụ thể
    return res.status(200).json({
      status: 'success',
      reply: 'Hiện tại tôi có thể hỗ trợ so sánh nhanh thông số và giá bán của các dòng xe VinFast, Tesla, Porsche và Mercedes-Benz tại Showroom. Bạn cần tìm hiểu mẫu xe cụ thể nào?',
    });
  } catch (error) {
    console.error('Lỗi chatWithAI:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server xử lý hội thoại AI!',
    });
  }
};
