import { AppDataSource } from '../config/data-source.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { Product } from '../entities/Product.js';

// Lớp dịch vụ xử lý toàn bộ logic nghiệp vụ Đặt xe
export const orderService = {
  
  // 1. Tạo đơn đặt cọc xe mới (Xử lý Transaction)
  createOrder: async (userId, { items, shippingAddress, paymentMethod, notes }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepository = queryRunner.manager.getRepository(Product);
      const orderRepository = queryRunner.manager.getRepository(Order);
      const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

      let totalAmount = 0;
      const orderItemsToSave = [];
      const productsToUpdate = [];

      // Kiểm tra tồn kho từng sản phẩm xe
      for (const item of items) {
        const { productId, quantity } = item;

        const product = await productRepository.findOneBy({ id: productId });
        if (!product) {
          throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
        }

        if (product.stock < quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}:${product.stock}`);
        }

        const itemPrice = Number(product.price);
        totalAmount += itemPrice * quantity;

        // Giảm tồn kho
        product.stock -= quantity;
        productsToUpdate.push(product);

        const orderItem = orderItemRepository.create({
          quantity,
          price: itemPrice,
          product,
        });
        orderItemsToSave.push(orderItem);
      }

      // Tạo đơn hàng chính
      const newOrder = orderRepository.create({
        totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'cod',
        notes,
        user: { id: userId },
      });

      const savedOrder = await orderRepository.save(newOrder);

      // Lưu chi tiết các xe đặt cọc
      for (const orderItem of orderItemsToSave) {
        orderItem.order = savedOrder;
        await orderItemRepository.save(orderItem);
      }

      // Lưu lại thay đổi tồn kho xe
      for (const product of productsToUpdate) {
        await productRepository.save(product);
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  },

  // 2. Lấy danh sách lịch sử đặt cọc của người dùng
  getMyOrders: async (userId) => {
    const orderRepository = AppDataSource.getRepository(Order);
    return await orderRepository.find({
      where: { user: { id: userId } },
      relations: {
        orderItems: {
          product: true
        }
      },
      order: { createdAt: 'DESC' },
    });
  },

  // 3. Lấy thông tin đơn hàng cụ thể theo ID
  getOrderById: async (orderId, userId, userRole) => {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: {
        user: true,
        orderItems: {
          product: true
        }
      },
    });

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    // Bảo mật: check quyền
    if (order.user.id !== userId && userRole !== 'admin') {
      throw new Error('FORBIDDEN');
    }

    return order;
  },

  // 4. Lấy tất cả đơn đặt cọc toàn showroom (Cho Admin)
  getAllOrders: async () => {
    const orderRepository = AppDataSource.getRepository(Order);
    return await orderRepository.find({
      relations: {
        user: true,
        orderItems: {
          product: true
        }
      },
      order: { createdAt: 'DESC' },
    });
  },

  // 5. Cập nhật trạng thái duyệt đặt cọc (Cho Admin)
  updateOrderStatus: async (orderId, { status, paymentStatus }) => {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    return await orderRepository.save(order);
  }
};
