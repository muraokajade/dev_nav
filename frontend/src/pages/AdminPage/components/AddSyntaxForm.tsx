import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";

export const AddSyntaxForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // 分割/全画面
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [isSplit, setIsSplit] = useState(true);

  const categories = [
    "Spring",
    "React",
    "TypeScript",
    "Java",
    "Vue",
    "Firebase",
    "Tailwind",
    "認証",
    "環境構築",
    "Other",
  ];

  const { idToken, loading } = useAuth();
  const headers = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

  const resetForm = () => {
    setSlug("");
    setTitle("");
    setCategory("");
    setSummary("");
    setContent("");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading || submitting) return;
    setError(null);
    setDone(false);

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
        "/api/admin/add-syntax",
        { slug, title, category, summary, content },
        { headers }
      );
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

      {/* 本体（残り高を占有。フッター分の余白を下に確保） */}
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

          {/* メタ入力 */}
          <div className="space-y-4 pb-4">
            <input
              className="w-full text-black border p-2"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="スラッグ（例: java-syntax-basics）"
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
            <textarea
              className="w-full text-black px-3 py-2 rounded mb-4 border"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="記事の要約（空でも可）"
              rows={6}
            />
          </div>

          {/* エディタ + プレビュー（内部スクロール） */}
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
                placeholder="内容（Markdown）"
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

        {/* フッター（常時表示・被らない） */}
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
                ライティングモード（Syntax）
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
