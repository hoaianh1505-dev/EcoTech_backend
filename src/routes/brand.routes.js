import express from 'express';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../controllers/brand.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getBrands);                                         // Khách xem được danh sách hãng xe
router.post('/', protect, isAdmin, createBrand);        // Chỉ Admin được tạo mới hãng xe
router.put('/:id', protect, isAdmin, updateBrand);      // Chỉ Admin được sửa hãng xe
router.delete('/:id', protect, isAdmin, deleteBrand);   // Chỉ Admin được xóa hãng xe

export default router;
