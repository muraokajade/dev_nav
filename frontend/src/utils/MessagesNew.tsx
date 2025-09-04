// src/utils/MessagesNew.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuthContext";
import { apiHelper } from "../libs/apiHelper";

export type TargetType = "ARTICLE" | "SYNTAX" | "PROCEDURE";

/* ---------- DTOs ---------- */
type Row = {
  id: number;
  title: string;
  question: string;
  response?: string | null;
  createdAt: string;
};

type PageRes = {
  content: Row[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
};

/* ---------- helpers ---------- */
// APIの形揺れを吸収（古いDTOでも動くように）
const adaptPage = (raw: any): PageRes => {
  const p = raw?.data ?? raw ?? {};
  const list = p.content ?? p.items ?? p.records ?? p.rows ?? p.list ?? [];
  const size = p.size ?? p.pageSize ?? p?.pageable?.pageSize ?? 20;
  const totalElements =
    p.totalElements ?? p.total ?? p.count ?? list.length ?? 0;
  const page =
    p.page ?? p.number ?? p.pageIndex ?? p?.pageable?.pageNumber ?? 0;
  const totalPages =
    p.totalPages ?? (size ? Math.max(1, Math.ceil(totalElements / size)) : 1);

  const content: Row[] = list.map((it: any) => ({
    id: Number(it.id),
    title: String(it.title ?? ""),
    // 旧フィールド body をフォールバック
    question: String(it.question ?? it.body ?? ""),
    response: it.response ?? null,
    createdAt: it.createdAt ?? it.created_at ?? new Date().toISOString(),
  }));

  return { content, totalPages, totalElements, page, size };
};

/* ---------- Component ---------- */
export const MessagesNew = ({
  targetType,
  refId,
  pageSize = 20,
  debug = false,
}: {
  targetType: TargetType;
  refId: number;
  pageSize?: number;
  debug?: boolean;
}) => {
  const { idToken } = useAuth();

  // composer
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  // list & ui
  const [data, setData] = useState<PageRes | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend のコントローラに合わせて常にこの形に統一
  // GET  /api/messages/{type}/{refId}?page=&size=
  // POST /api/messages/{type}/{refId}
  const baseUrl = useMemo(
    () => `/api/messages/${targetType}/${refId}`,
    [targetType, refId]
  );

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${baseUrl}?page=${page}&size=${pageSize}`;
      if (debug) console.log("[MessagesNew][GET]", url);
      const res = await apiHelper.get(url); // GET は非ログインでもOK
      const pageData = adaptPage((res as any).data);
      if (debug) console.log("[MessagesNew][GET][OK]", pageData);
      setData(pageData);
    } catch (e) {
      if (debug) console.error("[MessagesNew][GET][ERR]", e);
      setError("メッセージ取得に失敗しました。");
      setData({
        content: [],
        totalElements: 0,
        totalPages: 1,
        page: 0,
        size: pageSize,
      });
    } finally {
      setLoading(false);
    }
  }, [baseUrl, page, pageSize, debug]);

  // ref/種別が変わったらページを0に
  useEffect(() => setPage(0), [baseUrl]);

  // 初期＆依存で再取得
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const submit = async () => {
    if (!idToken) return setError("ログインが必要です。");
    const t = title.trim();
    const q = question.trim();
    if (!t || !q) return setError("タイトルと内容は必須です。");

    setPosting(true);
    setError(null);
    try {
      if (debug) console.log("[MessagesNew][POST]", { title: t, question: q });
      await apiHelper.post(
        baseUrl,
        { title: t, question: q },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTitle("");
      setQuestion("");
      setPage(0); // 先頭へ
      await fetchMessages(); // 直後に再取得
    } catch (e) {
      if (debug) console.error("[MessagesNew][POST][ERR]", e);
      setError("メッセージ投稿に失敗しました。");
    } finally {
      setPosting(false);
    }
  };

  const rows = data?.content ?? [];

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-xl text-zinc-100">
      {/* Composer */}
      <h2 className="text-xl font-bold mb-4">質問する</h2>
      {!idToken && (
        <div className="mb-4 text-sm text-zinc-300">
          投稿するにはログインしてください。
        </div>
      )}
      <div className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="w-full px-4 py-2 rounded border text-black"
          disabled={posting || !idToken}
          maxLength={120}
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="内容（Ctrl+Enter / ⌘+Enterで送信）"
          rows={4}
          className="w-full px-4 py-2 rounded border text-black"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              if (!posting) submit();
            }
          }}
          disabled={posting || !idToken}
          maxLength={5000}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            disabled={posting || !idToken}
            className={`px-6 py-2 rounded font-semibold text-white transition ${
              posting || !idToken
                ? "bg-zinc-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {posting ? "送信中..." : "送信"}
          </button>
          {data && (
            <span className="text-xs text-zinc-400">
              {data.totalElements} 件
            </span>
          )}
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>

      {/* 一覧 */}
      <div className="space-y-3">
        {loading && <div className="text-zinc-300 text-sm">読み込み中...</div>}
        {!loading && rows.length === 0 && (
          <div className="text-zinc-400 text-sm">まだ投稿はありません。</div>
        )}
        {rows.map((m) => (
          <div key={m.id} className="rounded-lg bg-zinc-800 p-4">
            <div className="font-semibold mb-1">{m.title}</div>
            <div className="text-sm text-zinc-300 whitespace-pre-wrap">
              {m.question}
            </div>

            {/* 回答があれば表示 */}
            {m.response && (
              <div className="mt-3 rounded-md bg-zinc-900 border border-zinc-700 p-3">
                <div className="text-xs font-semibold text-green-400 mb-1">
                  回答
                </div>
                <div className="text-sm text-zinc-200 whitespace-pre-wrap">
                  {m.response}
                </div>
              </div>
            )}

            <div className="text-xs text-right text-zinc-500 mt-2">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* ページング */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            className="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
          >
            前へ
          </button>
          <div className="text-zinc-300">
            {page + 1} / {data.totalPages}
          </div>
          <button
            className="px-3 py-1 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};
