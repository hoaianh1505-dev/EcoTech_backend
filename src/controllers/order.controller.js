import { orderService } from '../services/order.service.js';

// 1. [POST] /api/v1/orders - Tạo đơn đặt hàng/Đặt cọc xe mới
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    // Gọi xuống lớp Service để xử lý nghiệp vụ sâu & Transaction
    const savedOrder = await orderService.createOrder(req.user.id, {
      items,
      shippingAddress,
      paymentMethod,
      notes,
    });

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
    console.error('Lỗi createOrder:', error);
    
    // Bắt lỗi cụ thể ném ra từ Service
    if (error.message.startsWith('PRODUCT_NOT_FOUND')) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy mẫu xe hơi yêu cầu!',
      });
    }
    if (error.message.startsWith('INSUFFICIENT_STOCK')) {
      const parts = error.message.split(':');
      return res.status(400).json({
        status: 'fail',
        message: `Mẫu xe '${parts[1]}' hiện chỉ còn lại ${parts[2]} chiếc trong kho, không đủ số lượng đặt!`,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xử lý đặt hàng!',
    });
  }
};

// 2. [GET] /api/v1/orders/my-orders - Lấy danh sách lịch sử đặt xe của cá nhân
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    
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

// 3. [GET] /api/v1/orders/:id - Xem chi tiết 1 đơn đặt cọc xe
export const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(
      Number(req.params.id),
      req.user.id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (error) {
    console.error('Lỗi getOrderById:', error);
    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy đơn hàng này!',
      });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền truy cập thông tin đơn đặt xe này!',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Lỗi lấy thông tin chi tiết đơn hàng!',
    });
  }
};

// 4. [GET] /api/v1/orders - Xem toàn bộ danh sách đặt xe toàn Showroom (Chỉ Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

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
    const updatedOrder = await orderService.updateOrderStatus(
      Number(req.params.id),
      req.body
    );

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật trạng thái đặt cọc thành công! 🎉',
      data: {
        order: updatedOrder,
      },
    });
  } catch (error) {
    console.error('Lỗi updateOrderStatus:', error);
    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy đơn đặt hàng để cập nhật!',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi cập nhật trạng thái!',
    });
  }
};
