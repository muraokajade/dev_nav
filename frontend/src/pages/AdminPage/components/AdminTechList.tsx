// src/pages/admin/AdminTechList.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { ArticleModel } from "../../../models/ArticleModel";
// - import { SpinnerLoading } from "../../../components/SpinnerLoading"; // ← 作ってあるなら使う

export const AdminTechList = () => {
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [article, setArticle] = useState<ArticleModel | null>(null);

  const { loading, idToken } = useAuth();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { totalPages, pageIndex, displayPage, setDisplayPage, setTotalPages } =
    usePagination();

  const [busy, setBusy] = useState(false); // - API操作時のビジー制御
  const [fetching, setFetching] = useState(false); // - 一覧取得のローディング
  const [error, setError] = useState<string | null>(null); // - 画面上部で見えるエラー

  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const authHeader = idToken
    ? { Authorization: `Bearer ${idToken}` }
    : undefined; // - ヘッダを毎回書かない

  const fetchArticles = useCallback(async () => {
    if (!idToken) return; // - 未ログイン対策
    setFetching(true); // - ローディングON
    setError(null);
    try {
      const res = await apiHelper.get(
        `/api/admin/articles?page=${pageIndex}&size=10`,
        { headers: authHeader }
      );
      setArticles(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (e: any) {
      console.error("記事取得失敗", e);
      setError(
        e?.response?.data?.message ||
          "記事一覧の取得に失敗しました。時間をおいて再試行してください。"
      ); // - 見えるエラー
      setArticles([]);
      setTotalPages(0);
    } finally {
      setFetching(false); // - ローディングOFF
    }
  }, [pageIndex, idToken, authHeader, setTotalPages]);

  useEffect(() => {
    if (!loading && idToken) fetchArticles(); // - idTokenが揃ってから
  }, [loading, idToken, fetchArticles]);

  const togglePublish = async (id: number) => {
    if (busy || !idToken) return; // - 多重防止
    setBusy(true);
    setError(null);
    try {
      // - 楽観更新（体感向上）: 先にUIだけ切り替え
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
      );

      await apiHelper.put(`/api/admin/articles/toggle/${id}`, null, {
        headers: authHeader,
      });

      // - サーバーが正とするため再取得
      await fetchArticles();
    } catch (e: any) {
      console.error("公開状態切替失敗", e);
      setError(e?.response?.data?.message || "公開状態の更新に失敗しました。");
      // - 失敗時は反映を戻す
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
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
      const res = await apiHelper.get(`/api/admin/articles/${id}`, {
        headers: authHeader,
      });
      setArticle(res.data);

      // - 編集対象を反映
      setSlug(res.data.slug ?? "");
      setTitle(res.data.title ?? "");
      setSummary(res.data.summary ?? "");
      setContent(res.data.content ?? "");
      setCategory(res.data.category ?? "");
      setImageFile(null); // - 直前の選択をクリア

      setIsEditModalOpen(true);
    } catch (e: any) {
      console.error("記事取得失敗", e);
      setError(e?.response?.data?.message || "記事の取得に失敗しました。");
      alert("記事の取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (busy || !idToken) return;
    if (!slug || !title || !category || !content) {
      // - 必須チェック
      alert("slug / title / category / content は必須です。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("slug", slug.trim()); // - trim
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("summary", summary || "");
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      await apiHelper.put(`/api/admin/articles/${id}`, formData, {
        headers: {
          ...authHeader,
          // - Content-Type を FormData に任せる（axios が自動で boundary 付与）
        },
      });

      setIsEditModalOpen(false);
      setImageFile(null); // - 後始末
      await fetchArticles(); // - 最新状態で反映
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
      await apiHelper.delete(`/api/admin/articles/${id}`, {
        headers: authHeader,
      });
      // - 成功後にリスト更新
      await fetchArticles();
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
          📚 投稿済み記事
        </h2>

        {/* - 一覧のロード/エラー表示 */}
        {error && (
          <div className="mb-4 rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {/* {fetching && <SpinnerLoading label="読み込み中..." />} */}
        {fetching && <div className="mb-4 text-zinc-300">読み込み中...</div>}

        {/* - 編集モーダル */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">🛠️ 記事の編集</h3>

              <label>slug</label>
              <input
                className="w-full text-black border px-3 py-2 rounded mb-2"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="スラッグ（URL識別子）"
              />

              <label>title</label>
              <input
                className="w-full text-black border px-3 py-2 rounded mb-2"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label>category</label>
              <select
                className="w-full text-black border p-2 rounded mb-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <label>summary</label>
              <textarea
                className="w-full text-black border px-3 py-2 rounded mb-4"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="記事の要約を入力（または自動生成）"
                rows={6}
              />

              <label>content</label>
              <textarea
                className="w-full text-black border px-3 py-2 rounded mb-4"
                placeholder="本文"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />

              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  // - サイズ/拡張子の簡易チェック（任意）
                  if (file && file.size > 5 * 1024 * 1024) {
                    alert("5MB以下の画像を選択してください。");
                    return;
                  }
                  setImageFile(file);
                }}
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  disabled={busy} // - 操作ロック
                >
                  キャンセル
                </button>
                {article && (
                  <button
                    onClick={() => handleUpdate(article.id)}
                    className={`px-4 py-2 rounded ${
                      busy
                        ? "bg-blue-900 cursor-wait"
                        : "bg-blue-600 hover:bg-blue-500"
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

        {/* 一覧 */}
        <div className="space-y-2">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex flex-col sm:flex-row items-start bg-gray-800 text-white rounded-lg px-4 py-3 shadow-sm hover:shadow-md overflow-hidden"
            >
              {/* 左カラム */}
              <div className="sm:w-[240px] w-full shrink-0 sm:pr-4 text-sm space-y-1 mb-4 sm:mb-0">
                <Link
                  to={`/articles/${a.id}-${a.slug}`}
                  className="text-3xl hover:underline text-blue-200 break-words whitespace-normal"
                >
                  {a.title}
                </Link>
                <p className="text-gray-400 break-words">Slug: {a.slug}</p>
                <p className="text-gray-400">カテゴリー: {a.category}</p>
                <p className="text-gray-500 text-xs">
                  投稿日: {dayjs(a.createdAt).format("YYYY/MM/DD HH:mm")}
                </p>
              </div>

              {/* 区切り線 */}
              <div className="hidden sm:block border-l border-gray-600 h-full mx-4" />

              {/* 要約（Markdown対応） */}
              <div className="prose prose-invert max-w-none text-sm text-gray-200 break-words flex-grow mb-4 sm:mb-0 sm:pr-4 overflow-x-auto">
                <ReactMarkdown
                  // - children prop は ReactMarkdown v8+ でもOK
                  children={a.summary}
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

              {/* 右端 操作 */}
              <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end w-full sm:w-auto">
                <button
                  onClick={() => togglePublish(a.id)}
                  disabled={busy} // - 操作ロック
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    a.published
                      ? "bg-green-600 text-white border-green-700 hover:bg-green-500"
                      : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                  } ${busy ? "opacity-70 cursor-wait" : ""}`}
                >
                  {a.published ? "公開中" : "非公開"}
                </button>

                <button
                  onClick={() => handleEdit(a.id)}
                  disabled={busy}
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    busy
                      ? "bg-blue-900 text-white"
                      : "bg-blue-600 text-white border-blue-700 hover:bg-blue-500"
                  }`}
                >
                  編集
                </button>

                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={busy}
                  className={`px-3 py-1 rounded text-sm font-semibold border w-full sm:w-auto ${
                    busy
                      ? "bg-red-900 text-white"
                      : "bg-red-600 text-white border-red-700 hover:bg-red-500"
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
