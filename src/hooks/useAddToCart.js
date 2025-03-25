import { useCallback, useState } from 'react';
import { message } from 'antd';
import { useCart } from '../context/CartContext';

export const useAddToCart = () => {
  const { addItem, cart } = useCart();
  const [loading, setLoading] = useState(false);

  /**
   * Add a product to the cart
   * @param {Object} product - The product to add
   * @param {number} quantity - The quantity to add
   * @param {number|null} variantId - Optional variant ID
   */
  const handleAddToCart = useCallback(async (product, quantity = 1, variantId = null) => {
    if (!product) {
      message.error('Invalid product data');
      return false;
    }

    if (!product.stock_quantity || product.stock_quantity === 0) {
      message.error('Product is out of stock');
      return false;
    }

    try {
      setLoading(true);
      
      const productData = {
        id: product.id,
        name: product.name,
        image_url: product.image_url,
        final_price: product.final_price,
        original_price: product.original_price,
        stock_quantity: product.stock_quantity
      };

      await addItem(productData, quantity, variantId);
      return true;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [addItem]);

  /**
   * Get the current quantity of a specific product in the cart
   * @param {number} productId - The product ID
   * @param {number|null} variantId - Optional variant ID
   * @returns {number} The quantity currently in cart
   */
  const getCartQuantity = useCallback((productId, variantId = null) => {
    if (!cart || !cart.items) return 0;

    const cartItem = cart.items.find(item => 
      item.product_id === productId && 
      (variantId ? item.variant_id === variantId : !item.variant_id)
    );

    return cartItem ? cartItem.quantity : 0;
  }, [cart]);

  /**
   * Check if the product is already in the cart
   * @param {number} productId - The product ID
   * @param {number|null} variantId - Optional variant ID
   * @returns {boolean} True if the product is in the cart
   */
  const isInCart = useCallback((productId, variantId = null) => {
    return getCartQuantity(productId, variantId) > 0;
  }, [getCartQuantity]);

  return {
    handleAddToCart,
    getCartQuantity,
    isInCart,
    loading
  };
};