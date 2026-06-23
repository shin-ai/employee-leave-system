import { useState, useEffect } from "react";
import { AuthStorageService } from "@/services/auth-storage";
import type { AuthSession } from "@/types/auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const session = AuthStorageService.getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(!!session);
    setUser(session);
    setIsLoading(false);

    // Set up a basic interval to check for session expiry while app is open
    const interval = setInterval(() => {
      const currentSession = AuthStorageService.getSession();
      if (!currentSession && session) {
        // Session expired
        window.location.reload(); 
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    isAdmin: user?.role === "ADMIN",
  };
}
