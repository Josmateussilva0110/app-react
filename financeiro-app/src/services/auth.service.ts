import { requestData } from "./request";
import { LoginFormData, RegisterFormData } from "@/schemas/auth.schema";

export function registerUser(data: RegisterFormData) {
  return requestData({
    endpoint: "/register",
    method: "POST",
    data,
  });
}

export function loginUser(data: LoginFormData) {
  return requestData({
    endpoint: "/login",
    method: "POST",
    data,
  });
}
