import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ecotech_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Tạo JWT Token cho User khi Login/Register thành công
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Kiểm tra Token gửi lên từ Client có hợp lệ không
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
