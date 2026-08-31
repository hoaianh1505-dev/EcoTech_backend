import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả các API Đặt xe đều yêu cầu phải ĐĂNG NHẬP trước (protect)
router.use(protect);

router.post('/', createOrder);                 // Khách hàng đặt cọc xe mới
router.get('/my-orders', getMyOrders);         // Khách hàng xem lịch sử các xe đã đặt cọc
router.get('/:id', getOrderById);              // Khách hàng/Admin xem chi tiết 1 đơn đặt cọc

// Các API quản trị chỉ cho phép ADMIN truy cập
router.get('/', isAdmin, getAllOrders);              // Admin xem danh sách đặt xe toàn hệ thống
router.patch('/:id', isAdmin, updateOrderStatus);    // Admin duyệt đặt cọc, đổi trạng thái đơn

export default router;
