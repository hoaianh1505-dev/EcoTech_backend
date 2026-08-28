import { verifyToken } from '../utils/jwt.js';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';

// Middleware bảo vệ các Route yêu cầu phải Đăng nhập mới được gọi
export const protect = async (req, res, next) => {
  try {
    let token;

    // Lấy Token từ Header (Authorization: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bạn chưa đăng nhập! Vui lòng đăng nhập để thực hiện thao tác này.',
      });
    }

    // Giải mã Token
    const decoded = verifyToken(token);

    // Tìm User trong Database
    const userRepository = AppDataSource.getRepository(User);
    const currentUser = await userRepository.findOneBy({ id: decoded.id });

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Tài khoản thuộc về Token này không còn tồn tại.',
      });
    }

    // Gắn thông tin User vào biến req.user để các controller phía sau dùng
    delete currentUser.password; // Không lưu password trong req.user
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token không hợp lệ hoặc đã hết hạn!',
    });
  }
};

// Middleware kiểm tra Phân quyền Admin
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền thực hiện thao tác này (Yêu cầu quyền Admin)!',
      });
    }
    next();
  };
};
