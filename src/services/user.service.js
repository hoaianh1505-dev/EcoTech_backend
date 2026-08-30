import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';

export const userService = {
  // 1. Lấy toàn bộ danh sách User đăng ký (Chỉ Admin)
  getAll: async () => {
    const userRepository = AppDataSource.getRepository(User);
    
    // Lấy toàn bộ người dùng và sắp xếp mới nhất lên đầu
    return await userRepository.find({
      select: ['id', 'name', 'email', 'role', 'avatar', 'isVerified', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  },

  // 2. Cập nhật phân quyền tài khoản (Nâng/Hạ quyền Admin)
  updateRole: async (id, role, adminId) => {
    // Chốt chặn 1: Không được tự thao tác trên tài khoản của chính mình
    if (Number(id) === Number(adminId)) {
      throw new Error('SELF_ACTION_DENIED');
    }

    if (!['user', 'admin'].includes(role)) {
      throw new Error('INVALID_ROLE');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: Number(id) });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    user.role = role;
    const updatedUser = await userRepository.save(user);

    delete updatedUser.password;
    return updatedUser;
  },

  // 3. Xóa tài khoản khách hàng (Chỉ Admin)
  delete: async (id, adminId) => {
    // Chốt chặn 2: Không được tự xóa tài khoản của chính mình
    if (Number(id) === Number(adminId)) {
      throw new Error('SELF_ACTION_DENIED');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: Number(id) });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return await userRepository.remove(user);
  }
};
