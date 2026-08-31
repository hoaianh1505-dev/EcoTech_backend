import { cartService } from '../services/cart.service.js';

// 1. Lấy thông tin giỏ hàng hiện tại
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);

    res.status(200).json({
      status: 'success',
      data: {
        cart,
      },
    });
  } catch (error) {
    console.error('Lỗi getCart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi lấy thông tin giỏ hàng!',
    });
  }
};

// 2. Thêm xe hơi vào giỏ hàng
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cartItem = await cartService.addToCart(userId, productId, quantity || 1);

    res.status(200).json({
      status: 'success',
      message: 'Đã thêm mẫu xe vào giỏ hàng thành công! 🛒',
      data: {
        cartItem,
      },
    });
  } catch (error) {
    console.error('Lỗi addToCart:', error);

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy dòng xe này trên hệ thống!',
      });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        status: 'fail',
        message: 'Số lượng đặt xe vượt quá số lượng sẵn có trong kho hàng!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi thêm xe vào giỏ hàng!',
    });
  }
};

// 3. Thay đổi số lượng đặt xe
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItemId
    const { quantity } = req.body;

    const updatedItem = await cartService.updateCartItem(userId, id, quantity);

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật số lượng xe thành công!',
      data: {
        cartItem: updatedItem,
      },
    });
  } catch (error) {
    console.error('Lỗi updateCartItem:', error);

    if (error.message === 'CART_ITEM_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy dòng chi tiết giỏ hàng này!',
      });
    }
    if (error.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        status: 'fail',
        message: 'Số lượng điều chỉnh vượt quá giới hạn xe có sẵn trong showroom!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi cập nhật giỏ hàng!',
    });
  }
};

// 4. Xóa sản phẩm khỏi giỏ hàng
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cartItemId

    await cartService.removeFromCart(userId, id);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa mẫu xe khỏi giỏ hàng!',
    });
  } catch (error) {
    console.error('Lỗi removeFromCart:', error);

    if (error.message === 'CART_ITEM_NOT_FOUND') {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy sản phẩm cần xóa trong giỏ hàng!',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi xóa xe khỏi giỏ hàng!',
    });
  }
};

// 5. Dọn sạch giỏ hàng
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await cartService.clearCart(userId);

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa sạch giỏ hàng thành công!',
    });
  } catch (error) {
    console.error('Lỗi clearCart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Có lỗi xảy ra trên Server khi dọn dẹp giỏ hàng!',
    });
  }
};
