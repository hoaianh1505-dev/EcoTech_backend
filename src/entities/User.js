import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "users" trong Database PostgreSQL
export const User = new EntitySchema({
  name: 'User',
  tableName: 'users', // Tên bảng trong PostgreSQL
  columns: {
    id: {
      primary: true,          // Khóa chính (Primary Key)
      type: 'int',            // Kiểu số nguyên
      generated: true,        // Tự động tăng (Auto Increment: 1, 2, 3...)
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,        // Không được để trống
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,           // Email là duy nhất, không trùng lặp
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,        // Mật khẩu đã được mã hóa Bcrypt
    },
    role: {
      type: 'enum',
      enum: ['user', 'admin'],// Phân quyền: Người dùng thường hoặc Admin
      default: 'user',        // Mặc định là user
    },
    avatar: {
      type: 'varchar',
      length: 500,
      nullable: true,         // Có thể để trống (chưa có ảnh đại diện)
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,       // Tự động lưu ngày giờ tạo tài khoản
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,       // Tự động cập nhật ngày giờ khi sửa thông tin
    },
  },
});
