import { userService } from '../services/user.service.js';

// 1. [GET] /api/v1/users - Lấy danh sách tất cả các tài khoản (Chỉ Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAll();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error('Lỗi getUsers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy danh sách tài khoản!',
    });
  }
};

// 2. [PATCH] /api/v1/users/:id/role - Nâng/Hạ quyền Admin của người dùng (Chỉ Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id; // Lấy ID của Admin đang thực hiện từ token bảo mật

    const updatedUser = await userService.updateRole(id, role, adminId);

    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật vai trò của tài khoản thành: ${role === 'admin' ? 'Quản trị viên (Admin)' : 'Khách hàng (User)'}!`,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error('Lỗi updateUserRole:', error);

    if (error.message === 'SELF_ACTION_DENIED') {
      return res.status(400).json({
        status: 'fail',
        message: 'Bạn không được phép tự thay đổi quyền hạn của chính tài khoản mình!',
      });
    }
    if (error.message === 'INVALID_ROLE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Vai trò phân quyền không hợp lệ (chỉ chấp nhận admin hoặc user)!',
      });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy tài khoản người dùng tương ứng!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi thay đổi vai trò người dùng!',
    });
  }
};

// 3. [DELETE] /api/v1/users/:id - Xóa/Khóa tài khoản người dùng (Chỉ Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    await userService.delete(id, adminId);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa tài khoản người dùng ra khỏi hệ thống thành công!',
    });
  } catch (error) {
    console.error('Lỗi deleteUser:', error);

    if (error.message === 'SELF_ACTION_DENIED') {
      return res.status(400).json({
        status: 'fail',
        message: 'Bạn không thể tự xóa tài khoản của chính mình!',
      });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy tài khoản người dùng cần xóa!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xóa tài khoản người dùng!',
    });
  }
};
