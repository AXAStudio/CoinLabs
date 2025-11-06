import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function Settings() {
  const [pollingRate, setPollingRate] = useState(1000);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/crypto');

  useEffect(() => {
    const savedRate = localStorage.getItem('pollingRate');
    const savedUrl = localStorage.getItem('apiUrl');
    if (savedRate) {
      setPollingRate(parseInt(savedRate));
    }
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    const rate = Math.max(100, pollingRate);
    localStorage.setItem('pollingRate', rate.toString());
    localStorage.setItem('apiUrl', apiUrl);
    setPollingRate(rate);
    toast.success('Settings saved successfully', {
      description: `API URL and polling rate updated`,
    });
    // Reload to apply new settings
    setTimeout(() => window.location.href = '/', 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Configure your dashboard preferences</p>
        </div>

        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Adjust how frequently the dashboard fetches new data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="api-url" className="text-sm sm:text-base">API Base URL</Label>
              <Input
                id="api-url"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="bg-secondary border-border text-sm sm:text-base"
                placeholder="http://localhost:8000/crypto"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                The base URL for your FastAPI backend. Make sure CORS is enabled.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="polling-rate" className="text-sm sm:text-base">Polling Rate (ms)</Label>
              <Input
                id="polling-rate"
                type="number"
                min={100}
                step={100}
                value={pollingRate}
                onChange={(e) => setPollingRate(parseInt(e.target.value) || 100)}
                className="bg-secondary border-border text-sm sm:text-base"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Minimum: 100ms. Lower values update faster but use more resources.
              </p>
            </div>

            <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
