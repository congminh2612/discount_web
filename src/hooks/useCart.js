import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import {
  fetchCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  emptyCart,
  applyDiscountCode,
  resetCartError
} from '@/context/slice/cart';

/**
 * Custom hook to manage cart operations
 * @returns {Object} Cart operations and state
 */
const useCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);

  /**
   * Add an item to the cart
   * @param {Object} product - The product to add
   * @param {number} quantity - Quantity to add
   * @param {number} variantId - Optional variant ID
   */
  const addToCart = async (product, quantity = 1, variantId = null) => {
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/sign-in');
      return;
    }

    // If product has variants but no variant is selected, navigate to product page
    if (product.has_variant && !variantId) {
      message.info('Vui lòng chọn biến thể sản phẩm');
      navigate(`/product/${product.id}`);
      return;
    }

    const payload = {
      user: { id: currentUser.id },
      product_id: product.id,
      variant_id: variantId,
      quantity
    };

    try {
      await dispatch(addItemToCart(payload)).unwrap();
      message.success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (error) {
      message.error(error || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  /**
   * Update the quantity of a cart item
   * @param {number} cartItemId - ID of the cart item
   * @param {number} quantity - New quantity
   */
  const updateItemQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;

    try {
      await dispatch(updateCartItemQuantity({ cartItemId, quantity })).unwrap();
    } catch (error) {
      message.error(error || 'Không thể cập nhật số lượng sản phẩm');
    }
  };

  /**
   * Remove an item from the cart
   * @param {number} cartItemId - ID of the cart item to remove
   */
  const removeItem = async (cartItemId) => {
    try {
      await dispatch(removeCartItem(cartItemId)).unwrap();
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      message.error(error || 'Không thể xóa sản phẩm khỏi giỏ hàng');
    }
  };

  /**
   * Clear the entire cart
   */
  const clearCart = async () => {
    try {
      await dispatch(emptyCart()).unwrap();
      message.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      message.error(error || 'Không thể xóa giỏ hàng');
    }
  };

  /**
   * Apply a discount code to the cart
   * @param {string} code - Discount code to apply
   */
  const applyDiscount = async (code) => {
    if (!code) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      await dispatch(applyDiscountCode(code)).unwrap();
      message.success('Áp dụng mã giảm giá thành công');
    } catch (error) {
      message.error(error || 'Không thể áp dụng mã giảm giá');
    }
  };

  /**
   * Refresh the cart data
   */
  const refreshCart = () => {
    if (currentUser?.id) {
      dispatch(fetchCart(currentUser.id));
    }
  };

  /**
   * Navigate to the cart page
   */
  const goToCart = () => {
    navigate('/cart');
  };

  /**
   * Navigate to checkout
   */
  const goToCheckout = () => {
    if (cart.items.length === 0) {
      message.warning('Giỏ hàng của bạn đang trống');
      return;
    }
    navigate('/checkout');
  };

  /**
   * Clear any cart errors
   */
  const clearErrors = () => {
    dispatch(resetCartError());
  };

  return {
    cart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    refreshCart,
    goToCart,
    goToCheckout,
    clearErrors,
    isLoading: cart.status === 'loading',
    hasError: cart.status === 'failed',
    error: cart.error
  };
};

export default useCart;