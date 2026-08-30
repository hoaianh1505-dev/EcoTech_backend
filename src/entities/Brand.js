import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "brands" (Hãng xe) trong Database PostgreSQL
export const Brand = new EntitySchema({
  name: 'Brand',
  tableName: 'brands',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,        // Tên hãng xe (Ví dụ: Porsche, Tesla, VinFast)
    },
    slug: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,        // URL thân thiện của hãng (Ví dụ: porsche, tesla)
    },
    logo: {
      type: 'varchar',
      length: 500,
      nullable: true,         // Ảnh Logo hãng xe
    },
    description: {
      type: 'text',
      nullable: true,         // Mô tả hoặc lịch sử hãng xe
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
