"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import jwtDecode from "jwt-decode";

type UserRole = "ADMIN" | "SUPER_ADMIN" | "STAFF";

type UserTokenPayload = {
  sub: string;       // userId
  email: string;
  name:string;
  role: UserRole;
  schoolId: string | null;
  iat?: number;
  exp?: number;
};

type User = {
  access_token: string;
  role: UserRole;
  schoolId: string | null;
  email: string;
  name:string;
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Carrega usuário do localStorage e decodifica token
  useEffect(() => {
  async function loadUser() {
    const tokenString = localStorage.getItem("user");
    if (!tokenString) {
      if (window.location.pathname.startsWith("/dashboard")) {
        router.push("/auth/login");
      }
      return;
    }

    try {
      const { access_token } = JSON.parse(tokenString);
      const decoded: UserTokenPayload = jwtDecode(access_token);

      // Agora setState é chamado dentro da função async, não direto no useEffect
      setUser({
        access_token,
        email: decoded.email,
        role: decoded.role,
        schoolId: decoded.schoolId,
        name:decoded.name,
      });
    } catch (err) {
      console.error("Token inválido:", err);
      localStorage.removeItem("user");
    }
  }

  loadUser();
}, [router]);

  // Login: salva token e atualiza estado
  const login = (token: string) => {
    try {
      const decoded: UserTokenPayload = jwtDecode(token);
      const userData: User = {
        access_token: token,
        email: decoded.email,
        role: decoded.role,
        schoolId: decoded.schoolId,
        name:decoded.name,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify({ access_token: token }));
      router.push("/dashboard");
    } catch (err) {
      console.error("Token inválido:", err);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
