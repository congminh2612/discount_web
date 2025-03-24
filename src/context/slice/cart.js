import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartService from '../../service/cart';

// Initial state
const initialState = {
  cartId: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  discountAmount: 0,
  shippingFee: 0,
  totalAmount: 0,
  discountCode: null,
  note: '',
  shippingAddress: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await cartService.addToCart(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cartService.updateCartItem(cartItemId, quantity);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (cartItemId, { rejectWithValue }) => {
    try {
      const response = await cartService.removeFromCart(cartItemId);
      return { ...response.data, cartItemId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const emptyCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.clearCart();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyDiscountCode = createAsyncThunk(
  'cart/applyDiscount',
  async (discountCode, { rejectWithValue }) => {
    try {
      const response = await cartService.applyDiscount(discountCode);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // For local cart updates (optimistic UI updates)
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.itemCount = action.payload.length;
    },
    updateLocalCartItem: (state, action) => {
      const { cartItemId, quantity } = action.payload;
      const item = state.items.find(item => item.id === cartItemId);
      if (item) {
        item.quantity = quantity;
        item.total_price = item.unit_price * quantity;
      }
    },
    removeLocalCartItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.itemCount = state.items.length;
    },
    resetCartError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cartId = action.payload.id;
        state.items = action.payload.items || [];
        state.itemCount = action.payload.item_count || 0;
        state.subtotal = action.payload.subtotal || 0;
        state.discountAmount = action.payload.discount_amount || 0;
        state.shippingFee = action.payload.shipping_fee || 0;
        state.totalAmount = action.payload.total_amount || 0;
        state.discountCode = action.payload.discount_code || null;
        state.note = action.payload.note || '';
        state.shippingAddress = action.payload.shipping_address || null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add item to cart
      .addCase(addItemToCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cartId = action.payload.cart_id;
        
        // Check if the item already exists
        const existingItemIndex = state.items.findIndex(
          item => item.product_id === action.payload.item.product_id && 
                 item.variant_id === action.payload.item.variant_id
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item
          state.items[existingItemIndex] = action.payload.item;
        } else {
          // Add new item
          state.items.push(action.payload.item);
        }
        
        state.itemCount = state.items.length;
        state.subtotal = action.payload.cart_total.subtotal;
        state.discountAmount = action.payload.cart_total.discount_amount;
        state.totalAmount = action.payload.cart_total.total_amount;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update cart item
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.subtotal = action.payload.subtotal;
        state.discountAmount = action.payload.discount_amount;
        state.totalAmount = action.payload.total_amount;
        
        // Re-fetch cart to ensure consistency
        // We could optimize this later if needed
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Remove cart item
      .addCase(removeCartItem.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = state.items.filter(item => item.id !== action.payload.cartItemId);
        state.itemCount = state.items.length;
        state.subtotal = action.payload.subtotal;
        state.discountAmount = action.payload.discount_amount;
        state.totalAmount = action.payload.total_amount;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Clear cart
      .addCase(emptyCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(emptyCart.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
        state.itemCount = 0;
        state.subtotal = 0;
        state.discountAmount = 0;
        state.totalAmount = 0;
        state.discountCode = null;
      })
      .addCase(emptyCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Apply discount
      .addCase(applyDiscountCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(applyDiscountCode.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.discountCode = action.payload.discount_code;
        state.discountAmount = action.payload.discount_amount;
        state.totalAmount = action.payload.total_amount;
      })
      .addCase(applyDiscountCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { 
  setCartItems, 
  updateLocalCartItem, 
  removeLocalCartItem,
  resetCartError
} = cartSlice.actions;

export default cartSlice.reducer;