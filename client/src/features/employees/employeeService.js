import { apiRequest } from '../../lib/apiClient.js'
export const listEmployees = () => apiRequest('/employees')
export const createEmployee = (employee, csrfToken) => apiRequest('/employees', { method: 'POST', csrfToken, body: employee })
export const setEmployeeActive = (id, active, csrfToken) => apiRequest(`/employees/${id}`, { method: 'PATCH', csrfToken, body: { active } })
