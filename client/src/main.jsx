import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global fetch interceptor — tự động redirect về /login khi token hết hạn
const _originalFetch = window.fetch;

const shouldEmitDataMutated = (url, method, status) => {
  const upperMethod = (method || 'GET').toUpperCase();
  if (!url.includes('/api/')) return false;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) return false;
  if (status < 200 || status >= 300) return false;

  // Read-only POST endpoints (no data mutation) — do not trigger page refresh
  const readOnlyPostPaths = [
    '/api/bookings/check-availability',
    '/api/promotions/suggest',
    '/api/promotions/validate',
    '/api/consultations'
  ];
  if (upperMethod === 'POST' && readOnlyPostPaths.some(path => url.includes(path))) return false;

  return true;
};

window.fetch = async (...args) => {
  const input = args[0];
  const init = args[1] || {};
  const requestUrl = typeof input === 'string' ? input : input?.url || '';
  const requestMethod = init.method || (typeof input !== 'string' ? input?.method : null) || 'GET';

  const response = await _originalFetch(...args);

  // Chỉ xử lý các API call, bỏ qua static assets
  const url = requestUrl;
  if (response.status === 401 && url.includes('/api/')) {
    const isLoginPage = window.location.pathname === '/login';
    if (!isLoginPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  if (shouldEmitDataMutated(url, requestMethod, response.status)) {
    window.dispatchEvent(new CustomEvent('app:data-mutated', {
      detail: {
        method: String(requestMethod).toUpperCase(),
        url,
        status: response.status,
        at: Date.now()
      }
    }));
  }

  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
