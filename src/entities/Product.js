import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "products" trong Database PostgreSQL
export const Product = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 255,
      nullable: false,        // Tên sản phẩm (VD: Xlim Pro 30W, Tokyo Juice Dưa Hấu 30ml)
    },
    slug: {
      type: 'varchar',
      length: 255,
      unique: true,           // URL thân thiện (VD: xlim-pro-30w)
      nullable: false,
    },
    price: {
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: false,        // Giá bán thực tế
    },
    originalPrice: {
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: true,         // Giá gốc trước khi giảm giá (để hiện gạch ngang)
    },
    description: {
      type: 'text',
      nullable: true,         // Bài viết mô tả sản phẩm
    },
    image: {
      type: 'varchar',
      length: 500,
      nullable: true,         // Ảnh đại diện chính
    },
    images: {
      type: 'json',
      nullable: true,         // Mảng danh sách nhiều ảnh gallery chi tiết
    },
    stock: {
      type: 'int',
      default: 0,             // Số lượng còn trong kho
    },
    brand: {
      type: 'varchar',
      length: 100,
      nullable: true,         // Hãng sản xuất (OXVA, Aspire, Tokyo, Vaporesso...)
    },
    nicotine: {
      type: 'varchar',
      length: 50,
      nullable: true,         // Nồng độ Nicotine (VD: 3mg, 30mg, 50mg)
    },
    flavor: {
      type: 'varchar',
      length: 100,
      nullable: true,         // Hương vị (VD: Dưa hấu lạnh, Xoài đào, Bạc hà...)
    },
    isFeatured: {
      type: 'boolean',
      default: false,         // Có phải sản phẩm nổi bật trang chủ không?
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

  // 🔗 THIẾT LẬP QUAN HỆ KHÓA NGOẠI (RELATIONSHIP)
  relations: {
    category: {
      type: 'many-to-one',    // Nhiều sản phẩm thuộc về 1 Danh mục
      target: 'Category',     // Liên kết tới Entity Category
      joinColumn: { name: 'categoryId' }, // Tên cột khóa ngoại trong PostgreSQL
      onDelete: 'SET NULL',   // Nếu xóa danh mục thì cột categoryId của sản phẩm về NULL (không bị mất SP)
    },
  },
});
