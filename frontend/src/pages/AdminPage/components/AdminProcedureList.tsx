import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../../context/useAuthContext";
import dayjs from "dayjs";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";
import { Link } from "react-router-dom";
import { apiHelper } from "../../../libs/apiHelper";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";

/** ===== helper: shallow array equality ===== */
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
    const kx = Object.keys(x),
      ky = Object.keys(y);
    if (kx.length !== ky.length) return false;
    for (const k of kx) if ((x as any)[k] !== (y as any)[k]) return false;
  }
  return true;
}

/** ===== helper: Markdown除去 ===== */
const stripMd = (s: string) =>
  (s || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** ===== stepNumber 表示・比較 ===== */
const splitStepParts = (raw?: string) => {
  const s = (raw ?? "").trim();
  if (!s) return [] as number[];
  if (/[-._]/.test(s))
    return (s.match(/\d+/g) ?? []).map((n) => parseInt(n, 10));
  if (/^\d+$/.test(s)) {
    if (s.length <= 2) return [parseInt(s, 10)];
    const major = parseInt(s.slice(0, -2), 10);
    const minor = parseInt(s.slice(-2), 10);
    return [major, minor];
  }
  return (s.match(/\d+/g) ?? []).map((n) => parseInt(n, 10));
};
const formatStepDisplay = (raw?: string) => {
  const p = splitStepParts(raw);
  if (p.length === 0) return raw ?? "";
  if (p.length === 1) return String(p[0]);
  return [
    String(p[0]),
    ...p.slice(1).map((n) => String(n).padStart(2, "0")),
  ].join("-");
};
const compareStep = (a?: string, b?: string) => {
  const A = splitStepParts(a),
    B = splitStepParts(b);
  const len = Math.max(A.length, B.length);
  for (let i = 0; i < len; i++) {
    const ai = A[i] ?? -1,
      bi = B[i] ?? -1;
    if (ai !== bi) return ai - bi;
  }
  return (a ?? "").localeCompare(b ?? "");
};

/** プレビュー用 Markdown レンダラ */
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

export const AdminProcedureList = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [procedure, setProcedure] = useState<Procedure | null>(null);

  const { loading, idToken } = useAuth();
  const authHeader = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  // 編集フォーム
  const [stepNumber, setStepNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // ✨ 分割・全画面
  const [isSplit, setIsSplit] = useState(true);
  const [isWritingMode, setIsWritingMode] = useState(false);

  const [busy, setBusy] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pageIndex, setTotalPages, displayPage, setDisplayPage, totalPages } =
    usePagination();

  // クライアント側 検索・フィルタ・ソート
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [pubFilter, setPubFilter] = useState<"all" | "pub" | "draft">("all");
  const [sortKey, setSortKey] = useState<"date" | "title" | "step">("step");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("asc");

  const categories = useMemo(
    () => ["Spring", "React", "Vue", "Firebase", "Tailwind", "Other"],
    []
  );

  const acRef = useRef<AbortController | null>(null);

  const fetchProcedure = useCallback(
    async (signal?: AbortSignal) => {
      if (!idToken) return;
      setError(null);
      try {
        const res = await apiHelper.get(
          `/api/admin/procedure?page=${pageIndex}&size=10`,
          { headers: authHeader, signal }
        );
        const list: Procedure[] = res.data?.content ?? [];
        setProcedures((prev) => (shallowEqual(prev, list) ? prev : list));
        setTotalPages(res.data?.totalPages ?? 0);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        console.error("手順一覧取得失敗", e?.response?.status || e?.message);
        setProcedures([]);
        setTotalPages(0);
        setError(e?.response?.data?.message || "一覧の取得に失敗しました。");
      }
    },
    [pageIndex, idToken, authHeader, setTotalPages]
  );

  useEffect(() => {
    if (loading || !idToken) return;
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;
    setFetching(true);
    fetchProcedure(ac.signal)
      .catch(() => {})
      .finally(() => {
        if (!ac.signal.aborted) setFetching(false);
      });
    return () => ac.abort();
  }, [loading, idToken, pageIndex, fetchProcedure]);

  // 公開切替
  const togglePublish = async (id: number) => {
    if (busy || !idToken) return;
    setBusy(true);
    setError(null);
    setProcedures((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !p.published } : p))
    );
    try {
      await apiHelper.put(`/api/admin/procedure/toggle/${id}`, null, {
        headers: authHeader,
      });
    } catch (e: any) {
      console.error("公開状態切替失敗", e?.response?.status || e?.message);
      setError(
        e?.response?.data?.message || "公開状態の切り替えに失敗しました。"
      );
      setProcedures((prev) =>
        prev.map((p) => (p.id === id ? { ...p, published: !p.published } : p))
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
      const res = await apiHelper.get(`/api/admin/procedure/${id}`, {
        headers: authHeader,
      });
      const s: Procedure = res.data;
      setProcedure(s);
      setStepNumber(s.stepNumber ?? "");
      setSlug(s.slug ?? "");
      setTitle(s.title ?? "");
      setSummary(s.summary ?? "");
      setContent(s.content ?? "");
      setCategory(s.category ?? "");
      setIsEditModalOpen(true);
      setIsSplit(true);
    } catch (err: any) {
      console.error("❌ 取得失敗", err?.response?.status || err?.message);
      setError(
        err?.response?.data?.message || "記事詳細の取得に失敗しました。"
      );
      alert("記事の取得に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (busy || !idToken) return;
    if (
      !stepNumber.trim() ||
      !slug.trim() ||
      !title.trim() ||
      !category.trim() ||
      !content.trim()
    ) {
      alert(
        "必須項目（stepNumber, slug, title, category, content）が未入力です。"
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("stepNumber", stepNumber.trim());
      formData.append("slug", slug.trim());
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("summary", summary || "");
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      await apiHelper.put(`/api/admin/procedure/${id}`, formData, {
        headers: authHeader,
      });
      setIsEditModalOpen(false);
      const ac = new AbortController();
      await fetchProcedure(ac.signal);
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
      await apiHelper.delete(`/api/admin/procedure/${id}`, {
        headers: authHeader,
      });
      const ac = new AbortController();
      await fetchProcedure(ac.signal);
    } catch (e: any) {
      console.error("削除失敗", e?.response?.status || e?.message);
      setError(e?.response?.data?.message || "削除に失敗しました。");
    } finally {
      setBusy(false);
    }
  };

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  // クライアントサイド絞り込み＆固定順
  const filtered = useMemo(() => {
    let list = [...procedures];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.slug.toLowerCase().includes(s) ||
          (p.summary || "").toLowerCase().includes(s)
      );
    }
    if (catFilter) list = list.filter((p) => p.category === catFilter);
    if (pubFilter !== "all")
      list = list.filter((p) =>
        pubFilter === "pub" ? p.published : !p.published
      );

    list.sort((a, b) => {
      if (sortKey === "step") {
        const diff = compareStep(a.stepNumber, b.stepNumber);
        return sortDir === "desc" ? -diff : diff;
      }
      if (sortKey === "title") {
        const t = a.title.localeCompare(b.title);
        return sortDir === "desc" ? t * -1 : t;
      }
      const da = +new Date(a.createdAt);
      const db = +new Date(b.createdAt);
      return sortDir === "desc" ? db - da : da - db;
    });

    return list;
  }, [procedures, q, catFilter, pubFilter, sortKey, sortDir]);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
          <h2 className="text-xl md:text-2xl text-white font-bold">
            📚 投稿済み手順
          </h2>

          {/* ツールバー */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 w-full md:w-auto">
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
            <select
              className="rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-100 px-3 py-2"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
            >
              <option value="step">ステップ</option>
              <option value="date">日付</option>
              <option value="title">タイトル</option>
            </select>
            <button
              className="rounded-lg border border-white/10 bg-zinc-900/70 px-3 text-zinc-200"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title="昇順/降順"
            >
              {sortDir === "asc" ? "昇順" : "降順"}
            </button>
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
            該当する手順がありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="group rounded-xl bg-zinc-900/60 border border-white/10 hover:border-white/20 transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/procedures/${p.id}-${p.slug}`}
                      className="text-lg md:text-xl font-semibold text-blue-200 leading-tight hover:underline break-words"
                    >
                      {p.title}
                    </Link>
                    <span
                      className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                        p.published
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-700/40"
                          : "bg-yellow-500/20 text-yellow-200 border border-yellow-700/40"
                      }`}
                    >
                      {p.published ? "公開中" : "非公開"}
                    </span>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-400">
                    <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5">
                      {p.category}
                    </span>
                    <span>Step: {formatStepDisplay(p.stepNumber)}</span>
                    <span>{dayjs(p.createdAt).format("YYYY/MM/DD HH:mm")}</span>
                    <span className="truncate">Slug: {p.slug}</span>
                  </div>

                  <div className="mt-3 text-sm text-zinc-200 break-words overflow-hidden max-h-24 rounded border border-white/10 p-3 bg-white/5">
                    {stripMd(p.summary || p.content || "").slice(0, 220)}
                    {(p.summary || p.content || "").length > 220 && " …"}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => togglePublish(p.id)}
                      disabled={busy}
                      className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm border ${
                        p.published
                          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500"
                          : "bg-yellow-500 text-black border-yellow-600 hover:bg-yellow-400"
                      } ${busy ? "opacity-70 cursor-wait" : ""}`}
                    >
                      {p.published ? "公開中" : "非公開"}
                    </button>
                    <button
                      onClick={() => handleEdit(p.id)}
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
                      onClick={() => handleDelete(p.id)}
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
              </div>
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

      {/* 編集モーダル：分割プレビュー */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 text-white rounded-2xl w-full max-w-6xl shadow-2xl border border-white/10 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10">
              <h3 className="text-lg md:text-xl font-semibold">
                🛠️ 手順の編集
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
                {procedure && (
                  <button
                    onClick={() => handleUpdate(procedure.id)}
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

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-white/80">stepNumber</label>
                    <input
                      className="w-full text-black border px-3 py-2 rounded"
                      value={stepNumber}
                      onChange={(e) => setStepNumber(e.target.value)}
                      placeholder="ステップ番号（例: 5-09 または 509）"
                    />
                  </div>
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
                      className="w-full text-black px-3 py-2 rounded border"
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
                      className="w-full text-black px-3 py-2 rounded border"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="要約（省略可）"
                      rows={4}
                    />
                  </div>
                </div>

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

              <input
                type="file"
                accept="image/*"
                className="w-full mt-4"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f && f.size > 5 * 1024 * 1024) {
                    alert("5MB以下の画像を選択してください。");
                    return;
                  }
                  setImageFile(f);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 全画面ライティングモード */}
      {isWritingMode && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm">
          <div className="absolute inset-3 bg-gray-900 rounded-2xl shadow-2xl flex flex-col">
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
                {procedure && (
                  <button
                    className="px-3 py-1.5 bg-blue-600 rounded text-white"
                    onClick={() => handleUpdate(procedure.id)}
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

            <div
              className={`flex-1 min-h-0 grid gap-4 p-3 ${
                isSplit ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="min-h-0">
                <MarkdownTextarea
                  value={content}
                  onChange={setContent}
                  rows={28}
                  placeholder="内容（Markdown）"
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
