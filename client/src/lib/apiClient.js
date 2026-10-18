const API = `${(import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')}/api`
export async function apiRequest(path, { method = 'GET', body, csrfToken, idempotencyKey } = {}) {
  const response = await fetch(`${API}${path}`, { method, credentials: 'include', headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data.details?.map((item) => `${item.path?.join('.') || 'Request'}: ${item.message}`).join('. ')
    throw new Error(detail ? `${data.error}: ${detail}` : data.error || `Request failed (${response.status})`)
  }
  return data
}
