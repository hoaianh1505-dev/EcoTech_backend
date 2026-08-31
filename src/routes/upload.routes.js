import express from 'express';
import { uploadSingleImage } from '../controllers/upload.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { protect, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Chỉ cho phép tài khoản Admin đã xác thực được quyền tải ảnh lên AWS S3
router.post(
  '/',
  protect,
  isAdmin,
  upload.single('image'), // Đọc file từ trường name="image" trong multipart/form-data
  uploadSingleImage
);

export default router;
