import axios from "axios";
export const API_BASE =
  process.env.REACT_APP_API_BASE_URL ?? "http://localhost:8000";
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
});
