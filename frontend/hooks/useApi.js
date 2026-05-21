import { useState, useCallback } from 'react';

/**
 * Custom hook for making API calls with loading and error state management.
 * Usage:
 *   const { data, loading, error, execute } = useApi(studentService.getAll);
 *   useEffect(() => { execute(0, 10); }, []);
 */
export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      const result = response?.data !== undefined ? response.data : response;
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}
