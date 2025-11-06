import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Crypto } from '@/hooks/useCryptoData';

interface CryptoCardProps {
  crypto: Crypto;
  apiUrl: string;
  onDelete: () => void;
  onClick: () => void;
}

export const CryptoCard = ({ crypto, apiUrl, onDelete, onClick }: CryptoCardProps) => {
  const [prevPrice, setPrevPrice] = useState(crypto.price);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (crypto.price > prevPrice) {
      setPriceChange('up');
    } else if (crypto.price < prevPrice) {
      setPriceChange('down');
    } else {
      setPriceChange('neutral');
    }
    setPrevPrice(crypto.price);
  }, [crypto.price, prevPrice]);

  const changePercent = crypto.initial_price 
    ? ((crypto.price - crypto.initial_price) / crypto.initial_price) * 100 
    : 0;

  const getChangeIcon = () => {
    if (priceChange === 'up') return <TrendingUp className="h-5 w-5" />;
    if (priceChange === 'down') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getPriceColor = () => {
    if (priceChange === 'up') return 'price-up';
    if (priceChange === 'down') return 'price-down';
    return 'text-muted-foreground';
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${apiUrl}/${encodeURIComponent(crypto.symbol)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cryptocurrency');
      }

      toast.success('Cryptocurrency deleted', {
        description: `${crypto.symbol} has been removed`,
      });

      onDelete();
    } catch (error) {
      toast.error('Failed to delete', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="glass-card hover:border-primary/50 transition-all duration-500 cursor-pointer group hover:translate-y-[-2px] transform touch-manipulation relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-5 sm:p-7 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1 w-full cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                <div className={`${getPriceColor()} transition-colors duration-300`}>
                  {getChangeIcon()}
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-gradient transition-all duration-300">{crypto.symbol}</h3>
                <p className="text-xs text-muted-foreground/70">
                  Vol: {crypto.volume.toLocaleString()}
                </p>
              </div>
            </div>
            <p className={`text-3xl sm:text-4xl font-bold ${getPriceColor()} transition-colors duration-300 mb-1`}>
                ${crypto.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/70">
              Initial: ${crypto.initial_price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
            </p>
          </div>
          <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial text-left sm:text-right cursor-pointer" onClick={onClick}>
              <div className={`text-2xl sm:text-3xl font-bold mb-1 ${changePercent >= 0 ? 'price-up' : 'price-down'}`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                changePercent >= 0 
                  ? 'bg-success/10 text-success border border-success/20' 
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}>
                {changePercent >= 0 ? '↑' : '↓'} {Math.abs(crypto.price - crypto.initial_price).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-destructive/50 hover:bg-destructive hover:text-destructive-foreground shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {crypto.symbol}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove {crypto.symbol} from your dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
