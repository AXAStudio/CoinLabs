import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { applyTheme, saveTheme, saveAccent, getSavedAccent, Theme } from '@/lib/theme';

export default function Settings() {
  const [pollingRate, setPollingRate] = useState(1000);
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState(getSavedAccent());

  useEffect(() => {
    const savedRate = localStorage.getItem('pollingRate');
    const savedUrl = localStorage.getItem('apiUrl');
    const savedTheme = localStorage.getItem('theme');
    const savedAccent = localStorage.getItem('accent');
    if (savedRate) {
      setPollingRate(parseInt(savedRate));
    }
    if (savedUrl) {
      setApiUrl(savedUrl);
    }
    if (savedTheme) setTheme(savedTheme as Theme);
    if (savedAccent) setAccent(savedAccent);
  }, []);

  const handleSave = () => {
    const rate = Math.max(100, pollingRate);
    localStorage.setItem('pollingRate', rate.toString());
    localStorage.setItem('apiUrl', apiUrl);
    // persist theme settings
    saveTheme(theme);
    saveAccent(accent);
    applyTheme(theme, accent);
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
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize appearance of the dashboard</CardDescription>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Color Mode</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => { setTheme('dark'); applyTheme('dark', accent); }} />
                    <span>Dark</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => { setTheme('light'); applyTheme('light', accent); }} />
                    <span>Light</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="system" checked={theme === 'system'} onChange={() => { setTheme('system'); applyTheme('system', accent); }} />
                    <span>System</span>
                  </label>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Switch between light and dark modes. System follows OS preference.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Accent Color</Label>
                <div className="flex gap-2 items-center">
                  {/* Preset swatches */}
                  {[
                    { name: 'Teal', hsl: '180 70% 55%' },
                    { name: 'Purple', hsl: '270 80% 65%' },
                    { name: 'Green', hsl: '142 71% 45%' },
                    { name: 'Red', hsl: '0 84% 60%' },
                    { name: 'Orange', hsl: '43 96% 56%' },
                  ].map((c) => (
                    <button
                      key={c.hsl}
                      onClick={() => { setAccent(c.hsl); applyTheme(theme, c.hsl); }}
                      aria-label={c.name}
                      className={`w-8 h-8 rounded-full border-2 ${accent === c.hsl ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                      style={{ background: `hsl(${c.hsl})` }}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pick an accent color for highlights and charts.</p>
              </div>
            </div>

            <div>
              <Label className="text-sm sm:text-base">Preview</Label>
              <div className="mt-2 p-4 rounded-lg glass-card flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Accent preview</div>
                  <div className="mt-1 font-semibold text-foreground" style={{ color: `hsl(${accent})` }}>Primary / Accent</div>
                </div>
                <div>
                  <button onClick={() => { saveTheme(theme); saveAccent(accent); applyTheme(theme, accent); toast.success('Preview applied'); }} className="px-3 py-1 rounded-md border border-border">Apply & Save Preview</button>
                </div>
              </div>
            </div>
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
