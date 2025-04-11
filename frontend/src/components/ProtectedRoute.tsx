
import { useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login page with current location to redirect back after login
      navigate("/login", { state: { from: location } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;
