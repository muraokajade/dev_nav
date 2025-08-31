import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useMemo, useState } from "react";

export const AddSyntaxForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false); // - 送信中フラグ
  const [error, setError] = useState<string | null>(null); // - エラー文言
  const [done, setDone] = useState(false); // - 成功フラグ

  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const { idToken, loading } = useAuth();

  const headers = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  ); // - 認証ヘッダ共通化

  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s); // - slug簡易チェック

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setCategory("");
    setSummary("");
    setContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // - 連打防止
    if (loading || submitting) return;

    setError(null);
    setDone(false);

    // - 必須＆形式バリデーション
    if (!slug || !title || !category) {
      setError("必須項目（slug / title / category）を入力してください。");
      return;
    }
    if (!isValidSlug(slug)) {
      setError("slug は英数字とハイフン(-)のみ使用できます。");
      return;
    }

    try {
      setSubmitting(true);
      await apiHelper.post(
        "/api/admin/add-syntax", // - 既存エンドポイントを踏襲
        { slug, title, category, summary, content },
        { headers }
      );
      resetForm(); // - 成功時はフォームクリア
      setDone(true); // - 成功メッセージ表示
    } catch (err: any) {
      console.error("❌ 投稿失敗", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "投稿に失敗しました。時間をおいて再度お試しください。"
      ); // - エラー詳細を可能な限り表示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-3xl mx-auto">
        {/* - 成功/エラー表示 */}
        {done && (
          <div className="mb-4 rounded bg-green-900/30 text-green-200 px-3 py-2">
            送信が完了しました。
          </div>
        )}
        {error && (
          <div className="mb-4 rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6 space-y-4" noValidate>
          <input
            className="w-full text-black border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="スラッグ（例: java-syntax-basics）"
            required // - UX用
          />
          <input
            className="w-full text-black border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            required // - UX用
          />
          <select
            className="w-full text-black border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required // - UX用
          >
            <option value="">カテゴリを選択</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <textarea
            className="w-full text-black px-3 py-2 rounded mb-4 border"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="記事の要約（空でも可）"
            rows={6}
          />

          <textarea
            className="w-full text-black border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容（Markdown可）"
            rows={40}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || submitting} // - 送信中は押せない
          >
            {submitting ? "投稿中..." : "投稿"}
          </button>
        </form>
      </div>
    </div>
  );
};
