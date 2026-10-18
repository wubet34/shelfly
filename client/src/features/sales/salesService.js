import { apiRequest } from '../../lib/apiClient.js'
export const listSales = () => apiRequest('/sales')
export const submitSale = (sale, csrfToken, idempotencyKey) => apiRequest('/sales', { method: 'POST', csrfToken, idempotencyKey, body: sale })
