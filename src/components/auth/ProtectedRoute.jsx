import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  const location = useLocation();

  /*
   * Saat AuthContext sedang membaca
   * session dari localStorage.
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Memeriksa sesi..." />
      </div>
    );
  }

  /*
   * Belum login
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /*
   * Hanya mentor yang boleh masuk.
   *
   * Ini merupakan lapisan kedua
   * setelah pengecekan saat login.
   */
  if (user?.role !== "mentor") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
