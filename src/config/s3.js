import { S3Client } from '@aws-sdk/client-s3';

// Khởi tạo kết nối AWS S3 Client sử dụng SDK v3 chính hãng
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1', // Ví dụ: ap-southeast-1 (Singapore)
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
