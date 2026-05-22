import axios from "axios";

const IP = "192.168.1.15";
const getBaseURL = () => {
  if (__DEV__) {
    // Android Emulator → 10.0.2.2
    // iOS Simulator    → localhost ou 127.0.0.1
    // Dispositivo físico → IP da máquina na rede local
    return `http://${IP}:3001/api`;
  }
  return "https://sua-api-producao.com/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true,
});
