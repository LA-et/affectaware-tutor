// src/utils/httpService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_ENDPOINT;

export const apiResponse = async (endpoint, method, data = null) => {
  try {
    const response = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      data,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data;
  }
};
