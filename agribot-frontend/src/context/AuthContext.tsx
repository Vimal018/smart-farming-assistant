import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    // 🔹 If Clerk is signed in, sync with AuthContext
    if (isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || "",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
      });
      return;
    }

    // 🔹 If no Clerk user, check local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [isSignedIn, clerkUser]);

  // 🔹 Local login
  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
  }, []);

  // 🔹 Logout (Handles both local & Clerk logout)
  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  
    // 🔹 Clerk logout (forces Google re-selection)
    await signOut(() => {
      window.location.href = "/";
    });
  }, [signOut]);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
