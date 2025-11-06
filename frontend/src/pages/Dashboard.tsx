import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { CryptoCard } from '@/components/CryptoCard';
import { AddCryptoDialog } from '@/components/AddCryptoDialog';
import { CryptoDetailDialog } from '@/components/CryptoDetailDialog';
import { useCryptoData, Crypto } from '@/hooks/useCryptoData';
import { Loader2, AlertCircle, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const pollingRate = parseInt(localStorage.getItem('pollingRate') || '1000');
  const apiUrl = localStorage.getItem('apiUrl') || 'http://localhost:8000/crypto';
  const { cryptos, loading, error, refetch } = useCryptoData(apiUrl, pollingRate);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Update selected crypto with live data when cryptos change
  useEffect(() => {
    if (selectedCrypto && detailOpen) {
      const updatedCrypto = cryptos.find(c => c.symbol === selectedCrypto.symbol);
      if (updatedCrypto) {
        setSelectedCrypto(updatedCrypto);
      }
    }
  }, [cryptos, selectedCrypto?.symbol, detailOpen]);

  const handleCryptoClick = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
    setDetailOpen(true);
  };

  // Calculate portfolio metrics
  const startingValue = cryptos.reduce((sum, crypto) => sum + crypto.initial_price, 0);
  const totalValue = cryptos.reduce((sum, crypto) => sum + crypto.price, 0);
  const allTimeReturn = startingValue > 0 ? ((totalValue - startingValue) / startingValue) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>
      
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Portfolio Summary Cards */}
        {!loading && !error && cryptos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <Card className="stat-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  Starting Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  ${startingValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Initial investment</p>
              </CardContent>
            </Card>

            <Card className="stat-card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
                    <DollarSign className="h-4 w-4 text-accent" />
                  </div>
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                    ${totalValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                <p className="text-xs text-muted-foreground">Current portfolio value</p>
              </CardContent>
            </Card>

            <Card className={`stat-card relative overflow-hidden group ${allTimeReturn >= 0 ? 'animate-pulse-glow' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${allTimeReturn >= 0 ? 'from-success/5' : 'from-destructive/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${allTimeReturn >= 0 ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} border`}>
                    <TrendingUp className={`h-4 w-4 ${allTimeReturn >= 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  All Time Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl sm:text-4xl font-bold mb-1 ${allTimeReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {allTimeReturn >= 0 ? '+' : ''}{allTimeReturn.toFixed(2)}%
                </p>
                <p className={`text-sm font-medium ${allTimeReturn >= 0 ? 'text-success/80' : 'text-destructive/80'}`}>
                  {allTimeReturn >= 0 ? '+' : ''}${(totalValue - startingValue).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gradient tracking-tight">Live Prices</h2>
            <p className="text-sm sm:text-base text-muted-foreground/80">Real-time cryptocurrency market data</p>
          </div>
          <AddCryptoDialog apiUrl={apiUrl} onSuccess={refetch} />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/50 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && cryptos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No cryptocurrencies found</p>
            <p className="text-sm text-muted-foreground mt-2">Add some using the API</p>
          </div>
        )}

        <div className="grid gap-4 sm:gap-5">
          {cryptos.map((crypto) => (
            <CryptoCard 
              key={crypto.symbol} 
              crypto={crypto} 
              apiUrl={apiUrl}
              onDelete={refetch}
              onClick={() => handleCryptoClick(crypto)}
            />
          ))}
        </div>
      </main>

      <CryptoDetailDialog 
        crypto={selectedCrypto}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
