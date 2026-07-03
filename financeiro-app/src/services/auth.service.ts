import { requestData } from "./request";

import {
  LoginFormData,
  RegisterFormData,
} from "@/schemas/auth.schema";

import { AuthData } from "@/types/auth.types";
import { AUTH_ROUTES } from "@/config/api-routes";

export function registerUser(
  data: RegisterFormData
) {
  return requestData<{ username: string }>({
    endpoint: AUTH_ROUTES.register,
    method: "POST",
    data,
    withAuth: false,
  });
}

export function loginUser(
  data: LoginFormData
) {
  return requestData<AuthData>({
    endpoint: AUTH_ROUTES.login,
    method: "POST",
    data,
    withAuth: false,
  });
}

export function logoutUser() {
  return requestData({
    endpoint: AUTH_ROUTES.logout,
    method: "POST",
  });
}

export function refreshAccessToken(refreshToken: string) {
  return requestData<AuthData>({
    endpoint: AUTH_ROUTES.refresh,
    method: "POST",
    data: { refreshToken },
    withAuth: false,
  });
}
