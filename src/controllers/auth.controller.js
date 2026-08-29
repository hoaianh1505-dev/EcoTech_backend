import { authService } from '../services/auth.service.js';

// 1. [POST] /api/v1/auth/register - Đăng ký tài khoản mới
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Gọi xuống Service để xử lý tạo User
    const result = await authService.register({ name, email, password });

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công! 🎉',
      token: result.token,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Lỗi Register:', error);
    
    // Phản hồi mã lỗi nghiệp vụ phù hợp
    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu!',
      });
    }
    if (error.message === 'PASSWORD_TOO_SHORT') {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu phải có ít nhất 6 ký tự!',
      });
    }
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Email này đã được sử dụng. Vui lòng chọn Email khác!',
      });
    }

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
    
    // Gọi xuống Service để xác thực đăng nhập
    const result = await authService.login({ email, password });

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công! 🚀',
      token: result.token,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Lỗi Login:', error);

    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng nhập Email và Mật khẩu!',
      });
    }
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc Mật khẩu không chính xác!',
      });
    }

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
