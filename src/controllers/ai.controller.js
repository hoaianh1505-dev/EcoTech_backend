import { aiService } from '../services/ai.service.js';

// [POST] /api/v1/ai/chat - Trợ lý ảo tư vấn xe hơi
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nội dung tin nhắn không được để trống!',
      });
    }

    // Gọi xuống Service để xử lý hội thoại với Gemini API
    const reply = await aiService.chatWithGemini(message);

    res.status(200).json({
      status: 'success',
      reply,
    });
  } catch (error) {
    console.error('Lỗi chatWithAI:', error);
    
    if (error.message === 'GEMINI_API_ERROR') {
      return res.status(200).json({
        status: 'success',
        reply: 'Hệ thống AI đang quá tải. Bạn vui lòng thử lại sau giây lát nhé.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Lỗi server xử lý hội thoại AI!',
    });
  }
};
