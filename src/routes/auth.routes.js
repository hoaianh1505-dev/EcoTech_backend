import express from 'express';
import { register, login, getMe, verifyEmail, resendCode } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Khai báo các API Endpoints cho Authentication
router.post('/register', register);               // Đăng ký
router.post('/login', login);                     // Đăng nhập
router.post('/verify-email', verifyEmail);       // Xác thực OTP kích hoạt
router.post('/resend-code', resendCode);          // Gửi lại mã OTP mới
router.get('/me', protect, getMe);                // Lấy thông tin cá nhân (Cần Đăng nhập)

export default router;
