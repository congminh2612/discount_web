import apiClient from '../config/axios.config';

const getProduct = async (userId = null) => {
  try {
    const res = await apiClient.get('/api/product', {
      params: userId ? { userId } : {},
    });
    return res.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể tải sản phẩm');
  }
};

const getProductApplyCP = async (options = {}) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '', userId } = options;

    console.log('📦 [API CALL] getProductApplyCP - Params:', {
      page, limit, search, categoryId, userId,
    });

    const res = await apiClient.get('/api/product', {
      params: {
        page,
        limit,
        search,
        categoryId,
        userId, // 🔥 cần thiết để truyền lên server
      },
    });

    return res.data;
  } catch (error) {
    console.error('❌ getProductApplyCP error:', error);
    throw new Error(error.message || 'Không thể tải sản phẩm');
  }
};


const getProductById = async (productId, userId = null) => {
  try {
    const res = await apiClient.get(`/api/product/${productId}`, {
      params: userId ? { userId } : {},
    });
    return res.data;
  } catch (error) {
    throw new Error(error.message || 'Không thể tải sản phẩm');
  }
};

const getProductApplyCPById = async (productId, userId) => {
  try {
    console.log('📦 [API CALL] getProductApplyCPById:', { productId, userId });

    const res = await apiClient.get(`/api/product/${productId}`, {
      params: { userId }, // 🔥 truyền userId nếu cần apply rule
    });

    return res.data;
  } catch (error) {
    console.error('❌ getProductApplyCPById error:', error);
    throw new Error(error.message || 'Không thể tải sản phẩm chi tiết');
  }
};



const createProduct = async (product) => {
  try {
    const res = await apiClient.post('/api/product', product);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const editProduct = async (productId, product) => {
  try {
    const res = await apiClient.patch(`/api/product/${productId}`, product);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteProduct = async (productId) => {
  try {
    const res = await apiClient.delete(`/api/product/${productId}`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export {
  getProduct,
  getProductById,
  createProduct,
  editProduct,
  deleteProduct,
  getProductApplyCP,
  getProductApplyCPById,
};
