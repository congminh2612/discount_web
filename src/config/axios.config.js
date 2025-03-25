import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Sử dụng biến toàn cục để lưu trữ store
let storeRef = null;

// Tạo hàm để thiết lập store sau khi nó được khởi tạo
export const setStore = (store) => {
  storeRef = store;
};

apiClient.interceptors.request.use(
  (config) => {
    // Kiểm tra storeRef trước khi sử dụng
    if (storeRef) {
      const state = storeRef.getState();
      const token = state.auth?.currentUser?.token;

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;