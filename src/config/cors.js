import 'dotenv/config';

// Danh sách các Domain (Origins) được phép gửi request đến Backend
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

// Thêm tên miền thực tế (nếu được cấu hình trong file .env)
if (process.env.CLIENT_URL) {
  // Hỗ trợ cấu hình nhiều domain cách nhau bởi dấu phẩy
  const clientUrls = process.env.CLIENT_URL.split(',').map(url => url.trim());
  whitelist.push(...clientUrls);
}

export const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép các request không có header origin (như Postman, thiết bị di động)
    // hoặc các request đến từ các domain nằm trong whitelist
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS policy of EcoTech! Origin ${origin} is not allowed.`));
    }
  },
  credentials: true, // Cho phép đính kèm cookie và thông tin chứng thực (Auth Headers)
  optionsSuccessStatus: 200 // Hỗ trợ tương thích với các trình duyệt cũ (như IE11)
};
