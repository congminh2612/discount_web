import apiClient from '../config/axios.config';

/**
 * Get the current user's cart
 * @param {number} userId - The user ID
 * @returns {Promise} - The cart data
 */
export const getCart = async (userId) => {
  try {
    const response = await apiClient.get('/api/cart', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching cart');
  }
};

/**
 * Add a product to the cart
 * @param {Object} payload - Product information
 * @param {number} payload.product_id - Product ID
 * @param {number} payload.variant_id - Variant ID (optional)
 * @param {number} payload.quantity - Quantity to add
 * @returns {Promise} - Response data
 */
export const addToCart = async (payload) => {
  try {
    const response = await apiClient.post('/api/cart', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error adding item to cart');
  }
};

/**
 * Update the quantity of a cart item
 * @param {number} cartItemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} - Response data
 */
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await apiClient.put(`/api/cart/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating cart item');
  }
};

/**
 * Remove an item from the cart
 * @param {number} cartItemId - Cart item ID to remove
 * @returns {Promise} - Response data
 */
export const removeFromCart = async (cartItemId) => {
  try {
    const response = await apiClient.delete(`/api/cart/${cartItemId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error removing item from cart');
  }
};

/**
 * Clear the entire cart
 * @returns {Promise} - Response data
 */
export const clearCart = async () => {
  try {
    const response = await apiClient.delete('/api/cart/clear');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error clearing cart');
  }
};

/**
 * Apply a discount code to the cart
 * @param {string} discountCode - The discount code to apply
 * @returns {Promise} - Response data
 */
export const applyDiscount = async (discountCode) => {
  try {
    const response = await apiClient.post('/api/cart/discount', { discount_code: discountCode });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error applying discount');
  }
};

/**
 * Remove a discount code from the cart
 * @returns {Promise} - Response data
 */
export const removeDiscount = async () => {
  try {
    const response = await apiClient.delete('/api/cart/discount');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error removing discount');
  }
};

/**
 * Update shipping information
 * @param {Object} shippingInfo - Shipping information
 * @param {number} shippingInfo.shipping_address_id - Shipping address ID
 * @param {string} shippingInfo.note - Order note
 * @returns {Promise} - Response data
 */
export const updateShippingInfo = async (shippingInfo) => {
  try {
    const response = await apiClient.put('/api/cart/shipping', shippingInfo);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating shipping info');
  }
};