import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { ArticleModel } from "../../../models/ArticleModel";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";

/** Markdown/コードをざっくり除去 */
const stripMd = (s: string) =>
  (s || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** 共通: Markdownレンダラ（スクロール可能） */
const MarkdownView = ({ text }: { text: string }) => (
  <div className="prose prose-invert max-w-none bg-gray-800 p-4 rounded break-words h-full overflow-y-auto min-h-0">
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
  // ✨ 追加: 分割切替 & 全画面ライティングモード
  const [isSplit, setIsSplit] = useState(true);
  const [isWritingMode, setIsWritingMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { totalPages, pageIndex, displayPage, setDisplayPage, setTotalPages } =
    usePagination();

  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 追加: クライアント側検索・フィルタ・ソート
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [pubFilter, setPubFilter] = useState<"all" | "pub" | "draft">("all");
  const [sortKey, setSortKey] = useState<"date" | "title">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const categories = useMemo(
    () => ["Spring", "React", "Vue", "Firebase", "Tailwind", "Other"],
    []
  );

  const authHeader = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  // 画像プレビュー
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

  const fetchArticles = useCallback(
    async (signal?: AbortSignal) => {
      if (!idToken) return;
      setError(null);
      try {
        const res = await apiHelper.get(
          `/api/admin/articles?page=${pageIndex}&size=10`,
          { headers: authHeader, signal }
        );
        const list: ArticleModel[] = res.data?.content ?? [];
        const pages: number = res.data?.totalPages ?? 0;

        setArticles((prev) => (shallowEqual(prev, list) ? prev : list));
        setTotalPages((prev) => (prev === pages ? prev : pages));
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        console.error("記事取得失敗", e?.response?.status || e?.message);
        setError(
          e?.response?.data?.message ||
            "記事一覧の取得に失敗しました。時間をおいて再試行してください。"
        );
        setArticles([]);
        setTotalPages(0);
      }
    },
    [idToken, pageIndex, authHeader, setTotalPages]
  );

  const acRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (loading || !idToken) return;

    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    setFetching(true);
    fetchArticles(ac.signal)
      .catch(() => {})
      .finally(() => {
        if (!ac.signal.aborted) setFetching(false);
      });

    return () => ac.abort();
  }, [loading, idToken, pageIndex, fetchArticles]);

  const togglePublish = async (id: number) => {
    if (busy || !idToken) return;
    setBusy(true);
    setError(null);

    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
    );

    try {
      await apiHelper.put(`/api/admin/articles/toggle/${id}`, null, {
        headers: authHeader,
      });
      const ac = new AbortController();
      await fetchArticles(ac.signal);
    } catch (e: any) {
      console.error("公開状態切替失敗", e?.response?.status || e?.message);
      setError(e?.response?.data?.message || "公開状態の更新に失敗しました。");
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
      const s: ArticleModel = res.data;
      setArticle(s);

      setSlug(s.slug ?? "");
      setTitle(s.title ?? "");
      setSummary(s.summary ?? "");
      setContent(s.content ?? "");
      setCategory(s.category ?? "");
      setImageFile(null);

      setIsEditModalOpen(true);
      setIsSplit(true); // 初期は分割で開く
    } catch (e: any) {
      console.error("記事取得失敗", e?.response?.status || e?.message);
      setError(e?.response?.data?.message || "記事の取得に失敗しました。");
      alert("記事の取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (busy || !idToken) return;
    if (!slug.trim() || !title.trim() || !category.trim() || !content.trim()) {
      alert("slug / title / category / content は必須です。");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("slug", slug.trim());
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("summary", summary || "");
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      await apiHelper.put(`/api/admin/articles/${id}`, formData, {
        headers: { ...authHeader },
      });

      setIsEditModalOpen(false);
      setImageFile(null);
      const ac = new AbortController();
      await fetchArticles(ac.signal);
    } catch (e: any) {
      console.error("データ更新失敗", e?.response?.status || e?.message);
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
      const ac = new AbortController();
      await fetchArticles(ac.signal);
    } catch (e: any) {
      console.error("削除失敗", e?.response?.status || e?.message);
      setError(e?.response?.data?.message || "削除に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  // 現ページのクライアントサイド絞り込み
  const filtered = useMemo(() => {
    let list = [...articles];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.slug.toLowerCase().includes(s) ||
          (a.summary || "").toLowerCase().includes(s)
      );
    }
    if (catFilter) list = list.filter((a) => a.category === catFilter);
    if (pubFilter !== "all")
      list = list.filter((a) =>
        pubFilter === "pub" ? a.published : !a.published
      );
    list.sort((x, y) => {
      if (sortKey === "date") {
        const dx = +new Date(x.createdAt);
        const dy = +new Date(y.createdAt);
        return sortDir === "desc" ? dy - dx : dx - dy;
      }
      const tx = x.title.localeCompare(y.title);
      return sortDir === "desc" ? tx * -1 : tx;
    });
    return list;
  }, [articles, q, catFilter, pubFilter, sortKey, sortDir]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <h2 className="text-xl md:text-2xl text-white font-bold">
            📚 投稿済み記事
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 w-full md:w-auto">
            <input
              className="md:col-span-2 w-full pl-3 pr-3 py-2 rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-100 placeholder:text-zinc-500"
              placeholder="検索（タイトル/要約/slug）"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-100 px-3 py-2"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="">全部カテゴリ</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-100 px-3 py-2"
              value={pubFilter}
              onChange={(e) => setPubFilter(e.target.value as any)}
            >
              <option value="all">全て</option>
              <option value="pub">公開</option>
              <option value="draft">非公開</option>
            </select>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-100 px-3 py-2"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
              >
                <option value="date">日付</option>
                <option value="title">タイトル</option>
              </select>
              <button
                className="rounded-lg border border-white/10 bg-zinc-900/70 px-3 text-zinc-200"
                onClick={() =>
                  setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                }
                title="昇順/降順"
              >
                {sortDir === "desc" ? "降順" : "昇順"}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-3 rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {fetching && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-lg bg-zinc-900/60 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && !fetching ? (
          <div className="text-zinc-400 bg-zinc-900/50 border border-white/10 rounded-lg p-6">
            該当する記事がありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((a) => (
              <article
                key={a.id}
                className="group rounded-xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/articles/${a.id}-${a.slug}`}
                      className="text-lg md:text-xl font-semibold text-blue-200 leading-tight hover:underline break-words"
                    >
                      {a.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                        a.published
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-700/40"
                          : "bg-yellow-500/20 text-yellow-200 border border-yellow-700/40"
                      }`}
                    >
                      {a.published ? "公開中" : "非公開"}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5">
                      {a.category}
                    </span>
                    <span>{dayjs(a.createdAt).format("YYYY/MM/DD HH:mm")}</span>
                    <span className="truncate">Slug: {a.slug}</span>
                  </div>

                  {/* テキストのみプレビュー */}
                  <div className="mt-3 text-sm text-zinc-200 break-words overflow-hidden max-h-24 rounded border border-white/10 p-3 bg-white/5">
                    {stripMd(a.summary || a.content || "").slice(0, 220)}
                    {(a.summary || a.content || "").length > 220 && " …"}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => togglePublish(a.id)}
                      disabled={busy}
                      className={`inline-flex itemsーカー gap-1 rounded-md px-3 py-1.5 text-sm border ${
                        a.published
                          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500"
                          : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                      } ${busy ? "opacity-70 cursor-wait" : ""}`}
                    >
                      {a.published ? "公開中" : "非公開"}
                    </button>
                    <button
                      onClick={() => handleEdit(a.id)}
                      disabled={busy}
                      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm border ${
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
                      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm border ${
                        busy
                          ? "bg-red-900 text-white"
                          : "bg-red-600 text-white border-red-700 hover:bg-red-500"
                      }`}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Pagination
            displayPage={displayPage}
            totalPages={totalPages}
            maxPageLinks={5}
            paginate={paginate}
          />
        </div>
      </div>

      {/* ✨ 編集モーダル（分割プレビュー／全画面対応） */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 text-white rounded-2xl w-full max-w-6xl shadow-2xl border border-white/10 max-h-[85vh] flex flex-col">
            {/* ヘッダ（ツールバー付き） */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
              <h3 className="text-lg md:text-xl font-semibold">
                🛠️ 記事の編集
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600"
                  onClick={() => setIsSplit((v) => !v)}
                >
                  {isSplit ? "入力のみ" : "分割表示"}
                </button>
                <button
                  className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600"
                  onClick={() => setIsWritingMode(true)}
                >
                  全画面
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-gray-600 hover:bg-gray-500"
                  disabled={busy}
                >
                  閉じる
                </button>
                {article && (
                  <button
                    onClick={() => handleUpdate(article.id)}
                    className={`px-4 py-1.5 rounded ${
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

            {/* 本体（スクロール領域） */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/80">slug</label>
                    <input
                      className="w-full text-black border px-3 py-2 rounded"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="スラッグ（URL識別子）"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">title</label>
                    <input
                      className="w-full text-black border px-3 py-2 rounded"
                      placeholder="タイトル"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/80">category</label>
                    <select
                      className="w-full text-black border p-2 rounded"
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
                  </div>

                  <div>
                    <label className="text-sm text-white/80">summary</label>
                    <textarea
                      className="w-full text-black border px-3 py-2 rounded"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="記事の要約を入力（任意）"
                      rows={6}
                    />
                  </div>

                  {/* 画像アップロード＆プレビュー */}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (file && file.size > 5 * 1024 * 1024) {
                          alert("5MB以下の画像を選択してください。");
                          return;
                        }
                        setImageFile(file);
                      }}
                    />
                    {imagePreview && (
                      <div className="bg-black/30 p-2 rounded">
                        <div className="text-white/70 text-sm mb-2">
                          画像プレビュー
                        </div>
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="max-h-48 rounded object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ← 右側: content 編集＋プレビュー（分割切替） */}
                <div
                  className={`grid gap-3 ${
                    isSplit ? "md:grid-cols-2" : "grid-cols-1"
                  } min-h-0`}
                >
                  <div className="min-h-0">
                    <MarkdownTextarea
                      value={content}
                      onChange={setContent}
                      rows={22}
                      placeholder="本文（Markdown）"
                    />
                  </div>
                  {isSplit && (
                    <div className="min-h-0">
                      <MarkdownView text={content} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 全画面ライティングモード（モーダルから起動） */}
      {isWritingMode && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-3 bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
            {/* ヘッダ */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-white/90 font-semibold">
                ライティングモード（編集）
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 bg-gray-700 rounded text-white"
                  onClick={() => setIsSplit((v) => !v)}
                >
                  {isSplit ? "入力のみ" : "分割表示"}
                </button>
                {article && (
                  <button
                    className="px-3 py-1.5 bg-blue-600 rounded text-white"
                    onClick={() => handleUpdate(article.id)}
                    disabled={busy}
                  >
                    {busy ? "更新中..." : "この内容で更新"}
                  </button>
                )}
                <button
                  className="px-3 py-1.5 bg-gray-600 rounded text-white"
                  onClick={() => setIsWritingMode(false)}
                >
                  閉じる
                </button>
              </div>
            </div>

            {/* 本体（←ここが重要: min-h-0 を親/子に） */}
            <div
              className={`flex-1 min-h-0 grid gap-4 p-3 ${
                isSplit ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="min-h-0">
                <MarkdownTextarea
                  value={content}
                  onChange={setContent}
                  rows={40}
                  placeholder="内容（Markdown）を入力…"
                />
              </div>
              {isSplit && (
                <div className="min-h-0">
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

function shallowEqual(a: any, b: any) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i],
      y = b[i];
    if (x === y) continue;
    if (!x || !y) return false;
    const kx = Object.keys(x);
    const ky = Object.keys(y);
    if (kx.length !== ky.length) return false;
    for (const k of kx) if ((x as any)[k] !== (y as any)[k]) return false;
  }
  return true;
}
