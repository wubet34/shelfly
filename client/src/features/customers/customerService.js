import { apiRequest } from '../../lib/apiClient.js'
export const listCustomers = () => apiRequest('/customers')
export const lookupCustomers = () => apiRequest('/customers/lookup')
export const createCustomer = (customer, csrfToken) => apiRequest('/customers', { method: 'POST', csrfToken, body: customer })
export const updateCustomer = (id, customer, csrfToken) => apiRequest(`/customers/${id}`, { method: 'PATCH', csrfToken, body: customer })
export const deleteCustomer = (id, csrfToken) => apiRequest(`/customers/${id}`, { method: 'DELETE', csrfToken })
