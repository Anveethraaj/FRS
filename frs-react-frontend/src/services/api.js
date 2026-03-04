import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getFurniture = (params) => api.get('/furniture', { params });
export const getAvailableFurniture = (params) => api.get('/furniture', { params: { ...params, available: true } });
export const getFurnitureByCode = (code) => api.get(`/furniture/${code}`);
export const getFurnitureStats = () => api.get('/furniture/stats');
export const createFurniture = (data) => api.post('/furniture', data);
export const updateFurniture = (id, data) => api.put(`/furniture/${id}`, data);
export const deleteFurniture = (id) => api.delete(`/furniture/${id}`);

export const createRental = (data) => api.post('/rentals', data);
export const getRentals = () => api.get('/rentals');
export const getRentalByOrderNo = (orderNo) => api.get(`/rentals/${orderNo}`);
export const extendRental = (orderNo, data) => api.put(`/rentals/${orderNo}/extend`, data);
export const returnRental = (orderNo, data) => api.post(`/rentals/${orderNo}/return`, data);
export const reportDamage = (orderNo, data) => api.post(`/rentals/${orderNo}/damage-report`, data);
export const getRecentRentals = () => api.get('/rentals/recent');
export const getOverdueRentals = () => api.get('/rentals/overdue');
export const getRentalStats = () => api.get('/rentals/stats');

export default api;
