import { apiRequest } from '../../lib/apiClient.js'
export const getSettings = () => apiRequest('/settings')
export const updateSettings = (settings, csrfToken) => apiRequest('/settings', { method: 'PATCH', csrfToken, body: settings })
