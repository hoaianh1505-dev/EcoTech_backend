import rateLimit from 'express-rate-limit';

// A. Limiter Toàn cục cho tất cả API (5000 req khi dev / 100 req khi prod trong 15 phút)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  message: {
    status: 'fail',
    message: 'Nhận thấy quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// B. Limiter Khắt khe cho Đăng nhập/Đăng ký và Chatbot AI (500 req khi dev / 15 req khi prod trong 1 phút)
export const secureLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 15,
  message: {
    status: 'fail',
    message: 'Bạn đang thao tác quá nhanh. Vui lòng đợi 1 phút trước khi gửi yêu cầu tiếp theo!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
