import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import productRoutes from './src/routes/product.routes.js';

// 1. Khởi tạo Express app
const app = express();

// 2. Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 3. Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

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
