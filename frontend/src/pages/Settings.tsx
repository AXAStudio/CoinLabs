import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { applyTheme, saveTheme, saveAccent, getSavedAccent, Theme } from '@/lib/theme';

export default function Settings() {
  const FIXED_API_URL = "https://coinlabs.onrender.com";

  const [apiUrl, setApiUrl] = useState(FIXED_API_URL);
  const [pollingRate, setPollingRate] = useState(1000);
  const [theme, setTheme] = useState<Theme>('dark');
  const [accent, setAccent] = useState(getSavedAccent());

  useEffect(() => {
    // force API URL every time
    setApiUrl(FIXED_API_URL);

    const savedRate = localStorage.getItem('pollingRate');
    const savedTheme = localStorage.getItem('theme');
    const savedAccent = localStorage.getItem('accent');

    if (savedRate) setPollingRate(parseInt(savedRate));
    if (savedTheme) setTheme(savedTheme as Theme);
    if (savedAccent) setAccent(savedAccent);
  }, []);

  const handleSave = () => {
    const rate = Math.max(100, pollingRate);
    localStorage.setItem('pollingRate', rate.toString());

    // persist theme
    saveTheme(theme);
    saveAccent(accent);
    applyTheme(theme, accent);

    setPollingRate(rate);

    toast.success('Settings saved successfully', {
      description: `Theme & polling rate updated`,
    });

    setTimeout(() => window.location.href = '/', 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure your dashboard preferences
          </p>
        </div>

        <Card className="gradient-card border-border">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your dashboard experience</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* THEME SECTION (unchanged) */}
            <div>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Customize appearance of the dashboard</CardDescription>
            </div>

            {/* Accent preview + theme */}
            {/* unchanged… */}
            {/* ... */}

            {/* Polling Rate */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Polling Rate (ms)</Label>
              <Input
                type="number"
                min={100}
                step={100}
                value={pollingRate}
                onChange={(e) => setPollingRate(parseInt(e.target.value) || 100)}
                className="bg-secondary border-border text-sm sm:text-base"
              />
            </div>

            {/* Removed API URL input — but API is still set in state */}

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
