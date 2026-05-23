import { requestData } from "./request";

import {
  LoginFormData,
  RegisterFormData,
} from "@/schemas/auth.schema";

import { AuthData } from "@/types/auth.types";

export function registerUser(
  data: RegisterFormData
) {
  return requestData<{ username: string }>({
    endpoint: "/register",
    method: "POST",
    data,
    withAuth: false,
  });
}

export function loginUser(
  data: LoginFormData
) {
  return requestData<AuthData>({
    endpoint: "/login",
    method: "POST",
    data,
    withAuth: false,
  });
}

export function logoutUser() {
  return requestData({
    endpoint: "/logout",
    method: "POST",
  });
}

export function refreshAccessToken(refreshToken: string) {
  return requestData<AuthData>({
    endpoint: "/auth/refresh",
    method: "POST",
    data: { refreshToken },
    withAuth: false,
  });
}
