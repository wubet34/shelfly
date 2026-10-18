import { apiRequest } from '../../lib/apiClient.js'
export const listExpenses = () => apiRequest('/expenses')
export const createExpense = (expense, csrfToken) => apiRequest('/expenses', { method: 'POST', csrfToken, body: expense })
