import axios from 'axios';
import { fetchData, fetchDataWithRetry } from '../api';

jest.mock('axios');

describe('API Calls', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetchData success', async () => {
    const mockResponse = { data: 'sample data' };
    axios.get.mockResolvedValue({ data: mockResponse });

    const result = await fetchData('https://api.example.com/data');
    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledWith('https://api.example.com/data');
  });

  test('fetchData failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      fetchData('https://api.example.com/data')
    ).rejects.toThrow('Error fetching data');
  });

  test('fetchDataWithRetry success on first attempt', async () => {
    const mockResponse = { data: 'sample data' };
    axios.get.mockResolvedValue({ data: mockResponse });

    const result = await fetchDataWithRetry('https://api.example.com/data', 3);
    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('fetchDataWithRetry success on retry', async () => {
    const mockResponse = { data: 'sample data' };

    axios.get
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockResolvedValueOnce({ data: mockResponse });

    const result = await fetchDataWithRetry('https://api.example.com/data', 2);
    expect(result).toEqual(mockResponse);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('fetchDataWithRetry fails after all retries exhausted', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      fetchDataWithRetry('https://api.example.com/data', 2)
    ).rejects.toThrow('Error fetching data');
    
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('fetchDataWithRetry uses default retry count of 3', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    await expect(
      fetchDataWithRetry('https://api.example.com/data')
    ).rejects.toThrow('Error fetching data');
    
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

});
