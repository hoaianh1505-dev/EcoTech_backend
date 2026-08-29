import express from 'express';
import { getProducts, getProductBySlug, createProduct } from '../controllers/product.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);                                     // Ai cũng lấy được danh sách sản phẩm
router.get('/:slug', getProductBySlug);                           // Xem chi tiết sản phẩm qua slug
router.post('/', protect, restrictTo('admin'), createProduct);    // Chỉ Admin tạo sản phẩm mới

export default router;
