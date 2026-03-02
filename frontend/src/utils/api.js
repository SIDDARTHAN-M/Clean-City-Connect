import axios from 'axios';

// Create an axios instance with dynamic base URL
// In production (Vercel), it uses relative path /api
// In development, it uses http://localhost:5000/api
const api = axios.create({
    baseURL: import.meta.env.MODE === 'production'
        ? '/api'
        : 'http://localhost:5000/api'
});

// Automatically add token to headers if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
