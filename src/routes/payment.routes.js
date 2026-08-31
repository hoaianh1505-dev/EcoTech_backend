import express from 'express';
import { createPaymentUrl, vnpayIpn } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 🔐 API Tạo đường link thanh toán (Yêu cầu đăng nhập)
router.post('/vnpay', protect, createPaymentUrl);

// 🌐 API Nhận phản hồi IPN trực tiếp từ cổng VNPay (Public Webhook)
router.get('/vnpay_ipn', vnpayIpn);

export default router;
