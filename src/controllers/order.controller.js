import { AppDataSource } from '../config/data-source.js';
import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { Product } from '../entities/Product.js';

// 1. [POST] /api/v1/orders - Tạo đơn đặt hàng/Đặt cọc xe mới (Có Transaction bảo vệ dữ liệu)
export const createOrder = async (req, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction(); // Khởi tạo Transaction

  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // A. Kiểm tra dữ liệu đầu vào cơ bản
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp ít nhất một sản phẩm xe hơi để đặt hàng!',
      });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp đầy đủ thông tin người nhận (Họ tên, SĐT, Địa chỉ, Thành phố)!',
      });
    }

    const productRepository = queryRunner.manager.getRepository(Product);
    const orderRepository = queryRunner.manager.getRepository(Order);
    const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

    let totalAmount = 0;
    const orderItemsToSave = [];
    const productsToUpdate = [];

    // B. Kiểm tra tồn kho và tính tổng tiền thực tế từ DB
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          status: 'fail',
          message: 'Thông tin sản phẩm hoặc số lượng không hợp lệ!',
        });
      }

      // Lấy trực tiếp xe hơi từ database
      const product = await productRepository.findOneBy({ id: productId });
      if (!product) {
        await queryRunner.rollbackTransaction();
        return res.status(404).json({
          status: 'fail',
          message: `Không tìm thấy sản phẩm xe hơi với ID: ${productId}!`,
        });
      }

      // Kiểm tra lượng xe còn trong Showroom
      if (product.stock < quantity) {
        await queryRunner.rollbackTransaction();
        return res.status(400).json({
          status: 'fail',
          message: `Mẫu xe '${product.name}' hiện chỉ còn lại ${product.stock} chiếc trong kho, không đủ số lượng đặt (${quantity} chiếc)!`,
        });
      }

      const itemPrice = Number(product.price);
      totalAmount += itemPrice * quantity;

      // Giảm stock của xe
      product.stock -= quantity;
      productsToUpdate.push(product);

      // Chuẩn bị lưu OrderItem
      const orderItem = orderItemRepository.create({
        quantity,
        price: itemPrice,
        product,
      });
      orderItemsToSave.push(orderItem);
    }

    // C. Lưu đơn hàng chính (Order)
    const newOrder = orderRepository.create({
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      notes,
      user: { id: req.user.id }, // Liên kết với User đang đăng nhập
    });

    const savedOrder = await orderRepository.save(newOrder);

    // D. Lưu danh sách món hàng trong đơn và cập nhật tồn kho sản phẩm
    for (const orderItem of orderItemsToSave) {
      orderItem.order = savedOrder; // Gán khóa ngoại liên kết
      await orderItemRepository.save(orderItem);
    }

    for (const product of productsToUpdate) {
      await productRepository.save(product);
    }

    // Cam kết Transaction thành công
    await queryRunner.commitTransaction();

    res.status(201).json({
      status: 'success',
      message: 'Đặt xe thành công! Đại diện Showroom sẽ liên hệ bạn sớm nhất để xác nhận đặt cọc. 🎉',
      data: {
        orderId: savedOrder.id,
        totalAmount: savedOrder.totalAmount,
        status: savedOrder.status,
      },
    });
  } catch (error) {
    console.error('Lỗi createOrder (Transaction Rollbacked):', error);
    await queryRunner.rollbackTransaction(); // Quay lui dữ liệu nếu có lỗi xảy ra
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xử lý đặt hàng!',
    });
  } finally {
    await queryRunner.release(); // Giải phóng kết nối queryRunner
  }
};

// 2. [GET] /api/v1/orders/my-orders - Lấy danh sách lịch sử đặt xe của cá nhân
export const getMyOrders = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    
    // Tìm các đơn hàng thuộc về userId của người dùng hiện tại
    const orders = await orderRepository.find({
      where: { user: { id: req.user.id } },
      relations: ['orderItems', 'orderItems.product'], // Lấy kèm chi tiết món hàng & thông tin xe
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Lỗi getMyOrders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy lịch sử đặt xe!',
    });
  }
};

// 3. [GET] /api/v1/orders/:id - Xem chi tiết 1 đơn đặt cọc xe (Yêu cầu chính chủ hoặc Admin)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderRepository = AppDataSource.getRepository(Order);

    const order = await orderRepository.findOne({
      where: { id: Number(id) },
      relations: ['user', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy đơn hàng này!',
      });
    }

    // Bảo mật: Chỉ cho phép Admin hoặc chính chủ đơn hàng xem
    if (order.user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền truy cập thông tin đơn đặt xe này!',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    console.error('Lỗi getOrderById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi lấy thông tin chi tiết đơn hàng!',
    });
  }
};

// 4. [GET] /api/v1/orders - Xem toàn bộ danh sách đặt xe toàn Showroom (Chỉ Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository(Order);
    const orders = await orderRepository.find({
      relations: ['user', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (error) {
    console.error('Lỗi getAllOrders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi Server khi tải toàn bộ danh sách đặt xe!',
    });
  }
};

// 5. [PATCH] /api/v1/orders/:id - Cập nhật Trạng thái đặt xe hoặc thanh toán cọc (Chỉ Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOneBy({ id: Number(id) });

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy đơn đặt hàng để cập nhật!',
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updatedOrder = await orderRepository.save(order);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái đặt cọc thành công! 🎉',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error('Lỗi updateOrderStatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi cập nhật trạng thái!',
    });
  }
};
