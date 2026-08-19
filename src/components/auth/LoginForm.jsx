import { Eye, EyeOff, LockKeyhole, Mail, LogIn } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoginErrorMessage } from "../../utils/authError";

import Input from "../ui/Input";
import Button from "../ui/Button";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import { login } from "../../services/authService";

export default function LoginForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { loginSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(email.trim(), password);

      /*
       * Hanya role mentor
       * yang diperbolehkan masuk.
       */
      if (response?.role !== "mentor") {
        setError("Akun Anda tidak memiliki akses ke sistem ini.");

        toast.error("Hanya akun mentor yang dapat masuk.");

        return;
      }

      const userData = {
        id_user: response.id_user,
        nama: response.nama,
        email: response.email,
        role: response.role,
        id_paketkelas: response.id_paketkelas,
        nama_kelas: response.nama_kelas,
      };

      loginSession(response.access_token, userData);

      toast.success("Login berhasil.", {
        title: "Selamat datang",
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      const message = getLoginErrorMessage(error);

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        type="email"
        placeholder="Masukkan email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        leftIcon={<Mail size={17} />}
        disabled={loading}
        autoComplete="email"
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Masukkan password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        leftIcon={<LockKeyhole size={17} />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={loading}
            aria-label={
              showPassword ? "Sembunyikan password" : "Lihat password"
            }
            className="
              rounded-md
              p-1
              text-foreground-muted
              transition
              hover:text-foreground
              focus:outline-none
              focus:ring-2
              focus:ring-primary-500/30
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        }
        disabled={loading}
        autoComplete="current-password"
      />

      {error && (
        <div
          className="
            rounded-lg
            border
            border-danger/20
            bg-danger-light
            px-3
            py-2.5
            text-sm
            text-danger
          "
        >
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-current
                border-t-transparent
              "
            />
            Memproses...
          </>
        ) : (
          <>
            <LogIn size={17} />
            Masuk
          </>
        )}
      </Button>
    </form>
  );
}
