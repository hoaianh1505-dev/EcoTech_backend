import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3.js';
import path from 'path';

export const s3Service = {
  // 1. Tải tập tin lên S3 (Nhận file đệm từ Multer)
  uploadFile: async (file, folder = 'uploads') => {
    if (!file) {
      throw new Error('NO_FILE_PROVIDED');
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-southeast-2';

    if (!bucketName) {
      throw new Error('Cấu hình AWS_S3_BUCKET_NAME trống! Vui lòng cập nhật file .env.');
    }

    // Sinh tên file độc nhất
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const fileKey = `${folder}/${uniqueFileName}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

    return {
      url: imageUrl,
      key: fileKey
    };
  },

  // 2. Xóa tập tin khỏi S3 (Nhận vào File Key hoặc Full URL ảnh)
  deleteFile: async (fileKeyOrUrl) => {
    if (!fileKeyOrUrl) return false;

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('Cấu hình AWS_S3_BUCKET_NAME trống! Vui lòng cập nhật file .env.');
    }

    let key = fileKeyOrUrl;

    // Nếu truyền vào Full URL (VD: https://bucket.s3.region.amazonaws.com/uploads/123.png)
    if (fileKeyOrUrl.startsWith('http')) {
      const urlParts = fileKeyOrUrl.split('.amazonaws.com/');
      if (urlParts.length > 1) {
        key = decodeURIComponent(urlParts[1]); // Bóc tách lấy phần key sau domain S3
      }
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return true;
  }
};
