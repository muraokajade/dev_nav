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
  const [posting, setPosting] = useState(false); // - 二重送信防止

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posting) return; // - 二重送信抑止
    setError("");

    // - 事前整形＆簡易バリデーション
    const tEmail = email.trim();
    const tName = name.trim();
    const tPass = password.trim();
    if (!tName || !tEmail || !tPass) {
      setError("すべての項目を入力してください。");
      return;
    }
    if (tName.length < 2 || tName.length > 20) {
      setError("ニックネームは2〜20文字で入力してください。");
      return;
    }
    if (tPass.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    setPosting(true); // - 送信中ON
    try {
      // 1) Firebase Auth でユーザー作成
      const cred = await createUserWithEmailAndPassword(auth, tEmail, tPass);

      // 2) displayName を更新（失敗しても続行できるようにtry囲い）
      try {
        await updateProfile(cred.user, { displayName: tName });
      } catch {
        /* no-op: displayName更新は任意 */
      }

      // 3) バックエンド登録（usersテーブル等）
      //    ※ SecurityConfig で /api/register は permitAll なので Authorization は不要。
      //    サーバーで IDToken 検証が必要なら下記 headers を付与して対応してください。
      await apiHelper.post(
        "/api/register",
        { email: tEmail, displayName: tName }
        // { headers: { Authorization: `Bearer ${await cred.user.getIdToken()}` } } // - サーバーがトークン必須な場合
      );

      navigate("/");
    } catch (e: any) {
      // - Firebase の代表的なエラーコードを日本語メッセージ化
      const msg: string =
        e?.code === "auth/email-already-in-use"
          ? "このメールアドレスは既に使用されています。"
          : e?.code === "auth/invalid-email"
          ? "メールアドレスの形式が正しくありません。"
          : e?.code === "auth/weak-password"
          ? "パスワードが脆弱です。6文字以上にしてください。"
          : e?.message || "登録に失敗しました。";
      setError(msg);
    } finally {
      setPosting(false); // - 送信中OFF
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
              disabled={posting} // - 送信中は入力不可
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
              disabled={posting} // -
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
              disabled={posting} // -
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className={`w-full text-white py-2 px-4 rounded font-semibold transition ${
              posting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={posting} // - 連打防止
          >
            {posting ? "登録中..." : "登録"}
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
