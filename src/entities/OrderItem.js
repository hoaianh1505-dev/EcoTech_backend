import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "order_items" trong Database PostgreSQL
export const OrderItem = new EntitySchema({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    quantity: {
      type: 'int',
      nullable: false,        // Số lượng sản phẩm mua
    },
    price: {
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: false,        // Giá sản phẩm tại thời điểm chốt đơn
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
  },

  // 🔗 THIẾT LẬP QUAN HỆ KHÓA NGOẠI (RELATIONSHIP)
  relations: {
    order: {
      type: 'many-to-one',    // Nhiều món hàng thuộc về 1 Đơn hàng
      target: 'Order',
      joinColumn: { name: 'orderId' },
      onDelete: 'CASCADE',    // Nếu đơn hàng bị xóa -> các món hàng trong đơn tự động xóa theo
    },
    product: {
      type: 'many-to-one',    // Liên kết với sản phẩm được mua
      target: 'Product',
      joinColumn: { name: 'productId' },
      onDelete: 'SET NULL',
    },
  },
});
