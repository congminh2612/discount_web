import React, { createContext, useContext } from 'react';
import { message } from 'antd';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyDiscount,
  removeDiscount,
  clearCart
} from '../service/cart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const queryClient = useQueryClient();

 const {
  data,
  isLoading: loading,
  error,
  refetch: refreshCart
} = useQuery({
  queryKey: ['cart'],
  queryFn: () => getCart(currentUser?.id),
  enabled: !!currentUser?.id,
  staleTime: 5 * 60 * 1000,
});

const cart = data?.data || null;


  const addItem = async (product, quantity = 1, variantId = null) => {
    try {
      await addToCart({
        user: { id: currentUser.id },
        product_id: product.id,
        variant_id: variantId,
        quantity,
      });
  
      await queryClient.invalidateQueries(['cart']);
      await queryClient.refetchQueries(['cart']);
  
    //   message.success('Item added to cart');
    } catch (err) {
      message.error(err.message || 'Failed to add item to cart');
    }
  };
  
  

  const updateItem = async (itemId, quantity) => {
    try {
      await updateCartItem(itemId, quantity);
      await queryClient.invalidateQueries(['cart']);
      message.success(quantity === 0 ? 'Item removed from cart' : 'Cart updated');
    } catch (err) {
      message.error(err.message || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    if (!itemId) {
      console.warn('❌ removeItem called with invalid id:', itemId);
      message.error('Không thể xóa sản phẩm không hợp lệ');
      return;
    }
  
    try {
      await removeFromCart(itemId);
      await queryClient.invalidateQueries(['cart']);
      message.success('Item removed from cart');
    } catch (err) {
      message.error(err.message || 'Failed to remove item from cart');
    }
  };
  

  const applyDiscountCode = async (discountCode) => {
    try {
      await applyDiscount(currentUser.id, discountCode);
      await queryClient.invalidateQueries(['cart']);
      message.success('Discount applied successfully');
    } catch (err) {
      message.error(err.message || 'Failed to apply discount');
    }
  };

  const removeDiscountCode = async () => {
    try {
      await removeDiscount(currentUser.id);
      await queryClient.invalidateQueries(['cart']);
      message.success('Discount removed');
    } catch (err) {
      message.error(err.message || 'Failed to remove discount');
    }
  };

  const clearAllItems = async () => {
    try {
      await clearCart(currentUser.id);
      await queryClient.invalidateQueries(['cart']);
      message.success('Cart cleared');
    } catch (err) {
      message.error(err.message || 'Failed to clear cart');
    }
  };

  return (
<CartContext.Provider
  value={{
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    applyDiscountCode,
    removeDiscountCode,
    clearAllItems,
    refreshCart,
  }}
>

      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
