type Theme = 'dark' | 'light' | 'system';

const THEME_KEY = 'theme';
const ACCENT_KEY = 'accent';

export function saveTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function saveAccent(hsl: string) {
  localStorage.setItem(ACCENT_KEY, hsl);
}

export function getSavedTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) || 'dark';
}

export function getSavedAccent(): string {
  return localStorage.getItem(ACCENT_KEY) || '180 70% 55%';
}

function setRootVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

// internal state used by visibility/match listeners
let _currentTheme: Theme | null = null;
let _currentAccent: string | null = null;
let _visibilityListenerAdded = false;
let _systemListenerAdded = false;

export function applyTheme(theme: Theme, accentHsl?: string) {
  const accent = accentHsl || getSavedAccent();

  // remember current selection for visibilitysave
  _currentTheme = theme;
  _currentAccent = accent;

  // Apply accent colors and make accent more pronounced by aligning primary with accent
  setRootVar('--accent', accent);
  // darker accent foreground for better contrast
  setRootVar('--accent-foreground', '220 14% 8%');
  // set primary to accent so UI uses accent heavily
  setRootVar('--primary', accent);
  setRootVar('--primary-foreground', '210 40% 98%');

  // Update gradient-primary using primary (now aligned to accent)
  setRootVar('--gradient-primary', `linear-gradient(135deg, hsl(${accent}) 0%, hsl(${accent}) 100%)`);

  // Theme-specific overrides
  if (theme === 'light') {
    // refined light theme: soft neutral background, slightly elevated cards, clearer borders
    setRootVar('--background', '210 56% 98%');
    setRootVar('--foreground', '220 14% 12%');
    setRootVar('--card', '0 0% 100%');
    setRootVar('--card-foreground', '220 14% 12%');
    setRootVar('--secondary', '210 36% 96%');
    setRootVar('--muted-foreground', '215 12% 48%');
    setRootVar('--border', '220 16% 92%');
    setRootVar('--input', '0 0% 100%');
    setRootVar('--ring', '220 90% 60%');
    // stronger, but soft shadow for light mode
    setRootVar('--shadow-glow', '0 8px 32px hsl(220 14% 12% / 0.06)');
    setRootVar('--shadow-card', '0 6px 18px hsl(220 14% 12% / 0.06)');
  } else {
    // dark theme (defaults)
    setRootVar('--background', '225 50% 8%');
    setRootVar('--foreground', '210 40% 98%');
    setRootVar('--card', '225 40% 12%');
    setRootVar('--card-foreground', '210 40% 98%');
    setRootVar('--secondary', '225 30% 18%');
    setRootVar('--muted-foreground', '215 20% 65%');
    setRootVar('--border', '225 30% 20%');
    setRootVar('--input', '225 30% 20%');
    setRootVar('--shadow-glow', '0 8px 32px hsl(270 80% 65% / 0.15)');
    setRootVar('--shadow-card', '0 4px 24px hsl(225 50% 8% / 0.4)');
  }

  // System preference
  if (theme === 'system') {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
    const prefersLight = mq ? mq.matches : false;
    // apply based on current preference
    applyTheme(prefersLight ? 'light' : 'dark', accent);
    // listen for changes
    if (mq && !_systemListenerAdded) {
      mq.addEventListener('change', (e) => {
        applyTheme(e.matches ? 'light' : 'dark', accent);
      });
      _systemListenerAdded = true;
    }
    return;
  }
}

export function initThemeFromStorage() {
  const theme = getSavedTheme();
  const accent = getSavedAccent();
  applyTheme(theme, accent);

  // save on visibility change when user navigates away
  if (typeof document !== 'undefined' && !_visibilityListenerAdded) {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // persist current selections
        try {
          saveTheme(_currentTheme || theme);
          saveAccent(_currentAccent || accent);
        } catch (e) {}
      } else {
        // re-apply in case another tab changed settings
        try {
          const t = getSavedTheme();
          const a = getSavedAccent();
          applyTheme(t, a);
        } catch (e) {}
      }
    });
    _visibilityListenerAdded = true;
  }

  // sync across tabs/windows
  if (typeof window !== 'undefined' && !(window as any)._coinlabsThemeListener) {
    window.addEventListener('storage', (e) => {
      try {
        if (e.key === THEME_KEY || e.key === ACCENT_KEY) {
          const t = getSavedTheme();
          const a = getSavedAccent();
          applyTheme(t, a);
        }
      } catch (err) {}
    });
    // mark listener added to avoid duplicates
    (window as any)._coinlabsThemeListener = true;
  }
}

export function getCurrentApplied() {
  return {
    theme: _currentTheme,
    accent: _currentAccent,
  };
}

export type { Theme };
