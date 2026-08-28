import { EntitySchema } from 'typeorm';

// Bảng "carts" – Mỗi User đăng nhập sẽ sở hữu 1 Giỏ hàng duy nhất
export const Cart = new EntitySchema({
  name: 'Cart',
  tableName: 'carts',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
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
    user: {
      type: 'one-to-one',     // 1 User chỉ có 1 Cart
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
  },
});
