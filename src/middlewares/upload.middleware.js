import multer from 'multer';

// 1. Sử dụng Memory Storage để lưu luồng file trong bộ nhớ RAM, đẩy thẳng lên S3 mà không lưu ổ cứng cục bộ
const storage = multer.memoryStorage();

// 2. Bộ lọc chỉ chấp nhận các định dạng ảnh phổ biến
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên các định dạng ảnh (JPG, JPEG, PNG, WEBP, GIF)!'), false);
  }
};

// 3. Giới hạn dung lượng tối đa 5MB mỗi file ảnh
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
