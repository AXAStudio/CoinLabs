import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { z } from 'zod';
import { Crypto } from '@/hooks/useCryptoData';
import { formatNumber } from '@/lib/utils';

const cryptoSchema = z.object({
  symbol: z.string()
    .trim()
    .min(1, { message: "Symbol is required" })
    .max(10, { message: "Symbol must be less than 10 characters" })
    .regex(/^[A-Z0-9]+$/, { message: "Symbol must be uppercase letters and numbers only" }),
  price: z.number()
    .positive({ message: "Price must be positive" })
    .max(1000000000, { message: "Price is too large" }),
  volume: z.number()
    .min(0, { message: "Volume cannot be negative" })
    .max(1000000000000, { message: "Volume is too large" }),
});

interface AddCryptoDialogProps {
  apiUrl: string;
  onSuccess: () => void;
}

export const AddCryptoDialog = ({ apiUrl, onSuccess }: AddCryptoDialogProps) => {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'browse' | 'create'>('browse');
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allCryptos, setAllCryptos] = useState<Crypto[]>([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all available cryptos when dialog opens
  useEffect(() => {
    if (open && tab === 'browse') {
      fetchAllCryptos();
    }
  }, [open, tab]);

  const fetchAllCryptos = async () => {
    setLoadingCryptos(true);
    try {
    const response = await fetch(`${apiUrl}/market/list`);
      if (!response.ok) throw new Error('Failed to fetch cryptocurrencies');
      const data = await response.json();
      setAllCryptos(data);
    } catch (error) {
      toast.error('Failed to load cryptocurrencies', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoadingCryptos(false);
    }
  };

  const filteredCryptos = allCryptos.filter(crypto => 
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExisting = async (crypto: Crypto) => {
    setLoading(true);
    try {
      const token = session?.access_token;
  const response = await fetch(`${apiUrl}/portfolio/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          symbol: crypto.symbol,
          price: crypto.price,
          volume: crypto.volume
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add to portfolio');
      }

      toast.success('Added to portfolio', {
        description: `${crypto.symbol} has been added to your portfolio`,
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to add to portfolio', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate input
      const data = cryptoSchema.parse({
        symbol: symbol.toUpperCase(),
        price: parseFloat(price),
        volume: parseFloat(volume),
      });

      // Make API call
      const token = session?.access_token;
  const response = await fetch(`${apiUrl}/portfolio/add_new_to_portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create cryptocurrency');
      }

      toast.success('Created and added to portfolio', {
        description: `${data.symbol} has been created and added to your portfolio`,
      });

      // Reset form and close dialog
      setSymbol('');
      setPrice('');
      setVolume('');
      setOpen(false);
      onSuccess();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Failed to create cryptocurrency', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Crypto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add to Portfolio</DialogTitle>
          <DialogDescription>
            Browse existing cryptocurrencies or create a new one
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'browse' | 'create')} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            {loadingCryptos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {filteredCryptos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No cryptocurrencies found' : 'No cryptocurrencies available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredCryptos.map((crypto) => (
                      <Card 
                        key={crypto.symbol} 
                        className="glass-card hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => handleAddExisting(crypto)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-all">
                                <TrendingUp className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground text-lg">{crypto.symbol}</h4>
                                <p className="text-xs text-muted-foreground">
                                  Vol: {formatNumber(crypto.volume, 0)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">
                                ${formatNumber(crypto.price)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Current price
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <form onSubmit={handleCreateNew}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="BTC"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="bg-secondary border-border"
                    maxLength={10}
                    required
                  />
                  {errors.symbol && (
                    <p className="text-sm text-destructive">{errors.symbol}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Initial Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50000.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-secondary border-border"
                    required
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    type="number"
                    step="1"
                    min="0"
                    placeholder="1000000"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="bg-secondary border-border"
                    required
                  />
                  {errors.volume && (
                    <p className="text-sm text-destructive">{errors.volume}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? 'Creating...' : 'Create & Add'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
