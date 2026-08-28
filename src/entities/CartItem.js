import { EntitySchema } from 'typeorm';

// Bảng "cart_items" – Chi tiết các món hàng đang nằm trong giỏ
export const CartItem = new EntitySchema({
  name: 'CartItem',
  tableName: 'cart_items',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    quantity: {
      type: 'int',
      default: 1,             // Số lượng chọn mua
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
  relations: {
    cart: {
      type: 'many-to-one',
      target: 'Cart',
      joinColumn: { name: 'cartId' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'productId' },
      onDelete: 'CASCADE',
    },
  },
});
