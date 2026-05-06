// Axios instance configuration for API requests
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
})

//Interceptors runs before every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API
