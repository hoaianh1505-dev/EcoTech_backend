import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import { Cart } from '../entities/Cart.js';
import { generateToken } from '../utils/jwt.js';

// 1. [POST] /api/v1/auth/register - Đăng ký tài khoản mới
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate dữ liệu đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu!',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu phải có ít nhất 6 ký tự!',
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const cartRepository = AppDataSource.getRepository(Cart);

    // Kiểm tra xem Email đã được đăng ký chưa
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email này đã được sử dụng. Vui lòng chọn Email khác!',
      });
    }

    // Mã hóa Mật khẩu bằng Bcrypt (salt = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo User mới trong DB
    const newUser = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Mặc định là khách hàng
    });

    const savedUser = await userRepository.save(newUser);

    // Tự động tạo 1 Giỏ hàng (Cart) gắn với User này
    const newCart = cartRepository.create({ user: savedUser });
    await cartRepository.save(newCart);

    // Tạo JWT Token
    const token = generateToken({ id: savedUser.id, role: savedUser.role });

    // Cắt bỏ password trước khi trả về Client
    delete savedUser.password;

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công! 🎉',
      token,
      data: {
        user: savedUser,
      },
    });
  } catch (error) {
    console.error('Lỗi Register:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi đăng ký!',
    });
  }
};

// 2. [POST] /api/v1/auth/login - Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng nhập Email và Mật khẩu!',
      });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Tìm User theo Email
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc Mật khẩu không chính xác!',
      });
    }

    // So sánh Mật khẩu vừa nhập với Mật khẩu đã hash trong DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc Mật khẩu không chính xác!',
      });
    }

    // Tạo Token
    const token = generateToken({ id: user.id, role: user.role });

    delete user.password;

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công! 🚀',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Lỗi Login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi đăng nhập!',
    });
  }
};

// 3. [GET] /api/v1/auth/me - Lấy thông tin User hiện tại từ Token
export const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
