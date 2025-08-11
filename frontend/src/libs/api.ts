// src/libs/api.ts
import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from "axios";
import { getAuth } from "firebase/auth";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE ?? "http://localhost:8080",
  // Cookie方式に移行する時は ↓ を true に（CORS も要設定）
  // withCredentials: true,
});

// Axios v1 の headers（AxiosHeaders or Plain Object）両対応ヘルパ
function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) {
    // v1 だと class、古い版だと plain object のことがある
    config.headers = new AxiosHeaders();
  }
  const h = config.headers as any;
  if (typeof h.set === "function") {
    // v1 推奨：型安全
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  } else {
    // 互換：古い axios 等
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
}

// 送信前：常に“新しめ”のIDトークンを付与
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const user = getAuth().currentUser;
  if (user) {
    const token = await user.getIdToken(); // 自動更新分が反映された“新しめ”
    setAuthHeader(config, token);
  }
  return config;
});

// 401の時：1回だけ強制更新→リトライ
let isRetrying = false;

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const { response, config } = error;
    if (response?.status === 401 && config && !isRetrying) {
      isRetrying = true;
      try {
        const user = getAuth().currentUser;
        if (user) {
          const fresh = await user.getIdToken(true); // 強制更新
          setAuthHeader(config as InternalAxiosRequestConfig, fresh);
          return api(config); // 1回だけ再試行
        }
      } finally {
        isRetrying = false;
      }
    }
    return Promise.reject(error);
  }
);
