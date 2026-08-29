import express from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);                                   // Ai cũng xem được danh sách danh mục
router.post('/', protect, restrictTo('admin'), createCategory);  // Chỉ Admin được tạo mới

export default router;
