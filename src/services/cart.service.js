import { AppDataSource } from '../config/data-source.js';
import { Cart } from '../entities/Cart.js';
import { CartItem } from '../entities/CartItem.js';
import { Product } from '../entities/Product.js';

const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const productRepository = AppDataSource.getRepository(Product);

export const cartService = {
  // 1. Lấy giỏ hàng hiện có của khách hàng (kèm thông tin chi tiết xe)
  getCart: async (userId) => {
    // Lấy giỏ hàng chính
    let cart = await cartRepository.findOne({
      where: { user: { id: Number(userId) } }
    });

    // Nếu chưa có giỏ hàng (tự động tạo mới)
    if (!cart) {
      cart = cartRepository.create({ user: { id: Number(userId) } });
      await cartRepository.save(cart);
    }

    // Truy vấn lấy danh sách chi tiết các xe trong giỏ
    const items = await cartItemRepository.find({
      where: { cart: { id: cart.id } },
      relations: {
        product: {
          brand: true,
          category: true
        }
      },
      order: { createdAt: 'DESC' }
    });

    return {
      id: cart.id,
      userId: Number(userId),
      items
    };
  },

  // 2. Thêm xe hơi vào giỏ hàng
  addToCart: async (userId, productId, quantity = 1) => {
    const cartData = await cartService.getCart(userId);
    const cart = await cartRepository.findOneBy({ id: cartData.id });
    const product = await productRepository.findOneBy({ id: Number(productId) });

    if (!product) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    if (product.stock < Number(quantity)) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    // Tìm xem mẫu xe này đã có trong giỏ hàng trước đó chưa
    let cartItem = await cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: product.id }
      }
    });

    if (cartItem) {
      // Nếu có rồi thì cộng dồn số lượng đặt mua
      const newQuantity = cartItem.quantity + Number(quantity);
      if (product.stock < newQuantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      cartItem.quantity = newQuantity;
    } else {
      // Nếu chưa có thì tạo dòng chi tiết mới
      cartItem = cartItemRepository.create({
        cart,
        product,
        quantity: Number(quantity)
      });
    }

    return await cartItemRepository.save(cartItem);
  },

  // 3. Thay đổi số lượng đặt mua của 1 xe trong giỏ hàng
  updateCartItem: async (userId, cartItemId, quantity) => {
    const cartData = await cartService.getCart(userId);
    const cartItem = await cartItemRepository.findOne({
      where: {
        id: Number(cartItemId),
        cart: { id: cartData.id }
      },
      relations: { product: true }
    });

    if (!cartItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    if (cartItem.product.stock < Number(quantity)) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    cartItem.quantity = Number(quantity);
    return await cartItemRepository.save(cartItem);
  },

  // 4. Xóa 1 xe ra khỏi giỏ hàng
  removeFromCart: async (userId, cartItemId) => {
    const cartData = await cartService.getCart(userId);
    const cartItem = await cartItemRepository.findOne({
      where: {
        id: Number(cartItemId),
        cart: { id: cartData.id }
      }
    });

    if (!cartItem) {
      throw new Error('CART_ITEM_NOT_FOUND');
    }

    return await cartItemRepository.remove(cartItem);
  },

  // 5. Làm sạch giỏ hàng (Xóa tất cả)
  clearCart: async (userId) => {
    const cartData = await cartService.getCart(userId);
    const items = await cartItemRepository.find({
      where: { cart: { id: cartData.id } }
    });

    if (items.length > 0) {
      await cartItemRepository.remove(items);
    }
    return true;
  }
};
