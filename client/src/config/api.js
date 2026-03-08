// Central API URL — strips trailing slash to prevent double-slash issues
// e.g. VITE_API_URL="https://spa-server.onrender.com/" → "https://spa-server.onrender.com"
// Updated: 2026-03-08
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export default API_URL;
