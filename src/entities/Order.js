import { EntitySchema } from 'typeorm';

// Định nghĩa cấu trúc Bảng "orders" trong Database PostgreSQL
export const Order = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    totalAmount: {
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: false,        // Tổng giá trị đơn hàng (VNĐ)
    },
    status: {
      type: 'enum',
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',     // Trạng thái đơn: pending (chờ duyệt), processing (đang đóng gói), shipped (đang giao), delivered (đã giao), cancelled (hủy)
    },
    paymentStatus: {
      type: 'enum',
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',      // Trạng thái thanh toán: unpaid (chưa trả), paid (đã trả), refunded (đã hoàn tiền)
    },
    paymentMethod: {
      type: 'enum',
      enum: ['cod', 'paypal'],
      default: 'cod',         // Phương thức thanh toán: COD (nhận hàng thanh toán) hoặc PayPal
    },
    shippingAddress: {
      type: 'json',
      nullable: false,        // Lưu thông tin người nhận dưới dạng JSON: { fullName, phone, address, city, note }
    },
    notes: {
      type: 'text',
      nullable: true,         // Ghi chú của khách hàng khi đặt
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
    user: {
      type: 'many-to-one',    // 1 User có thể tạo nhiều Đơn hàng
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'SET NULL',
    },
    orderItems: {
      type: 'one-to-many',    // 1 Đơn hàng chứa nhiều món hàng (xe hơi)
      target: 'OrderItem',
      mappedBy: 'order',
    },
  },
});
