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
import userRoutes from './src/routes/user.routes.js';
import brandRoutes from './src/routes/brand.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import { corsOptions } from './src/config/cors.js';

// 1. Khởi tạo Express app
const app = express();

// 2. Định nghĩa các Rate Limiter bảo mật
// A. Limiter Toàn cục cho tất cả API (5000 req khi dev / 100 req khi prod)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  message: {
    status: 'fail',
    message: 'Nhận thấy quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// B. Limiter Khắt khe cho Đăng nhập/Đăng ký và Chatbot AI
const secureLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 15,
  message: {
    status: 'fail',
    message: 'Bạn đang thao tác quá nhanh. Vui lòng đợi 1 phút trước khi gửi yêu cầu tiếp theo!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Middlewares
app.use(helmet());
app.use(cors(corsOptions));
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
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload', uploadRoutes);

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
