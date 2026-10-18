import { apiRequest } from '../../lib/apiClient.js'
export const getDashboard = () => apiRequest('/dashboard')
