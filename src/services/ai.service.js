import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';

export const aiService = {
  // Logic kết nối Google Gemini API và nạp thông tin xe hơi từ Database làm ngữ cảnh
  chatWithGemini: async (message) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return 'Chào bạn! Tôi là EcoBot. Vui lòng cấu hình GEMINI_API_KEY trong file .env để bắt đầu hội thoại thực tế nhé!';
    }

    // 1. Quét thông tin xe từ database để làm ngữ cảnh
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find({
      relations: {
        category: true,
      }
    });

    const formattedCars = products.map((p, idx) => (
      `${idx + 1}. Tên xe: ${p.name}, Phân khúc: ${p.category?.name || 'Chưa cập nhật'}, Giá bán: ${Number(p.price).toLocaleString('vi-VN')}đ, Thông số động cơ/pin: ${p.engine || 'Chưa cập nhật'}, Màu sắc/Nội thất: ${p.color || 'Chưa cập nhật'}, Số lượng sẵn có: ${p.stock}`
    )).join('\n');

    // 2. Thiết lập System Prompt
    const systemPrompt = `Bạn là EcoBot - trợ lý ảo tư vấn xe điện VinFast cao cấp của Showroom EcoTech Auto.
Nhiệm vụ của bạn là hỗ trợ khách hàng tìm hiểu thông tin xe điện VinFast, so sánh thông số kỹ thuật, giá bán và tư vấn dòng xe phù hợp dựa trên danh sách xe thực tế có trong showroom bên dưới.
Hãy trả lời một cách chuyên nghiệp, lịch sự bằng tiếng Việt, ngắn gọn, súc tích và mạch lạc. Tuyệt đối không sử dụng các biểu tượng cảm xúc (emojis) trong câu trả lời của bạn.

Dưới đây là danh sách toàn bộ các dòng xe điện VinFast hiện có sẵn trong cơ sở dữ liệu của showroom:
${formattedCars}

Dựa trên danh sách xe thực tế trên, hãy trả lời câu hỏi sau của khách hàng. Nếu khách hàng hỏi về mẫu xe không có trong danh sách, hãy thông báo lịch sự là showroom chưa phân phối mẫu đó và gợi ý dòng xe VinFast tương tự có sẵn. Nếu câu hỏi không liên quan đến xe hơi hoặc showroom, hãy lịch sự từ chối trả lời và hướng khách hàng về chủ đề xe điện VinFast:
Khách hàng hỏi: "${message}"`;

    // 3. Gọi Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('Lỗi phản hồi từ Gemini API:', errData);
      throw new Error('GEMINI_API_ERROR');
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi chưa hiểu câu hỏi của bạn. Vui lòng đặt câu hỏi chi tiết hơn nhé.';
  }
};
