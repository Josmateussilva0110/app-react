import { requestData } from "./request";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

export interface UpdateProfileData {
  username: string;
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
