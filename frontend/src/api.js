// api.js
import axios from "axios";

// 環境変数からAPIのベースURLを取得
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000"; // ローカル用のデフォルト設定

const api = axios.create({
  baseURL, // ここでbaseURLを設定
});

// GETリクエスト用のメソッド
const get = (url, params) => api.get(url, { params });

// POSTリクエスト用のメソッド
const post = (url, data) => api.post(url, data);

// PUTリクエスト用のメソッド
const put = (url, data) => api.put(url, data);

// DELETEリクエスト用のメソッド
const del = (url, params) => api.delete(url, { params });

export { get, post, put, del };
