import { useState, useCallback } from 'react';

interface UseAsyncReturn {
  loading: boolean;
  error: string | null;
  run: <T>(promise: Promise<T>) => Promise<T>;
}

export function useAsync(): UseAsyncReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await promise;
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run };
}
