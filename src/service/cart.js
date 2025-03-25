import apiClient from '../config/axios.config';

export const getCart = async (userId) => {
  try {
    if (!userId) {
      return {
        data: {
          id: 'guest',
          items: [],
          item_count: 0,
          subtotal: 0,
          shipping_fee: 0,
          discount_amount: 0,
          total_amount: 0,
        }
      };
    }
    
    const res = await apiClient.get('/api/cart', {
      params: { userId }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw new Error(error.response?.data?.message || 'Error fetching cart');
  }
};

export const addToCart = async (cartData) => {
  try {
    if (!cartData.user || !cartData.user.id) {
      throw new Error('User ID is required');
    }
    
    const res = await apiClient.post('/api/cart', cartData);
    return res.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw new Error(error.response?.data?.message || 'Error adding item to cart');
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const res = await apiClient.put(`/api/cart/${cartItemId}`, { quantity });
    return res.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw new Error(error.response?.data?.message || 'Error updating cart item');
  }
};

export const removeFromCart = async (cartItemId) => {
    try {
      if (!cartItemId) {
        throw new Error('Cart Item ID is undefined');
      }
  
      const res = await apiClient.delete(`/api/cart/${cartItemId}`);
      return res.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error removing item from cart');
    }
  };
  

export const applyDiscount = async (userId, discountCode) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const res = await apiClient.post(`/api/cart/apply-discount`, { 
      user: { id: userId },
      discount_code: discountCode 
    });
    return res.data;
  } catch (error) {
    console.error('Error applying discount:', error);
    throw new Error(error.response?.data?.message || 'Error applying discount');
  }
};

export const removeDiscount = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const res = await apiClient.delete(`/api/cart/remove-discount`, {
      data: { user: { id: userId } }
    });
    return res.data;
  } catch (error) {
    console.error('Error removing discount:', error);
    throw new Error(error.response?.data?.message || 'Error removing discount');
  }
};

export const clearCart = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const res = await apiClient.delete(`/api/cart/clear`, {
      data: { user: { id: userId } }
    });
    return res.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error(error.response?.data?.message || 'Error clearing cart');
  }
};

export const updateShippingInfo = async (userId, shippingData) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const res = await apiClient.put(`/api/cart/shipping`, {
      user: { id: userId },
      ...shippingData
    });
    return res.data;
  } catch (error) {
    console.error('Error updating shipping info:', error);
    throw new Error(error.response?.data?.message || 'Error updating shipping info');
  }
};