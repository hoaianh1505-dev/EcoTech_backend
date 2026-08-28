import { EntitySchema } from 'typeorm';

// Bảng "reviews" – Đánh giá ⭐ và Bình luận của khách hàng về sản phẩm
export const Review = new EntitySchema({
  name: 'Review',
  tableName: 'reviews',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    rating: {
      type: 'int',
      nullable: false,        // Đánh giá từ 1 đến 5 sao ⭐
    },
    comment: {
      type: 'text',
      nullable: true,         // Nội dung nhận xét
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
      type: 'many-to-one',    // Ai viết đánh giá này?
      target: 'User',
      joinColumn: { name: 'userId' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',    // Đánh giá cho sản phẩm nào?
      target: 'Product',
      joinColumn: { name: 'productId' },
      onDelete: 'CASCADE',
    },
  },
});
