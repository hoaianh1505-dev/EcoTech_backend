import { AppDataSource } from './data-source.js';

// Hàm khởi tạo và kết nối tới PostgreSQL
export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully via TypeORM!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Tắt server nếu không kết nối được DB
  }
};
