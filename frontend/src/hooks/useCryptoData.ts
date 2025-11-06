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
      const response = await fetch(`${apiUrl}/list`);
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      const data = await response.json();
      setCryptos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
