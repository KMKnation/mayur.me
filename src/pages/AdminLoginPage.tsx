import { useEffect } from "react";
import { useAdminAuth } from "../cms/useAdminAuth";
import { isSupabaseConfigured } from "../cms/supabaseRest";
import AppLink from "../routing/AppLink";
import { navigate } from "../routing/router";
import "./styles/Admin.css";

const AdminLoginPage = () => {
  const auth = useAdminAuth();

  useEffect(() => {
    if (auth.isAuthenticated && auth.isAuthorized) {
      navigate("/admin");
    }
  }, [auth.isAuthenticated, auth.isAuthorized]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="admin-page">
        <main className="admin-shell">
          <div className="public-topbar">
            <div className="brand">MK Portfolio</div>
            <AppLink href="/">Back to Home</AppLink>
          </div>
          <div className="admin-panel">
            <h2>Supabase Configuration Required</h2>
            <p className="admin-note">
              Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable
              Google login and CMS administration.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <main className="admin-shell">
        <div className="public-topbar">
          <div className="brand">MK Portfolio</div>
          <AppLink href="/">Back to Home</AppLink>
        </div>
        <div className="admin-panel">
          <h2>Admin Login</h2>
          <p className="admin-note">
            Use Google Sign-In to access the CMS dashboard.
          </p>
          <div className="admin-row">
            <button
              className="admin-btn"
              type="button"
              onClick={auth.signInWithGoogle}
              disabled={auth.loading}
            >
              Continue with Google
            </button>
            <button
              className="admin-mini-btn"
              type="button"
              onClick={() => void auth.refresh()}
              disabled={auth.loading}
            >
              Refresh Session
            </button>
          </div>
          {auth.userEmail ? (
            <p className="admin-note">Signed in as: {auth.userEmail}</p>
          ) : null}
          {!auth.loading && auth.isAuthenticated && !auth.isAuthorized ? (
            <p className="admin-error">
              Access denied. Your Google account is not listed as an active
              admin.
            </p>
          ) : null}
          {auth.error ? <p className="admin-error">{auth.error}</p> : null}
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;
