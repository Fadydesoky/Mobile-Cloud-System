import axios from "axios";

/**
 * Fetch data from a URL using axios
 * @param {string} url - The URL to fetch data from
 * @returns {Promise<any>} - The response data
 */
export const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching data");
  }
};

/**
 * Fetch data with retry logic for resilience
 * @param {string} url - The URL to fetch data from
 * @param {number} retries - Number of retry attempts (default: 3)
 * @returns {Promise<any>} - The response data
 */
export const fetchDataWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchData(url);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
};
