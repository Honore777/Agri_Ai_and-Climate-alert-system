const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  // Generous timeout: first /predict call cold-loads the 44MB torch model
  // on the server, and the free Render tier sleeps between requests.
  TIMEOUT: 120_000,
};

const ENDPOINTS = {
  login: '/auth/login',
  ME: '/users/me',
  LOGOUT: '/auth/logout',
};

export { API_CONFIG, ENDPOINTS };
