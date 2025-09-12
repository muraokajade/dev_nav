import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
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

  // 既存のモーダルプレビューは不要になるが、必要なら残してもOK
  // const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🔥 追加: ライティングモード（全画面）と表示切替
  const [isWritingMode, setIsWritingMode] = useState(false); // 画面いっぱいで編集
  const [isSplit, setIsSplit] = useState(true); // 左:入力 / 右:プレビュー

  const categories = [
    "Spring",
    "React",
    "TypeScript",
    "Java",
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
  );

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

  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setCategory("");
    setSummary("");
    setContent("");
    setImageFile(null);
    // setIsPreviewOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);

    if (loading || submitting) return;
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
    formData.append("summary", summary);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      setSubmitting(true);
      await apiHelper.post("/api/admin/add-article", formData, { headers });
      resetForm();
      setDone(true);
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

  // 共通のMarkdownレンダラ
  const MarkdownView = ({ text }: { text: string }) => (
    <div className="prose prose-invert max-w-none bg-gray-800 p-4 rounded overflow-y-auto break-words h-full">
      <ReactMarkdown
        children={text}
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
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        {/* フラッシュメッセージ */}
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

        {/* ツールバー */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 bg-gray-700 rounded text-white"
            onClick={() => setIsWritingMode(true)}
          >
            書きながら見る（全画面）
          </button>
          <button
            type="button"
            className="px-3 py-2 bg-gray-700 rounded text-white"
            onClick={() => setIsSplit((v) => !v)}
          >
            {isSplit ? "入力のみ" : "分割表示"}
          </button>
        </div>

        {/* 通常フォーム（分割プレビュー付き） */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4" noValidate>
          <input
            className="w-full text-black border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="スラッグ（URL識別子: react-hooks-basics など）"
            required
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

          {/* エディタ＋プレビュー */}
          <div
            className={`grid gap-4 ${
              isSplit ? "md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <MarkdownTextarea
              value={content}
              onChange={setContent}
              rows={28}
              placeholder="内容（Markdown）"
            />
            {isSplit && <MarkdownView text={content} />}
          </div>

          {/* 画像プレビュー */}
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
      </div>

      {/* ✨ ライティングモード（全画面・リアルタイム分割） */}
      {isWritingMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-3 bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
            {/* 上部バー */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-white/90 font-semibold">
                ライティングモード
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 bg-gray-700 rounded text-white"
                  onClick={() => setIsSplit((v) => !v)}
                >
                  {isSplit ? "入力のみ" : "分割表示"}
                </button>
                <button
                  className="px-3 py-1.5 bg-blue-600 rounded text-white disabled:opacity-50"
                  disabled={loading || submitting}
                  onClick={handleSubmit as any}
                >
                  {submitting ? "投稿中..." : "この内容で投稿"}
                </button>
                <button
                  className="px-3 py-1.5 bg-gray-600 rounded text-white"
                  onClick={() => setIsWritingMode(false)}
                >
                  閉じる
                </button>
              </div>
            </div>
            {/* 本体 */}
            <div
              className={`flex-1 grid gap-3 p-3 ${
                isSplit ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="h-full">
                <MarkdownTextarea
                  value={content}
                  onChange={setContent}
                  rows={40}
                  placeholder="内容（Markdown）を入力…"
                />
              </div>
              {isSplit && (
                <div className="h-full">
                  <MarkdownView text={content} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
