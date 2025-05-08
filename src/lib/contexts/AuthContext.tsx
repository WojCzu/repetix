import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      });

    // Setup EventSource for auth changes
    const eventSource = new EventSource("/api/auth/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setUser(data.user);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
