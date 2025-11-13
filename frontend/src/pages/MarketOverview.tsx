import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { useCryptoData } from '@/hooks/useCryptoData';
import { Loader2, AlertCircle, TrendingUp, DollarSign, Activity, LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';

export default function MarketOverview() {
  const pollingRate = parseInt(localStorage.getItem('pollingRate') || '1000');
  const apiUrl = localStorage.getItem('apiUrl') || 'http://localhost:8000';
  const { cryptos, loading, error } = useCryptoData(apiUrl, pollingRate);
  const [viewMode, setViewMode] = useState<'combined' | 'individual'>('combined');

  // Calculate portfolio metrics over time
  const portfolioHistory = useMemo(() => {
    if (cryptos.length === 0) return [];

    // Find the maximum history length
    const maxHistoryLength = Math.max(...cryptos.map(c => c.history.length));
    
    // Calculate combined portfolio value at each time point
    const history = [];
    for (let i = 0; i < maxHistoryLength; i++) {
      let totalValue = 0;
      let totalInitialValue = 0;
      
      cryptos.forEach(crypto => {
        if (i < crypto.history.length) {
          totalValue += crypto.history[i];
          totalInitialValue += crypto.initial_price;
        }
      });
      
      history.push({
        time: i,
        value: totalValue,
        initialValue: totalInitialValue,
        change: totalInitialValue > 0 ? ((totalValue - totalInitialValue) / totalInitialValue) * 100 : 0
      });
    }
    
    return history;
  }, [cryptos]);

  // Individual crypto performance data
  const individualPerformance = useMemo(() => {
    if (cryptos.length === 0) return [];

    const maxHistoryLength = Math.max(...cryptos.map(c => c.history.length));
    const history = [];
    
    for (let i = 0; i < maxHistoryLength; i++) {
      const dataPoint: any = { time: i };
      
      cryptos.forEach(crypto => {
        if (i < crypto.history.length) {
          dataPoint[crypto.symbol] = crypto.history[i];
        }
      });
      
      history.push(dataPoint);
    }
    
    return history;
  }, [cryptos]);

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--success))',
    'hsl(var(--chart-5))',
    'hsl(var(--destructive))',
    'hsl(180, 70%, 45%)',
    'hsl(290, 70%, 55%)',
    'hsl(50, 90%, 50%)',
  ];

  const currentValue = portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1].value : 0;
  const initialValue = portfolioHistory.length > 0 ? portfolioHistory[0].initialValue : 0;
  const totalChange = initialValue > 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;
  const maxValue = Math.max(...portfolioHistory.map(h => h.value));
  const minValue = Math.min(...portfolioHistory.map(h => h.value));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gradient tracking-tight">Market Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground/80">Complete portfolio performance visualization</p>
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
            <LineChartIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No market data available</p>
            <p className="text-sm text-muted-foreground mt-2">Add cryptocurrencies to see market performance</p>
          </div>
        )}

        {!loading && !error && cryptos.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-3 w-3" />
                    Current Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">${formatNumber(currentValue)}</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Total Change
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    Peak Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">${formatNumber(maxValue)}</p>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    Low Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">${formatNumber(minValue)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'combined' | 'individual')} className="space-y-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:inline-grid">
                <TabsTrigger value="combined">Combined Portfolio</TabsTrigger>
                <TabsTrigger value="individual">Individual Assets</TabsTrigger>
              </TabsList>

              <TabsContent value="combined" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <LineChartIcon className="h-5 w-5 text-primary" />
                      Portfolio Performance
                    </CardTitle>
                    <CardDescription>Combined market value over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={portfolioHistory} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          label={{ 
                            value: 'Time (seconds)', 
                            position: 'insideBottom', 
                            offset: -15,
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 13
                          }}
                          tickFormatter={(value) => `${value}s`}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          label={{ 
                            value: 'Portfolio Value ($)', 
                            angle: -90, 
                            position: 'insideLeft',
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 13
                          }}
                          domain={['dataMin - 5', 'dataMax + 5']}
                          tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--primary))',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: 'var(--shadow-glow)',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                          formatter={(value: number, name: string) => {
                            if (name === 'value') return [`$${value.toFixed(2)}`, 'Portfolio Value'];
                            if (name === 'initialValue') return [`$${value.toFixed(2)}`, 'Initial Value'];
                            if (name === 'change') return [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Change'];
                            return [value, name];
                          }}
                          labelFormatter={(value) => `${value} seconds`}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={false}
                          name="Portfolio Value"
                          isAnimationActive={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="initialValue"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Initial Value"
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="individual" className="space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5 text-accent" />
                      Individual Asset Performance
                    </CardTitle>
                    <CardDescription>Track each cryptocurrency separately</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={500}>
                      <LineChart data={individualPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          label={{ 
                            value: 'Time (seconds)', 
                            position: 'insideBottom', 
                            offset: -15,
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 13
                          }}
                          tickFormatter={(value) => `${value}s`}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          label={{ 
                            value: 'Price ($)', 
                            angle: -90, 
                            position: 'insideLeft',
                            fill: 'hsl(var(--muted-foreground))',
                            fontSize: 13
                          }}
                          domain={['dataMin - 1', 'dataMax + 1']}
                          tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--primary))',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: 'var(--shadow-glow)',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                          formatter={(value: number) => `$${Number(value).toFixed(2)}`}
                          labelFormatter={(value) => `${value} seconds`}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="line"
                        />
                        {cryptos.map((crypto, index) => (
                          <Line
                            key={crypto.symbol}
                            type="monotone"
                            dataKey={crypto.symbol}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2.5}
                            dot={false}
                            name={crypto.symbol}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
