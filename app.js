import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import productRoutes from './src/routes/product.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import userRoutes from './src/routes/user.routes.js';
import brandRoutes from './src/routes/brand.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import { corsOptions } from './src/config/cors.js';
import { globalLimiter, secureLimiter } from './src/config/rate-limiter.js';

// 1. Khởi tạo Express app
const app = express();

// 2. Middlewares Bảo mật & Hiệu năng
app.use(helmet());
app.use(compression()); // Nén dữ liệu HTTP (Gzip) giảm 80% dung lượng response
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // In log giao dịch API chi tiết

// Áp dụng Rate Limiter chống DDoS
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
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payment', paymentRoutes);

// 4. Xử lý 404 Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.originalUrl} on this server!`
  });
});

// 5. Global Error Handler (Bộ xử lý lỗi tập trung chuẩn Production)
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Có lỗi xảy ra trên máy chủ!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 6. Khởi chạy Server
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
