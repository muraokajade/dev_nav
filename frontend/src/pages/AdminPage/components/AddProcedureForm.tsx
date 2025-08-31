import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { useRef, useState, useMemo } from "react";
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // - UX用: 送信状態/エラー/成功
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const { idToken, loading } = useAuth();

  // - 認証ヘッダ共通化
  const headers = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  // - フォーマット補助: 半角化＆ 5-9 → 5-09 等の正規化
  const normalizeStepNumber = (raw: string) => {
    const half = (raw || "").replace(/[０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfee0)
    );
    const t = half.replace(/[‐–—−－/／⁄・\.．,、]/g, "-").replace(/\s+/g, "");
    const m = t.match(/^(\d+)-(\d{1,2})$/);
    if (!m) return t;
    return `${parseInt(m[1], 10)}-${m[2].padStart(2, "0")}`;
  };

  // - slug簡易チェック
  const isValidSlug = (s: string) => /^[a-z0-9-]+$/.test(s);

  const resetForm = () => {
    setStepNumber("");
    setSlug("");
    setTitle("");
    setCategory("");
    setContent("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // - 多重送信/未ログイン抑止
    if (loading || submitting) return;

    setError(null);
    setDone(false);

    // - 必須バリデーション
    if (!slug || !title || !category || !content) {
      setError(
        "入力項目に不足があります。（slug / title / category / content）"
      );
      return;
    }
    // - slug形式チェック
    if (!isValidSlug(slug)) {
      setError("slug は英小文字・数字・ハイフン(-)のみ使用できます。");
      return;
    }

    // - stepNumber正規化（空は許容）
    const normalizedStep = stepNumber ? normalizeStepNumber(stepNumber) : "";

    const formData = new FormData();
    formData.append("stepNumber", normalizedStep); // - 正規化して送信
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setSubmitting(true);
      await apiHelper.post("/api/admin/add-procedure", formData, {
        headers, // - Content-TypeはFormDataで自動
      });
      resetForm();
      setDone(true); // - 成功表示
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
          className="mb-4 px-4 py-2 bg-gray-600 rounded text-white"
          onClick={() => setIsPreviewOpen(true)}
        >
          プレビューを見る
        </button>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4" noValidate>
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
            required /* - UX表示用 */
          />
          <input
            className="w-full text-black border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
            required /* - UX表示用 */
          />
          <select
            className="w-full text-black border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required /* - UX表示用 */
          >
            <option value="">カテゴリを選択</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <MarkdownTextarea
            value={content}
            onChange={setContent}
            rows={30}
            placeholder="内容（Markdown可）"
          />

          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageFile(e.target.files[0]);
              }
            }}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || submitting} // - 送信中は無効
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
