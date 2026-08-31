import express from 'express';
import { getUsers, updateUserRole, deleteUser, updateMe, updateMyPassword } from '../controllers/user.controller.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// 🔐 Tất cả các tuyến đường bên dưới đều yêu cầu người dùng phải Đăng nhập trước
router.use(protect);

// 👤 Phân hệ tự quản lý tài khoản cá nhân của người dùng (Không yêu cầu quyền Admin)
router.put('/profile', updateMe);                  // Tự cập nhật Họ tên, ảnh đại diện
router.put('/password', updateMyPassword);          // Tự thay đổi mật khẩu tài khoản

// 👑 Phân hệ quản trị cao cấp (Bắt buộc phải có vai trò Admin)
router.use(isAdmin);

router.get('/', getUsers);                      // Lấy danh sách toàn bộ thành viên
router.patch('/:id/role', updateUserRole);      // Thay đổi vai trò admin/user
router.delete('/:id', deleteUser);              // Xóa vĩnh viễn tài khoản người dùng

export default router;
