import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import productRoutes from './src/routes/product.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import orderRoutes from './src/routes/order.routes.js';

// 1. Khởi tạo Express app
const app = express();

// 2. Định nghĩa các Rate Limiter bảo mật
// A. Limiter Toàn cục cho tất cả API (100 req / 15 phút)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Nhận thấy quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// B. Limiter Khắt khe cho Đăng nhập/Đăng ký và Chatbot AI (15 req / 1 phút)
const secureLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  message: {
    status: 'fail',
    message: 'Bạn đang thao tác quá nhanh. Vui lòng đợi 1 phút trước khi gửi yêu cầu tiếp theo!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Áp dụng Rate Limiter
app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', secureLimiter);
app.use('/api/v1/auth/register', secureLimiter);
app.use('/api/v1/ai/chat', secureLimiter);

// 3. Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/orders', orderRoutes);

// 4. Route kiểm tra sức khỏe server (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EcoTech Server is running smoothly! 🚀',
    timestamp: new Date().toISOString()
  });
});

// 4. Xử lý 404 Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server!`
  });
});

// 5. Khởi chạy Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Kết nối Database
  
  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
    console.log(`=================================`);
  });
};

startServer();
