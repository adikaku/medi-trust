
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  LightbulbOff, 
  Book, 
  MapPin, 
  LogIn, 
  LogOut,
  Lightbulb,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-primary mr-8">
            MediTrust
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive("/")} icon={<Home size={18} />} label="Home" />
            <NavLink 
              to={isAuthenticated ? "/diary" : "/login"} 
              isActive={isActive("/diary")} 
              icon={<Book size={18} />} 
              label="Diary" 
            />
            <NavLink to="/pharmacy" isActive={isActive("/pharmacy")} icon={<MapPin size={18} />} label="Pharmacies" />
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Lightbulb size={18} /> : <LightbulbOff size={18} />}
          </Button>
          
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <LogIn size={18} />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="mr-2"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Lightbulb size={18} /> : <LightbulbOff size={18} />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card py-2 px-4 shadow-md">
          <div className="flex flex-col space-y-2">
            <MobileNavLink to="/" isActive={isActive("/")} icon={<Home size={18} />} label="Home" />
            <MobileNavLink 
              to={isAuthenticated ? "/diary" : "/login"} 
              isActive={isActive("/diary")} 
              icon={<Book size={18} />} 
              label="Diary" 
            />
            <MobileNavLink to="/pharmacy" isActive={isActive("/pharmacy")} icon={<MapPin size={18} />} label="Pharmacies" />
            
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center justify-start gap-2 w-full"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </Button>
            ) : (
              <Link to="/login" className="w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-start gap-2 w-full"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavLink = ({ to, isActive, icon, label }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
    )}
  >
    <span className="mr-2">{icon}</span>
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, isActive, icon, label }: NavLinkProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-foreground/60 hover:text-foreground hover:bg-accent/50"
    )}
  >
    <span className="mr-2">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;
