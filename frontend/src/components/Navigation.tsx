import { LayoutDashboard, Settings, Menu, X, LineChart, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to logout');
    } else {
      localStorage.removeItem('userId');
      toast.success('Logged out successfully');
      navigate('/auth');
    }
  };

  return (
    <nav className="border-b border-primary/20 bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
            CoinLabs
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4 items-center">
            <NavLink
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink
              to="/market"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <LineChart className="h-5 w-5" />
              Market
            </NavLink>
            <NavLink
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <Settings className="h-5 w-5" />
              Settings
            </NavLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-2">
            <NavLink
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink
              to="/market"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <LineChart className="h-5 w-5" />
              Market
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg transition-colors hover:bg-secondary"
              activeClassName="bg-secondary text-primary"
            >
              <Settings className="h-5 w-5" />
              Settings
            </NavLink>
            <Button
              variant="ghost"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 w-full justify-start px-4 py-3"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
