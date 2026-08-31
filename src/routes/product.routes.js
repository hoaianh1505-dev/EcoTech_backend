import express from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);                                           // Ai cũng lấy được danh sách sản phẩm
router.get('/:slug', getProductBySlug);                                 // Xem chi tiết sản phẩm qua slug
router.post('/', protect, isAdmin, createProduct);          // Chỉ Admin tạo sản phẩm mới
router.put('/:id', protect, isAdmin, updateProduct);        // Chỉ Admin sửa sản phẩm
router.delete('/:id', protect, isAdmin, deleteProduct);     // Chỉ Admin xóa sản phẩm

export default router;
