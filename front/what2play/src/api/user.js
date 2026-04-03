import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/users`;
 

export const register = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const login = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
