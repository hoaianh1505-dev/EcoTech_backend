import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.js';
import path from 'path';

// Controller đón luồng file Multer và upload trực tiếp lên AWS S3
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tập tin ảnh cần tải lên!' });
    }

    const file = req.file;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!bucketName) {
      throw new Error('Cấu hình AWS_S3_BUCKET_NAME trống! Vui lòng cập nhật file .env.');
    }

    // 1. Tạo File Key độc nhất để tránh lưu đè tên file
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const fileKey = `uploads/${uniqueFileName}`;

    // 2. Thiết lập tham số tải lên S3
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // 3. Tiến hành gửi lệnh upload lên AWS S3
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // 4. Xây dựng đường dẫn URL công khai của ảnh lưu trữ
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      success: true,
      message: 'Tải ảnh lên AWS S3 thành công!',
      url: imageUrl,
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên AWS S3:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải ảnh lên AWS S3. Vui lòng cấu hình đầy đủ AWS Credentials trong file .env!',
      error: error.message,
    });
  }
};
