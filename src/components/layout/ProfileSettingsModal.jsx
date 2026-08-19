import { useEffect, useState } from "react";
import { LockKeyhole, UserRound } from "lucide-react";

import {
  getProfile,
  updatePassword,
  updateProfile,
} from "../../services/profileService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Label from "../ui/Label";
import Modal from "../ui/Modal";

const emptyProfile = { nama: "", email: "", no_hp: "", role: "", status: 0 };

export default function ProfileSettingsModal({ open, view, onClose }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [profileForm, setProfileForm] = useState({ nama: "", no_hp: "" });
  const [passwordForm, setPasswordForm] = useState({
    password_lama: "",
    password_baru: "",
    konfirmasi_password_baru: "",
  });
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const { updateUser } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    if (!open || view !== "profile") return;

    let active = true;
    setLoading(true);

    getProfile()
      .then((response) => {
        const data = response?.data || response;
        if (!active) return;
        setProfile({ ...emptyProfile, ...data });
        setProfileForm({ nama: data?.nama || "", no_hp: data?.no_hp || "" });
      })
      .catch((error) => showError(error.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [open, view, showError]);

  function changeProfile(event) {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function changePassword(event) {
    setPasswordForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitProfile(event) {
    event.preventDefault();
    if (!profileForm.nama.trim()) return showError("Nama wajib diisi.");

    setSavingProfile(true);
    try {
      const response = await updateProfile({
        nama: profileForm.nama.trim(),
        no_hp: profileForm.no_hp.trim() || null,
      });
      const data = response?.data || response;
      setProfile((current) => ({ ...current, ...data, ...profileForm }));
      updateUser({
        nama: profileForm.nama.trim(),
        no_hp: profileForm.no_hp.trim() || null,
      });
      showSuccess("Profil berhasil diperbarui.");
    } catch (error) {
      showError(error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    if (passwordForm.password_baru !== passwordForm.konfirmasi_password_baru) {
      return showError("Konfirmasi password baru tidak sama.");
    }
    if (!passwordForm.password_lama || !passwordForm.password_baru) {
      return showError("Semua password wajib diisi.");
    }

    setSavingPassword(true);
    try {
      await updatePassword(passwordForm);
      setPasswordForm({
        password_lama: "",
        password_baru: "",
        konfirmasi_password_baru: "",
      });
      showSuccess("Password berhasil diperbarui.");
    } catch (error) {
      showError(error.message);
    } finally {
      setSavingPassword(false);
    }
  }

  const isProfile = view === "profile";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isProfile ? "Profil Saya" : "Pengaturan Akun"}
      icon={isProfile ? UserRound : LockKeyhole}
      size="md"
      contentClassName="space-y-5"
    >
      {isProfile ? (
        loading ? (
          <p className="text-sm text-foreground-muted">Memuat profil...</p>
        ) : (
          <form className="space-y-4" onSubmit={submitProfile}>
            <div>
              <Label htmlFor="profile-nama" required>
                Nama
              </Label>
              <Input
                id="profile-nama"
                name="nama"
                value={profileForm.nama}
                onChange={changeProfile}
              />
            </div>
            <div>
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={profile.email} disabled />
            </div>
            <div>
              <Label htmlFor="profile-no-hp" optional>
                Nomor HP
              </Label>
              <Input
                id="profile-no-hp"
                name="no_hp"
                value={profileForm.no_hp}
                onChange={changeProfile}
              />
            </div>
            <ProfileRow label="Role" value={profile.role || "-"} />
            <ProfileRow
              label="Status"
              value={Number(profile.status) === 1 ? "Aktif" : "Tidak aktif"}
            />
            <Button type="submit" loading={savingProfile}>
              Simpan perubahan
            </Button>
          </form>
        )
      ) : (
        <form className="space-y-4" onSubmit={submitPassword}>
          <h3 className="text-sm font-semibold text-foreground">
            Ganti password
          </h3>
          <PasswordField
            id="password-lama"
            name="password_lama"
            label="Password lama"
            value={passwordForm.password_lama}
            onChange={changePassword}
          />
          <PasswordField
            id="password-baru"
            name="password_baru"
            label="Password baru"
            value={passwordForm.password_baru}
            onChange={changePassword}
          />
          <PasswordField
            id="konfirmasi-password"
            name="konfirmasi_password_baru"
            label="Konfirmasi password baru"
            value={passwordForm.konfirmasi_password_baru}
            onChange={changePassword}
          />
          <Button type="submit" variant="outline" loading={savingPassword}>
            Perbarui password
          </Button>
        </form>
      )}
    </Modal>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-foreground-muted">{label}</span>
      <span className="text-right text-sm font-medium capitalize text-foreground">
        {value}
      </span>
    </div>
  );
}

function PasswordField({ id, name, label, value, onChange }) {
  return (
    <div>
      <Label htmlFor={id} required>
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type="password"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
