import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "../types/api.types";
import { UsersAPI } from "../api/users.api";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/auth.api";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  loginState: (user: User, accessToken: string) => void;
  logoutState: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem("userData");
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"));
  
  // SWR: Only block UI if we have a token but NO cached data
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(() => {
    const hasToken = !!localStorage.getItem("accessToken");
    const hasCachedUser = !!localStorage.getItem("userData");
    return hasToken && !hasCachedUser;
  });

  const logoutState = useCallback(async () => {
    try {
      await AuthAPI.logout(); // Destroy session on Redis backend
    } catch (error) {
      console.error("Backend logout failed, proceeding locally", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
      localStorage.removeItem("feedCache");
      setAccessToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null);
      setUser(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:force-logout", handleForceLogout);
    return () => window.removeEventListener("auth:force-logout", handleForceLogout);
  }, [navigate]);

  const loginState = useCallback((newUser: User, newAccessToken: string) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("userData", JSON.stringify(newUser));
    setAccessToken(newAccessToken);
    setUser(newUser);
  }, []);

  const checkAuth = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      // Silent background fetch to update stale cache
      const freshUserData = await UsersAPI.getMe();
      const freshToken = localStorage.getItem("accessToken"); 
      
      setUser(freshUserData);
      setAccessToken(freshToken);
      localStorage.setItem("userData", JSON.stringify(freshUserData));
    } catch (error) {
      console.error("Background sync failed. Session revoked.", error);
      await logoutState();
    } finally {
      setIsLoadingAuth(false);
    }
  }, [logoutState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoadingAuth,
      loginState,
      logoutState,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};