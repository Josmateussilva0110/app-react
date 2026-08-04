import { requestData } from "./request";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  must_change_password: boolean;
}

export interface UpdateProfileData {
  username: string;
}

export interface ChangePasswordData {
  current_password?: string;
  new_password: string;
  confirm_password: string;
}

export function getProfile() {
  return requestData<UserProfile>({
    endpoint: "/profile",
    method: "GET",
    withAuth: true,
  });
}

export function updateProfile(data: UpdateProfileData) {
  return requestData<UserProfile>({
    endpoint: "/profile",
    method: "PUT",
    data,
    withAuth: true,
  });
}

export function changePassword(data: ChangePasswordData) {
  return requestData<UserProfile>({
    endpoint: "/profile/password",
    method: "PUT",
    data,
    withAuth: true,
  });
}
