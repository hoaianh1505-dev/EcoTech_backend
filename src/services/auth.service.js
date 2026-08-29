import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { Cart } from '../entities/Cart.js';
import { generateToken } from '../utils/jwt.js';

export const authService = {
  // 1. Logic Đăng ký tài khoản mới & tự động tạo giỏ hàng
  register: async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('MISSING_FIELDS');
    }

    if (password.length < 6) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    const userRepository = AppDataSource.getRepository(User);
    const cartRepository = AppDataSource.getRepository(Cart);

    // Kiểm tra trùng Email
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      throw new Error('EMAIL_EXISTS');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await userRepository.save(newUser);

    // Tạo giỏ hàng đi kèm
    const newCart = cartRepository.create({ user: savedUser });
    await cartRepository.save(newCart);

    // Sinh Token
    const token = generateToken({ id: savedUser.id, role: savedUser.role });
    
    delete savedUser.password;
    return { token, user: savedUser };
  },

  // 2. Logic Đăng nhập & So khớp mật khẩu đã hash
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('MISSING_FIELDS');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });
    
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = generateToken({ id: user.id, role: user.role });
    
    delete user.password;
    return { token, user };
  }
};
