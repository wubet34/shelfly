import { apiRequest } from '../../lib/apiClient.js'
export const listProducts = () => apiRequest('/products')
export const saveProduct = (product, id, csrfToken) => apiRequest(id ? `/products/${id}` : '/products', { method: id ? 'PATCH' : 'POST', csrfToken, body: product })
export const archiveProduct = (product, csrfToken) => apiRequest(`/products/${product.id}`, { method: 'PATCH', csrfToken, body: { name: product.name, sku: product.sku, category: product.category, barcode: product.barcode || null, supplier: product.supplier || null, cost: Number(product.cost), price: Number(product.price), stock: Number(product.stock), threshold: Number(product.threshold), active: false } })
