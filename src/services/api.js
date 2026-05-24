// src/services/api.js
// Central Axios instance for Apps Script REST API

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Inject auth token
api.interceptors.request.use(config => {
  const stored = localStorage.getItem('sdvms_user')
  if (stored) {
    try {
      const { user } = JSON.parse(stored)
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`
      }
    } catch (_) {}
  }
  return config
})

// Error handling
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err?.response?.data?.message || err?.message || 'Request failed'
    return Promise.reject(new Error(msg))
  }
)

export default api
