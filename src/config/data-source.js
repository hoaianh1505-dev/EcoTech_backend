import 'dotenv/config';
import { DataSource } from 'typeorm';

// Cấu hình kết nối PostgreSQL sử dụng TypeORM
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USER || 'ecotech',
  password: process.env.POSTGRES_PASSWORD || 'ecotech123',
  database: process.env.POSTGRES_DB || 'ecotech_dev',

  // synchronize: true -> Tự động tạo/cập nhật bảng trong DB khi khai báo Entity (Rất tiện khi Dev)
  synchronize: true,
  logging: false,

  // Chỉ định đường dẫn chứa các Entities & Migrations
  entities: ['src/entities/*.js'],
  migrations: ['src/migrations/*.js'],
});
