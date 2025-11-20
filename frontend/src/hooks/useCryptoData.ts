import { useState, useEffect, useCallback } from 'react';

export interface Crypto {
  symbol: string;
  price: number;
  volume: number;
  history: number[];
  initial_price: number;
  order_book: Record<string, unknown>;
}

interface UseCryptoDataReturn {
  cryptos: Crypto[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCryptoData = (apiUrl: string, pollingRate: number): UseCryptoDataReturn => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptos = useCallback(async () => {
    try {
      // Get user ID from localStorage (set after login)
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        setCryptos([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/crypto/portfolio?user_id=${userId}`);
      if (!response.ok) {
        // If portfolio is empty or doesn't exist, set empty array
        if (response.status === 400) {
          setCryptos([]);
          setError(null);
        } else {
          throw new Error('Failed to fetch portfolio data');
        }
      } else {
        const data = await response.json();
        setCryptos(Array.isArray(data) ? data : []);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCryptos([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchCryptos();
    const interval = setInterval(fetchCryptos, pollingRate);
    return () => clearInterval(interval);
  }, [fetchCryptos, pollingRate]);

  return { cryptos, loading, error, refetch: fetchCryptos };
};
