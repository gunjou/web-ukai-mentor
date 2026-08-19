import { api } from "../utils/api";

export function getProfile() {
  return api("/profile");
}

export function updateProfile(profile) {
  return api("/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function updatePassword(passwords) {
  return api("/profile/password", {
    method: "PUT",
    body: JSON.stringify(passwords),
  });
}
