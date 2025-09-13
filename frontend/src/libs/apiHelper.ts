import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL;
if (!baseURL) console.warn("[api] REACT_APP_API_URL is undefined");

export const apiHelper = axios.create({
  baseURL, // 例: https://...koyeb.app
  withCredentials: false, // Cookie使わないなら falseでもOK
});
