import { authService } from '../services/auth.service.js';

// 1. [POST] /api/v1/auth/register - Đăng ký tài khoản mới (Chờ kích hoạt OTP)
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Gọi xuống Service để xử lý tạo User & gửi OTP
    await authService.register({ name, email, password });

    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công! Mã OTP kích hoạt đã được gửi tới hòm thư của bạn. Vui lòng xác thực tài khoản.',
      email, // Trả lại email để Frontend chuyển hướng mang theo
    });
  } catch (error) {
    console.error('Lỗi Register:', error);
    
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

// 2. [POST] /api/v1/auth/verify-email - Xác thực kích hoạt tài khoản
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const result = await authService.verifyEmail({ email, code });

    res.status(200).json({
      status: 'success',
      message: 'Xác thực tài khoản thành công! Đang tự động đăng nhập... 🚀',
      token: result.token,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Lỗi verifyEmail:', error);

    if (error.message === 'MISSING_VERIFY_FIELDS') {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng điền đầy đủ địa chỉ Email và mã OTP!',
      });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy tài khoản tương ứng với Email này!',
      });
    }
    if (error.message === 'ALREADY_VERIFIED') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tài khoản này đã được xác thực trước đó!',
      });
    }
    if (error.message === 'INVALID_CODE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Mã xác minh (OTP) không chính xác!',
      });
    }
    if (error.message === 'EXPIRED_CODE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Mã xác minh đã hết hạn! Vui lòng yêu cầu gửi lại mã mới.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xác thực email!',
    });
  }
};

// 3. [POST] /api/v1/auth/resend-code - Gửi lại mã OTP kích hoạt mới
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    await authService.resendVerificationCode(email);

    res.status(200).json({
      status: 'success',
      message: 'Mã xác thực OTP mới đã được gửi lại thành công!',
    });
  } catch (error) {
    console.error('Lỗi resendCode:', error);

    if (error.message === 'MISSING_EMAIL') {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp địa chỉ Email!',
      });
    }
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy tài khoản với Email này!',
      });
    }
    if (error.message === 'ALREADY_VERIFIED') {
      return res.status(400).json({
        status: 'fail',
        message: 'Tài khoản đã được xác thực trước đó!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra khi gửi lại mã xác minh!',
    });
  }
};

// 4. [POST] /api/v1/auth/login - Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Gọi xuống Service để đăng nhập
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
    // Lỗi chưa kích hoạt email: Trả về mã lỗi code đặc biệt để Frontend biết để chuyển hướng
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      return res.status(403).json({
        status: 'fail',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Tài khoản của bạn chưa kích hoạt! Vui lòng nhập OTP để hoàn tất đăng ký.',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi đăng nhập!',
    });
  }
};

// 5. [GET] /api/v1/auth/me - Lấy thông tin User hiện tại từ Token
export const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
