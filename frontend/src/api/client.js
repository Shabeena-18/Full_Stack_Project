/**
 * Tiny fetch wrapper used by every API call.
 *  - prefixes the API base URL
 *  - attaches the auth token
 *  - sends/receives JSON
 *  - turns Django REST Framework errors into a friendly ApiError
 */
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'fp_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  /**
   * @param {string} message       human readable summary
   * @param {number} status        HTTP status code
   * @param {object} fieldErrors   { fieldName: 'message' } for form validation errors
   */
  constructor(message, status, fieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// AuthContext registers a callback so an expired token logs the user out.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

const first = (value) => (Array.isArray(value) ? value[0] : value);

function parseError(status, data) {
  if (!data || typeof data !== 'object') {
    return new ApiError('Something went wrong. Please try again.', status);
  }
  if (data.detail) return new ApiError(String(data.detail), status);

  // DRF validation errors look like { field: ["message"], non_field_errors: [...] }
  const fieldErrors = {};
  for (const [field, value] of Object.entries(data)) {
    fieldErrors[field] = String(first(value));
  }
  const message = fieldErrors.non_field_errors || Object.values(fieldErrors)[0]
    || 'Something went wrong. Please try again.';
  return new ApiError(message, status, fieldErrors);
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`${BASE_URL}/api${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }

  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Token ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the Django backend running?', 0);
  }

  if (response.status === 204) return null;

  let data = null;
  try { data = await response.json(); } catch { /* empty or non-JSON body */ }

  if (!response.ok) {
    // A 401 while holding a token means it is expired/invalid.
    if (response.status === 401 && token) onUnauthorized();
    throw parseError(response.status, data);
  }
  return data;
}
