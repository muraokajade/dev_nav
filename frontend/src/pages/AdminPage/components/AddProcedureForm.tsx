import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";

export const AddProcedureForm = () => {
  const [stepNumber, setStepNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 分割/全画面
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [isSplit, setIsSplit] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    "Spring",
    "React",
    "TypeScript",
    "Java",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
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

  const normalizeStepNumber = (raw: string) => {
    const half = (raw || "").replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
    const t = half.replace(/[‐–—−－/／⁄・\.．,、]/g, "-").replace(/\s+/g, "");
    const m = t.match(/^(\d+)-(\d{1,2})$/);
    if (!m) return t;
    return `${parseInt(m[1], 10)}-${m[2].padStart(2, "0")}`;
  };
  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

  const resetForm = () => {
    setStepNumber("");
    setSlug("");
    setTitle("");
    setCategory("");
    setContent("");
    setImageFile(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading || submitting) return;
    setError(null);
    setDone(false);

    if (!slug || !title || !category || !content) {
      setError(
        "入力項目に不足があります。（slug / title / category / content）"
      );
      return;
    }
    if (!isValidSlug(slug)) {
      setError("slug は英小文字・数字・ハイフン(-)のみ使用できます。");
      return;
    }

    const normalizedStep = stepNumber ? normalizeStepNumber(stepNumber) : "";
    const formData = new FormData();
    formData.append("stepNumber", normalizedStep);
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      setSubmitting(true);
      await apiHelper.post("/api/admin/add-procedure", formData, { headers });
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

  const FOOTER_H = 88; // px

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* ヘッダ */}
      <div className="p-8 max-w-5xl w-full mx-auto">
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

        <div className="mb-4 flex flex-wrap gap-2">
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
      </div>

      {/* 本体（残り高） */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 min-h-0 overflow-hidden"
        noValidate
      >
        <div
          className="max-w-5xl w-full mx-auto px-8 flex flex-col h-full"
          style={{ paddingBottom: `var(--footer-h)` } as React.CSSProperties}
        >
          <style>{`:root{--footer-h:${FOOTER_H}px;}`}</style>

          {/* メタ情報 */}
          <div className="space-y-4 pb-4">
            <input
              className="w-full text-black border p-2"
              value={stepNumber}
              onChange={(e) => setStepNumber(e.target.value)}
              placeholder="手順番号（例: 1-01 / 101→1-01）"
            />
            <input
              className="w-full text-black border p-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="スラッグ（URL識別子: react-setup）"
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
          </div>

          {/* エディタ + プレビュー */}
          <div
            className={`flex-1 min-h-0 grid gap-4 ${
              isSplit ? "md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <div className="h-full min-h-0">
              <MarkdownTextarea
                value={content}
                onChange={setContent}
                rows={28}
                placeholder="内容（Markdown可）"
                className="h-full"
                toolbarClassName="sticky top-0 bg-gray-900 z-10"
              />
            </div>
            {isSplit && (
              <div className="h-full min-h-0 flex flex-col overflow-hidden">
                {/* ← ツールバー分のダミー余白（同じ高さ） */}
                <div className="sticky top-0 h-12 bg-gray-900" />
                {/* 実コンテンツは残り高でスクロール */}
                <div className="flex-1 min-h-0">
                  <MarkdownView text={content} />
                </div>
              </div>
            )}
          </div>

          {/* 画像はスクロール領域内に置く（フッターと重ならない） */}
          <div className="space-y-2 mt-4">
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
        </div>

        {/* フッター（常時表示・非重なり） */}
        <div
          className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-white/10"
          style={{ height: FOOTER_H }}
        >
          <div className="max-w-5xl w-full mx-auto px-8 h-full flex items-center gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading || submitting}
            >
              {submitting ? "投稿中..." : "投稿"}
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-gray-700 rounded text-white"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              上へ戻る
            </button>
          </div>
        </div>
      </form>

      {/* 全画面ライティングモード */}
      {isWritingMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-3 bg-gray-900 rounded-2xl shadow-2xl flex flex-col min-h-0">
            <div className="flex items-center justify-between p-3 border-b border-white/10 sticky top-0 bg-gray-900/90 backdrop-blur z-10">
              <div className="text-white/90 font-semibold">
                ライティングモード（Procedure）
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
                  onClick={() => handleSubmit()}
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

            <div
              className={`flex-1 min-h-0 grid gap-3 p-3 ${
                isSplit ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="h-full min-h-0">
                <MarkdownTextarea
                  value={content}
                  onChange={setContent}
                  rows={40}
                  placeholder="内容（Markdown）を入力…"
                  className="h-full"
                  toolbarClassName="sticky top-0 bg-gray-900 z-10"
                />
              </div>
              {isSplit && (
                <div className="h-full min-h-0 flex flex-col overflow-hidden">
                  {/* ← ツールバー分のダミー余白（同じ高さ） */}
                  <div className="sticky top-0 h-12 bg-gray-900" />
                  {/* 実コンテンツは残り高でスクロール */}
                  <div className="flex-1 min-h-0">
                    <MarkdownView text={content} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
