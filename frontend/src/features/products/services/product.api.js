import apiClient from "../../../shared/utils/apiClient";

export const getProducts = (params) => apiClient.get("/products", { params });
export const getProduct = (slug) => apiClient.get(`/products/${slug}`);
export const getRecommendations = (id) => apiClient.get(`/products/${id}/recommendations`);
export const addReview = (id, data) => apiClient.post(`/products/${id}/reviews`, data);
