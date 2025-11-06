import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { toast } from 'sonner';
import { z } from 'zod';

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
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState('');
  const [volume, setVolume] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch(`${apiUrl}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add cryptocurrency');
      }

      toast.success('Cryptocurrency added', {
        description: `${data.symbol} has been added successfully`,
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
        toast.error('Failed to add cryptocurrency', {
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
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Cryptocurrency</DialogTitle>
            <DialogDescription>
              Add a new cryptocurrency to track on your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Adding...' : 'Add Cryptocurrency'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
