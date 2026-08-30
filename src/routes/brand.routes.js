import express from 'express';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../controllers/brand.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBrands);                                         // Khách xem được danh sách hãng xe
router.post('/', protect, restrictTo('admin'), createBrand);        // Chỉ Admin được tạo mới hãng xe
router.put('/:id', protect, restrictTo('admin'), updateBrand);      // Chỉ Admin được sửa hãng xe
router.delete('/:id', protect, restrictTo('admin'), deleteBrand);   // Chỉ Admin được xóa hãng xe

export default router;
