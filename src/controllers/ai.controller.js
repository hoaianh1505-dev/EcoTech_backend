import { AppDataSource } from '../config/data-source.js';
import { Product } from '../entities/Product.js';

// [POST] /api/v1/ai/chat - Trợ lý ảo kết nối Google Gemini API thực tế (kèm RAG đọc DB)
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nội dung tin nhắn không được để trống!',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        status: 'success',
        reply: 'Chào bạn! Tôi là EcoBot. Vui lòng cấu hình GEMINI_API_KEY trong file .env ở Backend để kích hoạt trợ lý ảo thông minh thực tế.',
      });
    }

    // 1. Lấy toàn bộ danh sách xe thực tế từ PostgreSQL làm ngữ cảnh cho AI
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find({ relations: ['category'] });

    const formattedCars = products.map((p, idx) => (
      `${idx + 1}. Tên xe: ${p.name}, Hãng: ${p.brand}, Giá bán: ${Number(p.price).toLocaleString('vi-VN')}đ, Thông số động cơ/pin: ${p.nicotine || 'Chưa cập nhật'}, Màu sắc/Nội thất: ${p.flavor || 'Chưa cập nhật'}, Số lượng sẵn có: ${p.stock}`
    )).join('\n');

    // 2. Thiết lập System Prompt định hướng cho Gemini hành xử như nhân viên tư vấn
    const systemPrompt = `Bạn là EcoBot - trợ lý ảo tư vấn xe hơi cao cấp của Showroom EcoTech Auto.
Nhiệm vụ của bạn là hỗ trợ khách hàng tìm hiểu thông tin xe, so sánh thông số kĩ thuật, giá bán và tư vấn dòng xe phù hợp dựa trên danh sách xe thực tế có trong showroom bên dưới.
Hãy trả lời một cách chuyên nghiệp, lịch sự bằng tiếng Việt, ngắn gọn, súc tích và mạch lạc. Tuyệt đối không sử dụng các biểu tượng cảm xúc (emojis) trong câu trả lời của bạn.

Dưới đây là danh sách toàn bộ các dòng xe hiện có sẵn trong cơ sở dữ liệu của showroom:
${formattedCars}

Dựa trên danh sách xe thực tế trên, hãy trả lời câu hỏi sau của khách hàng. Nếu khách hàng hỏi về mẫu xe không có trong danh sách, hãy thông báo lịch sự là showroom chưa phân phối mẫu đó và gợi ý dòng xe tương tự có sẵn. Nếu câu hỏi không liên quan đến xe hơi hoặc showroom, hãy lịch sự từ chối trả lời và hướng khách hàng về chủ đề xe hơi:
Khách hàng hỏi: "${message}"`;

    // 3. Gọi REST API của Google Gemini 1.5 Flash (mẫu model nhanh và tối ưu nhất của Google)
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
      return res.status(200).json({
        status: 'success',
        reply: 'Hệ thống kết nối AI đang quá tải. Bạn vui lòng thử lại sau giây lát nhé.',
      });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi chưa hiểu câu hỏi của bạn. Vui lòng đặt câu hỏi chi tiết hơn nhé.';

    res.status(200).json({
      status: 'success',
      reply: reply.trim(),
    });
  } catch (error) {
    console.error('Lỗi chatWithAI:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server xử lý hội thoại AI!',
    });
  }
};
