import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "categories" trong Database PostgreSQL
export const Category = new EntitySchema({
  name: 'Category',
  tableName: 'categories',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,        // Tên danh mục (VD: Pod System, Juice Saltnic)
    },
    slug: {
      type: 'varchar',
      length: 255,
      unique: true,           // Chuỗi đường dẫn thân thiện URL (VD: pod-system, juice-saltnic)
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,         // Mô tả chi tiết danh mục
    },
    image: {
      type: 'varchar',
      length: 500,
      nullable: true,         // Ảnh đại diện của danh mục
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});
