import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import MarketOverview from "./pages/MarketOverview";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initThemeFromStorage, applyTheme, getSavedTheme, getSavedAccent, getCurrentApplied } from '@/lib/theme.ts';

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      localStorage.setItem('userId', user.id);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        {/* initialize theme from localStorage on app mount */}
        <InitTheme />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ThemeSync />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/market"
              element={
                <ProtectedRoute>
                  <MarketOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

function InitTheme() {
  useEffect(() => {
    try {
      initThemeFromStorage();
    } catch (e) {
      // ignore
    }
  }, []);
  return null;
}

function ThemeSync() {
  // Re-apply theme on every location change to prevent route-specific resets
  const loc = useLocation();
  useEffect(() => {
    try {
      const t = getSavedTheme();
      const a = getSavedAccent();
      const current = getCurrentApplied();
      // If user has a preview/unsaved selection currently applied, don't override it on route change
      if (current.theme && (current.theme !== t || current.accent !== a)) {
        return;
      }
      applyTheme(t, a);
    } catch (e) {}
  }, [loc.pathname]);
  return null;
}

export default App;
