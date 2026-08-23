import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import MentorAttendancePage from "./pages/MentorAttendancePage";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import PesertaPage from "./pages/PesertaPage";
import TryoutArrearsPage from "./pages/TryoutArrearsPage";
import MateriProgressPage from "./pages/MateriProgressPage";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  /*
   * Jangan redirect sebelum AuthProvider
   * selesai membaca token dari storage.
   */
  if (loading) {
    return null;
  }

  /*
   * Sudah login → dashboard
   *
   * Belum login → login
   */
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================
          ROOT
          ===================================== */}

      <Route path="/" element={<RootRedirect />} />

      {/* =====================================
          LOGIN
          ===================================== */}

      <Route path="/login" element={<LoginPage />} />

      {/* =====================================
          PROTECTED DASHBOARD
          ===================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/attendance" element={<AttendancePage />} />

          <Route path="/my-attendance" element={<MentorAttendancePage />} />

          <Route path="/schedules" element={<SchedulePage />} />

          <Route path="/participants" element={<PesertaPage />} />

          <Route path="/tryout-arrears" element={<TryoutArrearsPage />} />

          <Route path="/materi-progress" element={<MateriProgressPage />} />
        </Route>
      </Route>

      {/* =====================================
          FALLBACK
          ===================================== */}

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
