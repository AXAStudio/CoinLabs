import { Crypto } from '@/hooks/useCryptoData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, DollarSign, Activity, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatNumber } from '@/lib/utils';

interface CryptoDetailDialogProps {
  crypto: Crypto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CryptoDetailDialog = ({ crypto, open, onOpenChange }: CryptoDetailDialogProps) => {
  if (!crypto) return null;

  const changePercent = crypto.initial_price 
    ? ((crypto.price - crypto.initial_price) / crypto.initial_price) * 100 
    : 0;

  const orderBookEntries = Object.entries(crypto.order_book || {});
  const hasHistory = crypto.history && crypto.history.length > 0;
  
  const chartData = crypto.history.map((price, index) => ({
    time: `${index}s`,
    timeValue: index,
    price: price,
  }));
  
  // Calculate dynamic bounds with some padding
  const prices = crypto.history;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 1; // 10% padding or 1 if prices are same
  const yMin = Math.max(0, minPrice - padding);
  const yMax = maxPrice + padding;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-gradient">{crypto.symbol}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Detailed cryptocurrency information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price Overview */}
          <Card className="gradient-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Price Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">${formatNumber(crypto.price)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Change</p>
                  <div className="flex items-center gap-2">
                    {changePercent >= 0 ? (
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                    )}
                    <p className={`text-2xl sm:text-3xl font-bold ${changePercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Initial Price</p>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">${formatNumber(crypto.initial_price)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Volume</p>
                  <p className="text-lg sm:text-xl font-semibold text-foreground">{formatNumber(crypto.volume, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price History Chart */}
          {hasHistory && (
            <Card className="gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-accent" />
                  Price History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="timeValue" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{ 
                        value: 'Time (seconds)', 
                        position: 'insideBottom', 
                        offset: -10, 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 13
                      }}
                      tickFormatter={(value) => `${value}s`}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickLine={{ stroke: 'hsl(var(--border))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                      label={{ 
                        value: 'Price ($)', 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: 13
                      }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--primary))',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: 'var(--shadow-glow)',
                      }}
                      labelStyle={{ 
                        color: 'hsl(var(--foreground))', 
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      labelFormatter={(value) => `${value} seconds`}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <ReferenceLine 
                      y={crypto.initial_price} 
                      stroke="hsl(var(--accent))" 
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      opacity={0.6}
                      label={{ 
                        value: `Initial: $${crypto.initial_price.toFixed(2)}`, 
                        fill: 'hsl(var(--accent))', 
                        fontSize: 12,
                        position: 'insideTopRight',
                        offset: 10
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#colorPrice)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Order Book */}
          {orderBookEntries.length > 0 && (
            <Card className="gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Order Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {orderBookEntries.map(([key, value]) => (
                    <div 
                      key={key} 
                      className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-secondary/30 to-secondary/10 p-4 hover:border-primary/40 transition-all duration-300"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                          {key}
                        </span>
                        <span className="text-lg font-bold text-foreground font-mono">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
