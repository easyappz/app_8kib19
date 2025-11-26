import instance from './axios';
import { getToken } from './auth';

/**
 * Get messages
 * @param {number} limit - Number of messages to return (default: 100)
 * @param {number} offset - Number of messages to skip (default: 0)
 * @returns {Promise} Response with messages list
 */
export const getMessages = async (limit = 100, offset = 0) => {
  const token = getToken();
  
  const response = await instance.get('/api/messages/', {
    headers: {
      Authorization: `Token ${token}`,
    },
    params: {
      limit,
      offset,
    },
  });
  
  return response.data;
};

/**
 * Send message
 * @param {string} text - Message text content
 * @returns {Promise} Response with created message data
 */
export const sendMessage = async (text) => {
  const token = getToken();
  
  const response = await instance.post(
    '/api/messages/',
    {
      text,
    },
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  
  return response.data;
};
