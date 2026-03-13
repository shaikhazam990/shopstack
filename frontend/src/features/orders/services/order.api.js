import apiClient from "../../../shared/utils/apiClient";

export const getMyOrders = (params) => apiClient.get("/orders", { params });
export const getOrder = (id) => apiClient.get(`/orders/${id}`);
export const cancelOrder = (id, reason) => apiClient.put(`/orders/${id}/cancel`, { reason });
