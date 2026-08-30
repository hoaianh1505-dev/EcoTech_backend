import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);                                         // Ai cũng xem được danh sách danh mục
router.post('/', protect, restrictTo('admin'), createCategory);        // Chỉ Admin được tạo mới
router.put('/:id', protect, restrictTo('admin'), updateCategory);      // Chỉ Admin được cập nhật
router.delete('/:id', protect, restrictTo('admin'), deleteCategory);   // Chỉ Admin được xóa

export default router;
