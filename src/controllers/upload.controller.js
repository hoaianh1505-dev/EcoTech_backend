import { s3Service } from '../services/s3.service.js';

// Controller đón luồng file Multer và upload trực tiếp lên AWS S3
export const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn tập tin ảnh cần tải lên!' });
    }

    // Gọi lớp nghiệp vụ S3 Service để thực hiện upload
    const result = await s3Service.uploadFile(req.file);

    return res.status(200).json({
      success: true,
      message: 'Tải ảnh lên AWS S3 thành công!',
      url: result.url,
      key: result.key
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
