import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import MentorAttendancePage from "./pages/MentorAttendancePage";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import PesertaPage from "./pages/PesertaPage";

import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* =====================================
                LOGIN
                ===================================== */}

            <Route path="/" element={<LoginPage />} />

            {/* =====================================
                PROTECTED DASHBOARD
                ===================================== */}

            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/attendance" element={<AttendancePage />} />
                <Route
                  path="/my-attendance"
                  element={<MentorAttendancePage />}
                />

                <Route path="/schedules" element={<SchedulePage />} />
                <Route path="/participants" element={<PesertaPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
