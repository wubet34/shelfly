import { apiRequest } from '../../lib/apiClient.js'
export const verifySession = () => apiRequest('/auth/session')
export const signIn = (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } })
export const signOut = (csrfToken) => apiRequest('/auth/logout', { method: 'POST', csrfToken })
export const changePassword = (currentPassword, newPassword, csrfToken) => apiRequest('/auth/password', { method: 'POST', csrfToken, body: { currentPassword, newPassword } })
