import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { Cart } from '../entities/Cart.js';
import { generateToken } from '../utils/jwt.js';
import { emailService } from './email.service.js';

export const authService = {
  // 1. Đăng ký tài khoản (Tự động sinh mã OTP & Gửi Email)
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

    // Sinh mã OTP ngẫu nhiên gồm 6 chữ số (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // Mã có hiệu lực trong 15 phút

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false, // Tài khoản tạm thời chưa được kích hoạt
      verificationCode: otp,
      verificationExpires: otpExpires,
    });

    const savedUser = await userRepository.save(newUser);

    // Tạo giỏ hàng đi kèm
    const newCart = cartRepository.create({ user: savedUser });
    await cartRepository.save(newCart);

    // Gửi email xác thực chứa mã OTP (Gọi bất đồng bộ, không chặn luồng đăng ký)
    emailService.sendVerificationEmail(email, name, otp);

    delete savedUser.password;
    delete savedUser.verificationCode;
    delete savedUser.verificationExpires;

    return savedUser;
  },

  // 2. Xác thực Email kích hoạt tài khoản
  verifyEmail: async ({ email, code }) => {
    if (!email || !code) {
      throw new Error('MISSING_VERIFY_FIELDS');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.isVerified) {
      throw new Error('ALREADY_VERIFIED');
    }

    // Kiểm tra tính chính xác của OTP
    if (user.verificationCode !== code.trim()) {
      throw new Error('INVALID_CODE');
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.verificationExpires)) {
      throw new Error('EXPIRED_CODE');
    }

    // Kích hoạt tài khoản thành công
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationExpires = null;

    const activatedUser = await userRepository.save(user);

    // Cấp Token đăng nhập tự động ngay sau khi kích hoạt thành công
    const token = generateToken({ id: activatedUser.id, role: activatedUser.role });

    delete activatedUser.password;
    return { token, user: activatedUser };
  },

  // 3. Gửi lại mã OTP mới
  resendVerificationCode: async (email) => {
    if (!email) {
      throw new Error('MISSING_EMAIL');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    if (user.isVerified) {
      throw new Error('ALREADY_VERIFIED');
    }

    // Sinh mã OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = otp;
    user.verificationExpires = otpExpires;

    await userRepository.save(user);

    // Gửi lại Email xác thực mới
    emailService.sendVerificationEmail(email, user.name, otp);

    return true;
  },

  // 4. Đăng nhập (Chặn đăng nhập nếu chưa xác thực email)
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('MISSING_FIELDS');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });
    
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Kiểm tra xem tài khoản đã kích hoạt email chưa
    if (!user.isVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = generateToken({ id: user.id, role: user.role });
    
    delete user.password;
    delete user.verificationCode;
    delete user.verificationExpires;
    
    return { token, user };
  }
};
