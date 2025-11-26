import instance from './axios';

const TOKEN_KEY = 'authToken';

/**
 * Register new user
 * @param {string} username - Username
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise} Response with user data and token
 */
export const register = async (username, email, password) => {
  const response = await instance.post('/api/auth/register/', {
    username,
    email,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  
  return response.data;
};

/**
 * Login user
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise} Response with user data and token
 */
export const login = async (username, password) => {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });
  
  if (response.data.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  
  return response.data;
};

/**
 * Logout user
 * @returns {Promise} Response with logout confirmation
 */
export const logout = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (token) {
    const response = await instance.post(
      '/api/auth/logout/',
      {},
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );
    
    localStorage.removeItem(TOKEN_KEY);
    
    return response.data;
  }
  
  localStorage.removeItem(TOKEN_KEY);
  return { message: 'Logged out locally' };
};

/**
 * Get stored auth token
 * @returns {string|null} Auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};
