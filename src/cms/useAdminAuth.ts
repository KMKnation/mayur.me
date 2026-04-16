import { useEffect, useMemo, useState } from "react";
import { SUPER_ADMIN_EMAIL } from "./defaultContent";
import { fetchAdminUsers, isAdminEmailAllowed } from "./repository";
import {
  clearSession,
  getCurrentUser,
  getGoogleSignInUrl,
  parseAuthHashSession,
  readSession,
  saveSession,
  SupabaseSession,
} from "./supabaseRest";
import { AdminRole, AdminUser } from "./types";

interface AdminAuthState {
  loading: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  role: AdminRole | null;
  session: SupabaseSession | null;
  userEmail: string | null;
  users: AdminUser[];
  error: string | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  refresh: () => Promise<void>;
}

export const useAdminAuth = (): AdminAuthState => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const signOut = () => {
    clearSession();
    setSession(null);
    setUserEmail(null);
    setIsAuthenticated(false);
    setIsAuthorized(false);
    setRole(null);
  };

  const signInWithGoogle = () => {
    const url = getGoogleSignInUrl("/admin/login");
    window.location.href = url;
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const hashSession = parseAuthHashSession();
      if (hashSession) {
        saveSession(hashSession);
        window.history.replaceState({}, "", window.location.pathname);
      }
      const stored = readSession();
      if (!stored) {
        signOut();
        return;
      }
      if (stored.expiresAt <= Date.now()) {
        signOut();
        return;
      }

      setSession(stored);
      setIsAuthenticated(true);

      const user = await getCurrentUser(stored.accessToken);
      setUserEmail(user.email);

      const adminUsers = await fetchAdminUsers(stored.accessToken);
      setUsers(adminUsers);
      const allowed = isAdminEmailAllowed(user.email, adminUsers);
      setIsAuthorized(allowed);

      if (!allowed) {
        setRole(null);
        return;
      }

      const matched = adminUsers.find(
        (item) => item.email.toLowerCase() === user.email.toLowerCase()
      );
      if (matched?.role) {
        setRole(matched.role);
      } else if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        setRole("super_admin");
      } else {
        setRole("admin");
      }
    } catch (err) {
      signOut();
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return useMemo(
    () => ({
      loading,
      isAuthenticated,
      isAuthorized,
      role,
      session,
      userEmail,
      users,
      error,
      signInWithGoogle,
      signOut,
      refresh,
    }),
    [
      loading,
      isAuthenticated,
      isAuthorized,
      role,
      session,
      userEmail,
      users,
      error,
    ]
  );
};
