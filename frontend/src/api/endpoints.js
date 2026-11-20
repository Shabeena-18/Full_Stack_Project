/** One function per backend endpoint - components never build URLs themselves. */
import { request } from './client';

export const authApi = {
  signup: (data) => request('/auth/signup/', { method: 'POST', body: data }),
  login: (username, password) => request('/auth/login/', { method: 'POST', body: { username, password } }),
  logout: () => request('/auth/logout/', { method: 'POST' }),
  profile: () => request('/auth/profile/'),
};

export const menuApi = {
  list: (params) => request('/menu/', { params }),
  popular: () => request('/menu/popular/'),
  categories: () => request('/menu/categories/'),
};

export const cartApi = {
  get: () => request('/cart/'),
  add: (foodId) => request('/cart/items/', { method: 'POST', body: { food_id: foodId } }),
  setQuantity: (itemId, quantity) => request(`/cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }),
  remove: (itemId) => request(`/cart/items/${itemId}/`, { method: 'DELETE' }),
  clear: () => request('/cart/', { method: 'DELETE' }),
};

export const ordersApi = {
  list: () => request('/orders/'),
  get: (id) => request(`/orders/${id}/`),
  checkout: (data) => request('/orders/', { method: 'POST', body: data }),
};

export const deliveryApi = {
  dashboard: () => request('/delivery/orders/'),
  advance: (id) => request(`/delivery/orders/${id}/advance/`, { method: 'POST' }),
  cancel: (id) => request(`/delivery/orders/${id}/cancel/`, { method: 'POST' }),
};
