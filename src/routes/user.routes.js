import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Tất cả các route quản lý User dưới đây đều yêu cầu đăng nhập và có quyền Admin
router.use(protect);
router.use(restrictTo('admin'));

router.get('/', getUsers);                      // Lấy danh sách thành viên
router.patch('/:id/role', updateUserRole);      // Thay đổi vai trò admin/user
router.delete('/:id', deleteUser);              // Xóa tài khoản thành viên

export default router;
