import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Sun, Moon } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [pollingRate, setPollingRate] = useState(1000);

  useEffect(() => {
    const savedRate = localStorage.getItem('pollingRate');
    const savedUrl = localStorage.getItem('apiUrl');
    if (savedRate) setPollingRate(parseInt(savedRate));
    if (savedUrl) setApiUrl(savedUrl);
  }, []);

  const handleSaveBasic = () => {
    const rate = Math.max(100, pollingRate);
    localStorage.setItem('pollingRate', rate.toString());
    localStorage.setItem('apiUrl', apiUrl);
    setPollingRate(rate);
    toast.success('Settings saved successfully', { description: `API URL and polling rate updated` });
    setTimeout(() => window.location.href = '/', 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Customize your experience</p>
        </div>

        <div className="grid gap-6">
          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Theme and color customization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <Label className="text-sm">Theme</Label>
                <div className="sm:col-span-2 flex gap-2">
                  <Button variant={settings.theme === 'light' ? 'default' : 'ghost'} onClick={() => setSettings({ theme: 'light' })}>
                    <Sun className="mr-2 h-4 w-4" /> Light
                  </Button>
                  <Button variant={settings.theme === 'dark' ? 'default' : 'ghost'} onClick={() => setSettings({ theme: 'dark' })}>
                    <Moon className="mr-2 h-4 w-4" /> Dark
                  </Button>
                  <Button variant={settings.theme === 'system' ? 'default' : 'ghost'} onClick={() => setSettings({ theme: 'system' })}>
                    System
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <Label className="text-sm">Primary Color</Label>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ primaryColor: e.target.value })}
                    className="h-8 w-12 p-0 border-0"
                    aria-label="Primary color"
                  />
                  <Input value={settings.primaryColor} onChange={(e) => setSettings({ primaryColor: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle>Display</CardTitle>
              <CardDescription>Number formatting and precision</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <Label className="text-sm">Number Format</Label>
                <div className="sm:col-span-2 flex gap-2">
                  <Button variant={settings.numberFormat === 'full' ? 'default' : 'ghost'} onClick={() => setSettings({ numberFormat: 'full' })}>Full (50,320.00)</Button>
                  <Button variant={settings.numberFormat === 'abbreviated' ? 'default' : 'ghost'} onClick={() => setSettings({ numberFormat: 'abbreviated' })}>Abbreviated (50.32K)</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <Label className="text-sm">Decimals</Label>
                <div className="sm:col-span-2">
                  <Input type="number" min={0} max={6} value={settings.decimals} onChange={(e) => setSettings({ decimals: Math.max(0, Math.min(6, parseInt(e.target.value || '2'))) })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <Label className="text-sm">Auto Refresh</Label>
                <div className="sm:col-span-2">
                  <Button variant={settings.autoRefresh ? 'default' : 'ghost'} onClick={() => setSettings({ autoRefresh: !settings.autoRefresh })}>{settings.autoRefresh ? 'On' : 'Off'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border">
            <CardHeader>
              <CardTitle>API & Polling</CardTitle>
              <CardDescription>Backend address and polling frequency</CardDescription>
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
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">The base URL for your FastAPI backend. Make sure CORS is enabled.</p>
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
                <p className="text-xs sm:text-sm text-muted-foreground">Minimum: 100ms. Lower values update faster but use more resources.</p>
              </div>

              <Button onClick={handleSaveBasic} className="w-full bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
