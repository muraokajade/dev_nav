import { useState } from "react";
import { apiHelper } from "../../libs/apiHelper";

export const ContactForm = () => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);
  // - const [error, setError] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // 二重送信防止

  // - const handleSubmit = async () => {
  // -   try {
  // -     await apiHelper.post("/api/contact", { title, question });
  // -     setTitle("");
  // -     setQuestion("");
  // -     setSent(true);
  // -   } catch (e) {
  // -     alert("失敗しました。");
  // -   }
  // - };
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!title.trim() || !question.trim()) {
      setError("件名と内容は必須です。");
      return;
    }
    if (loading || sent) return; // 連打防止
    setLoading(true);
    setError(null);
    try {
      await apiHelper.post("/api/contact", { title, question });
      setTitle("");
      setQuestion("");
      setSent(true);
    } catch (e: any) {
      // APIからのエラー文言があれば出す
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "送信に失敗しました。時間をおいて再度お試しください。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // formにしてEnter送信対応＆type=submitで統一
    <form
      className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-xl mx-auto mt-8"
      onSubmit={handleSubmit}
      noValidate
    >
      <h2 className="text-xl text-white font-bold mb-4">お問い合わせ</h2>

      {/* 完了メッセージ */}
      {sent && (
        <div className="mb-4 rounded bg-green-900/30 text-green-200 px-3 py-2">
          送信が完了しました。ありがとうございます！
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 rounded bg-red-900/30 text-red-200 px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="件名"
          className="w-full px-4 py-2 rounded border text-black"
          required
          // 画面で必須っぽく見せたいとき
          aria-invalid={!!error && !title.trim()}
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="お問い合わせ内容"
          rows={4}
          className="w-full px-4 py-2 rounded border border-zinc-700 text-black"
          required
          aria-invalid={!!error && !question.trim()}
        />
        <button
          // - onClick={handleSubmit}
          type="submit"
          className={`px-6 py-2 rounded font-semibold text-white transition ${
            sent
              ? "bg-green-600 cursor-default"
              : loading
              ? "bg-zinc-500 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={sent || loading}
        >
          {sent ? "送信完了！" : loading ? "送信中…" : "送信"}
        </button>
      </div>
    </form>
  );
};
