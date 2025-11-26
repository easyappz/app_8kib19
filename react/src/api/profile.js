import instance from './axios';
import { getToken } from './auth';

/**
 * Get user profile
 * @returns {Promise} Response with user profile data
 */
export const getProfile = async () => {
  const token = getToken();
  
  const response = await instance.get('/api/profile/', {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  
  return response.data;
};

/**
 * Update user profile
 * @param {string} username - Username
 * @param {string} email - Email address
 * @returns {Promise} Response with updated user profile data
 */
export const updateProfile = async (username, email) => {
  const token = getToken();
  
  const response = await instance.put(
    '/api/profile/',
    {
      username,
      email,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  
  return response.data;
};
