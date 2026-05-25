import axios from 'axios';

// Every page imports this helper to call the backend API.
const api = axios.create({
  baseURL: 'http://localhost:9000/api',
  withCredentials: true
});

export default api;
