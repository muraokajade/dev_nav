// src/pages/admin/AdminSyntaxList.tsx
import { useCallback, useEffect, useState } from "react";
import { apiHelper } from "../../../libs/apiHelper";
import { SyntaxModel } from "../../../models/SyntaxModel";
import { useAuth } from "../../../context/useAuthContext";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { Link } from "react-router-dom";

export const AdminSyntaxList = () => {
  const [syntaxes, setSyntaxes] = useState<SyntaxModel[]>([]);
  const [syntax, setSyntax] = useState<SyntaxModel | null>(null);

  const { loading, idToken } = useAuth();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  // - 画像アップロードがないなら外す。使うなら残してOK
  // const [imageFile, setImageFile] = useState<File | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { totalPages, pageIndex, displayPage, setTotalPages, setDisplayPage } =
    usePagination();

  // - 画面UX向上：ロード/多重送信/エラー
  const [fetching, setFetching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  // - ヘッダー共通化
  const authHeader = idToken
    ? { Authorization: `Bearer ${idToken}` }
    : undefined;

  const fetchAllSyntax = useCallback(async () => {
    if (!idToken) return; // - 未ログイン防衛
    setFetching(true);
    setError(null);
    try {
      const res = await apiHelper.get(
        `/api/admin/syntaxes?page=${pageIndex}&size=10`,
        { headers: authHeader }
      );
      setSyntaxes(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (e: any) {
      console.error("記事取得失敗", e);
      setError(
        e?.response?.data?.message ||
          "文法記事一覧の取得に失敗しました。時間をおいて再試行してください。"
      );
      setSyntaxes([]);
      setTotalPages(0);
    } finally {
      setFetching(false);
    }
  }, [pageIndex, idToken, authHeader, setTotalPages]);

  useEffect(() => {
    // - 依存を付けずに即時関数＋依存なしだったため毎レンダー実行→API連打になっていた
    if (!loading && idToken) fetchAllSyntax();
  }, [loading, idToken, fetchAllSyntax]); // - 依存を適切に

  const togglePublish = async (slug: string) => {
    if (busy || !idToken) return; // - 多重防止
    setBusy(true);
    setError(null);

    // - 楽観更新：UI先行反映
    setSyntaxes((prev) =>
      prev.map((s) => (s.slug === slug ? { ...s, published: !s.published } : s))
    );

    try {
      await apiHelper.put(`/api/admin/syntaxes/${slug}/toggle`, null, {
        headers: authHeader,
      });
      await fetchAllSyntax(); // - サーバーを正とする
    } catch (e: any) {
      console.error("公開状態切替失敗", e);
      setError(e?.response?.data?.message || "公開状態の更新に失敗しました。");
      // - 失敗時ロールバック
      setSyntaxes((prev) =>
        prev.map((s) =>
          s.slug === slug ? { ...s, published: !s.published } : s
        )
      );
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (busy || !idToken) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiHelper.get(`/api/admin/syntaxes/${id}`, {
        headers: authHeader,
      });
      const s = res.data as SyntaxModel;
      setSyntax(s);

      // - 編集フォームへ反映（undefined防衛）
      setSlug(s.slug ?? "");
      setTitle(s.title ?? "");
      setSummary(s.summary ?? "");
      setContent(s.content ?? "");
      setCategory(s.category ?? "");

      setIsEditModalOpen(true);
    } catch (err: any) {
      console.error("❌ 取得失敗", err);
      setError(err?.response?.data?.message || "記事の取得に失敗しました。");
      alert("記事の取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (busy || !idToken) return;
    // - 必須チェック
    if (!slug.trim() || !title.trim() || !category.trim() || !content.trim()) {
      alert("slug / title / category / content は必須です。");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await apiHelper.put(
        `/api/admin/syntaxes/${id}`,
        {
          // - trim()を通して不要な空白を除去
          slug: slug.trim(),
          title: title.trim(),
          category: category.trim(),
          summary: summary ?? "",
          content: content,
        },
        { headers: authHeader }
      );

      setIsEditModalOpen(false);
      await fetchAllSyntax(); // - 最新反映
    } catch (e: any) {
      console.error("データ更新失敗", e);
      setError(e?.response?.data?.message || "更新に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (busy || !idToken) return;
    if (!window.confirm("本当に削除しますか？")) return;

    setBusy(true);
    setError(null);
    try {
      await apiHelper.delete(`/api/admin/syntaxes/${id}`, {
        headers: authHeader,
      });
      await fetchAllSyntax();
    } catch (e: any) {
      console.error("削除失敗", e);
      setError(e?.response?.data?.message || "削除に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        <h2 className="text-2xl text-white font-bold mb-4 border-b pb-2">
          📚 投稿済み文法
        </h2>

        {/* - エラー/ローディング */}
        {error && (
          <div className="mb-4 rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {fetching && <div className="mb-4 text-zinc-300">読み込み中...</div>}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">🛠️ 文法記事の編集</h3>

              <label>slug</label>
              <input
                className="w-full text-black border px-3 py-2 rounded mb-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="スラッグ（URL識別子）"
              />

              <label>title</label>
              <input
                className="w-full text-black px-3 py-2 rounded mb-2"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label>category</label>
              <select
                className="w-full text-black border p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label>summary</label>
              <textarea
                className="w-full text-black px-3 py-2 rounded mb-4"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="記事の要約（任意）"
                rows={6}
              />

              <label>content</label>
              <textarea
                className="w-full text-black px-3 py-2 rounded mb-4"
                placeholder="本文"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />

              {/* - 画像を使うならここに <input type="file" ... /> を追加 */}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  disabled={busy} // - 操作ロック
                >
                  キャンセル
                </button>
                {syntax && (
                  <button
                    onClick={() => handleUpdate(syntax.id)}
                    className={`px-4 py-2 rounded ${
                      busy
                        ? "bg-blue-900 cursor-wait"
                        : "bg-blue-500 hover:bg-blue-400"
                    }`}
                    disabled={busy}
                  >
                    {busy ? "更新中..." : "更新する"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {syntaxes.map((sx) => (
            <div
              key={sx.slug}
              className="flex flex-col sm:flex-row items-start bg-gray-800 text-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* 左側：基本情報 */}
              <div className="sm:w-[240px] w-full shrink-0 sm:pr-4 text-sm space-y-1 mb-4 sm:mb-0">
                <Link
                  to={`/syntaxes/${sx.id}-${sx.slug}`}
                  className="text-3xl hover:underline text-blue-200 break-words whitespace-normal"
                >
                  {sx.title}
                </Link>

                <p className="text-gray-400 break-words">Slug: {sx.slug}</p>
                <p className="text-gray-400">カテゴリー: {sx.category}</p>
                <p className="text-gray-500 text-xs">
                  投稿日: {dayjs(sx.createdAt).format("YYYY/MM/DD HH:mm")}
                </p>
              </div>

              {/* 中央：縦線（スマホでは非表示） */}
              <div className="hidden sm:block border-l border-gray-600 h-full mx-4" />

              {/* 中央右：要約表示（Markdown対応） */}
              <div className="prose prose-invert max-w-none text-sm text-gray-200 break-words flex-grow mb-4 sm:mb-0 sm:pr-4 overflow-x-auto">
                <ReactMarkdown
                  children={sx.summary}
                  components={{
                    code({ className, children, ...props }: any) {
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

              {/* 右端：編集・削除ボタン */}
              <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 items-start sm:items-end w-full sm:w-auto">
                <button
                  onClick={() => togglePublish(sx.slug)}
                  disabled={busy}
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    sx.published
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-500"
                      : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                  } ${busy ? "opacity-70 cursor-wait" : ""}`}
                >
                  {sx.published ? "公開中" : "非公開"}
                </button>

                <button
                  onClick={() => handleEdit(sx.id)}
                  disabled={busy}
                  className={`px-3 py-1 rounded text-sm font-semibold w-full sm:w-auto ${
                    busy
                      ? "bg-blue-900 text-white"
                      : "bg-blue-600 text-white border border-blue-700 hover:bg-blue-500"
                  }`}
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(sx.id)}
                  disabled={busy}
                  className={`px-3 py-1 rounded text-sm font-semibold w-full sm:w-auto ${
                    busy
                      ? "bg-red-900 text-white"
                      : "bg-red-600 text-white border border-red-700 hover:bg-red-500"
                  }`}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={paginate}
        />
      </div>
    </div>
  );
};
