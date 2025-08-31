import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../libs/firebase";
import { apiHelper } from "../../libs/apiHelper";

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // ニックネーム
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      // 1. Firebase Authでユーザー作成
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // 2. Firebase AuthのdisplayNameも設定
      await updateProfile(cred.user, { displayName: name });
      // 3. サーバー側（usersテーブル）にも新規登録（必要なら）
      await apiHelper.post("/api/register", {
        email,
        displayName: name,
      });
      navigate("/");
    } catch (e: any) {
      setError(e.message || "登録に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          新規登録
        </h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">
              ネーム（ニックネーム）
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={2}
              maxLength={20}
              placeholder="例: カネミチ"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
              placeholder="6文字以上"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-semibold transition"
          >
            登録
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          すでにアカウントがある方は{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
};
