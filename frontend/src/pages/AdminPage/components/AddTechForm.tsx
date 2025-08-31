import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
// - import { MarkdownToolbar } from "../../../utils/MarkdownToolbar"; // 未使用なら削除OK
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const AddTechForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false); // - 送信中フラグ
  const [error, setError] = useState<string | null>(null); // - エラー表示
  const [done, setDone] = useState(false); // - 成功表示

  const [imagePreview, setImagePreview] = useState<string | null>(null); // - プレビュー用

  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
    "環境開発",
  ];

  const { idToken, loading } = useAuth();
  const headers = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  ); // - 認証ヘッダ共通化

  // - 画像プレビューURLの管理
  useEffect(() => {
    if (!imageFile) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // - ざっくりスラッグのバリデーション（英数・ハイフンのみ）
  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setCategory("");
    setSummary("");
    setContent("");
    setImageFile(null);
    setIsPreviewOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (loading || submitting) return; // - 二重送信防止
    if (!slug || !title || !category || !content) {
      setError(
        "必須項目（slug / title / category / content）を入力してください。"
      );
      return;
    }
    if (!isValidSlug(slug)) {
      setError("slug は英数字とハイフン(-)のみ使用できます。");
      return;
    }

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("summary", summary); // - 任意なら空文字でもOK
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      setSubmitting(true);
      await apiHelper.post("/api/admin/add-article", formData, {
        headers, // - Content-TypeはFormData任せ
      });
      resetForm();
      setDone(true); // - 成功メッセージ
    } catch (err: any) {
      console.error("❌ 投稿失敗", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "投稿に失敗しました。時間をおいて再度お試しください。"
      );
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

        <button
          type="button"
          className="mb-4 px-4 py-2 bg-gray-600 rounded text-white disabled:opacity-50"
          onClick={() => setIsPreviewOpen(true)}
          disabled={!content.trim()} // - 内容が無い時はプレビュー不可
        >
          プレビューを見る
        </button>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4" noValidate>
          <input
            className="w-full text-black border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="スラッグ（URL識別子: react-hooks-basics など）"
            required // - UX用
          />
          <input
            className="w-full text-black border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            required
          />
          <select
            className="w-full text-black border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">カテゴリを選択</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="block text-sm text-white/80">summary</label>
          <textarea
            className="w-full text-black px-3 py-2 rounded mb-2 border"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="記事の要約（空でも可）"
            rows={6}
          />

          <MarkdownTextarea
            value={content}
            onChange={setContent}
            rows={30}
            placeholder="内容（Markdown）"
          />

          {/* - 画像プレビューを追加 */}
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => {
                if (e.target.files?.[0]) setImageFile(e.target.files[0]);
              }}
            />
            {imagePreview && (
              <div className="bg-black/30 p-2 rounded">
                <div className="text-white/70 text-sm mb-2">画像プレビュー</div>
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-48 rounded object-contain"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || submitting}
          >
            {submitting ? "投稿中..." : "投稿"}
          </button>
        </form>

        {/* プレビューモーダル */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-2xl w-full relative max-h-[80vh] flex flex-col">
              <button
                className="absolute top-2 right-3 text-xl text-white"
                onClick={() => setIsPreviewOpen(false)}
              >
                ×
              </button>
              <div className="font-bold mb-3 text-white">プレビュー</div>
              <div className="prose prose-invert max-w-none bg-gray-800 p-4 rounded flex-1 overflow-y-auto break-words">
                <ReactMarkdown
                  children={content}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = Array.isArray(children)
                        ? children.join("")
                        : String(children);
                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="not-prose"
                          {...props}
                        >
                          {codeString.replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => <>{children}</>,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
