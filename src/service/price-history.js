import apiClient from '@/config/axios.config';

const getProductPriceHistory = async (productId) => {
  const res = await apiClient.get(`/api/price-history/products/${productId}`);
  return res.data;
};

const getVariantPriceHistory = async (variantId) => {
  const res = await apiClient.get(`/api/price-history/variants/${variantId}`);
  return res.data;
};

const getAllPriceHistory = async (params = {}) => {
  const res = await apiClient.get('/api/price-history', { params });
  return res.data;
};

export { getProductPriceHistory, getVariantPriceHistory, getAllPriceHistory };
