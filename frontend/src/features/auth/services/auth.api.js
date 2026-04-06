import apiClient from "../../../shared/utils/apiClient";

export const loginApi = (data) => apiClient.post("/auth/login", data);
export const registerApi = (data) => apiClient.post("/auth/register", data);
export const logoutApi = () => apiClient.post("/auth/logout");
export const getMeApi = () => apiClient.get("/auth/me");
export const googleAuthApi = (credential) => apiClient.post("/auth/google", { credential });
export const forgotPasswordApi = (email) => apiClient.post("/auth/forgot-password", { email });
export const resetPasswordApi = (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password });