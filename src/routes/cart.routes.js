import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 🔐 Tất cả các API giỏ hàng đều bắt buộc người dùng phải đăng nhập trước
router.use(protect);

router.get('/', getCart);                      // [GET] /api/v1/cart - Lấy giỏ hàng kèm xe chi tiết
router.post('/items', addToCart);              // [POST] /api/v1/cart/items - Thêm xe vào giỏ
router.put('/items/:id', updateCartItem);      // [PUT] /api/v1/cart/items/:id - Sửa số lượng xe đặt cọc
router.delete('/items/:id', removeFromCart);   // [DELETE] /api/v1/cart/items/:id - Xóa xe khỏi giỏ
router.delete('/', clearCart);                 // [DELETE] /api/v1/cart - Xóa sạch giỏ hàng

export default router;
