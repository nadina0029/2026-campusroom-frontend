import axios from 'axios';

const api = axios.create({
  // PENTING: Ini URL Backend .NET kamu.
  // Pastikan backend jalan di port ini (cek di terminal backend)
  baseURL: 'http://localhost:5210/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Setiap kali kirim request, tempel Token otomatis
api.interceptors.request.use(
  (config) => {
    // Ambil token dari penyimpanan browser (Local Storage)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;