import React, { createContext, useContext, useState, useEffect } from "react";
import { Role, User } from "../types";
import { authApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("SUPER_ADMIN");
  const [token, setToken] = useState<string | null>(localStorage.getItem("qaudit_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initial bootstrap: auto switch to SUPER_ADMIN if no token
    const initAuth = async () => {
      try {
        if (!token) {
          const res = await authApi.switchDemoRole("SUPER_ADMIN");
          localStorage.setItem("qaudit_token", res.access_token);
          setToken(res.access_token);
          setRole(res.role as Role);
          setUser({
            id: 1,
            username: res.username,
            email: `${res.username}@qaudit.gov`,
            role: res.role as Role,
            is_active: true,
            created_at: new Date().toISOString(),
          });
        } else {
          try {
            const me = await authApi.getMe();
            setUser(me);
            setRole(me.role);
          } catch {
            // Re-authenticate
            const res = await authApi.switchDemoRole("SUPER_ADMIN");
            localStorage.setItem("qaudit_token", res.access_token);
            setToken(res.access_token);
            setRole(res.role as Role);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const switchRole = async (newRole: Role) => {
    setIsLoading(true);
    try {
      const res = await authApi.switchDemoRole(newRole);
      localStorage.setItem("qaudit_token", res.access_token);
      setToken(res.access_token);
      setRole(newRole);
      setUser({
        id: 99,
        username: res.username,
        email: `${res.username}@qaudit.gov`,
        role: newRole,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("qaudit_token");
    setToken(null);
    setUser(null);
    setRole("CITIZEN");
  };

  return (
    <AuthContext.Provider value={{ user, role, token, switchRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
