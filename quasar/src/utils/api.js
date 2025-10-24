// API utility for making authenticated requests
// Automatically handles dev vs production environments

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const fetchAPI = async (endpoint, options = {}) => {
  // In development, proxy will handle routing to localhost:1005
  // In production, API is served from same domain
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  })

  return response
}
