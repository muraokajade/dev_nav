// src/components/ThreadComments.tsx
import React, { useEffect, useMemo, useState } from "react";
import { apiHelper } from "../libs/apiHelper";

/** サーバは userId を email 文字列で返す場合があるため string | number で受ける */
type ThreadItem = {
  id: number;
  userId: string | number;
  title?: string;
  body?: string;
  question?: string;
  response?: string | null;
  createdAt: string;
};

type PageRes = {
  content: ThreadItem[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
};

/** ThreadWithMessagesDto（{ thread, messages }）にも対応 */
const adaptPage = (raw: any): PageRes => {
  const p = raw?.data ?? raw ?? {};
  const list =
    p.content ??
    p.messages ?? // ★ ThreadWithMessagesDto 用
    p.items ??
    p.records ??
    p.rows ??
    p.list ??
    [];
  const size = p.size ?? p.pageSize ?? p?.pageable?.pageSize ?? 20;
  const totalElements =
    p.totalElements ??
    p.total ??
    p.count ??
    (Array.isArray(list) ? list.length : 0);
  const page =
    p.page ?? p.number ?? p.pageIndex ?? p?.pageable?.pageNumber ?? 0;
  const totalPages =
    p.totalPages ?? (size ? Math.max(1, Math.ceil(totalElements / size)) : 1);

  const normalized: ThreadItem[] = (list as any[]).map((m) => {
    const rawUid = m.userId ?? m.authorId ?? "";
    // 数値文字列は number に寄せる。email はそのまま小文字化して保持（isMine 側で比較）
    const uid =
      typeof rawUid === "string" && /^\d+$/.test(rawUid.trim())
        ? Number(rawUid.trim())
        : typeof rawUid === "string"
        ? rawUid.trim()
        : Number.isFinite(rawUid)
        ? Number(rawUid)
        : "";

    return {
      id: Number(m.id),
      userId: uid,
      title: m.title ?? "",
      body: m.body ?? m.question ?? "",
      question: m.question ?? undefined,
      response: m.response ?? null,
      createdAt: m.createdAt ?? new Date().toISOString(),
    };
  });

  return { content: normalized, totalPages, totalElements, page, size };
};

type TypeUpper = "SYNTAX" | "ARTICLE" | "PROCEDURE";
type Category = "qa" | "comment";

/** バックエンドのパスは単数形・小文字が本線 */
const TYPE_PATH: Record<TypeUpper, "article" | "syntax" | "procedure"> = {
  ARTICLE: "article",
  SYNTAX: "syntax",
  PROCEDURE: "procedure",
};

type Props = {
  type: TypeUpper;
  refId: number;
  category: Category; // "qa" はタイトル＋本文、"comment" は本文のみ
  readOnly?: boolean;
  hideComposer?: boolean;
  myUserId?: number | null; // 数値ID運用時の所有者判定に利用可
  myEmail?: string | null; // email運用時の所有者判定（推奨）
  authHeader?: Record<string, string>;
  debug?: boolean;
};

export const ThreadComments: React.FC<Props> = ({
  type,
  refId,
  category,
  readOnly = false,
  hideComposer = false,
  myUserId = null,
  myEmail = null,
  authHeader,
  debug = false,
}) => {
  const [data, setData] = useState<PageRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // コメント（本文のみ）
  const [text, setText] = useState("");

  // Q&A（タイトル + 本文）
  const isQA = category === "qa";
  const [qaTitle, setQaTitle] = useState("");
  const [qaBody, setQaBody] = useState("");

  // 編集
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const typePath = useMemo(() => TYPE_PATH[type], [type]);

  /** ルートは単数形・小文字固定（サーバ側で複数形や大文字も吸収するが、ここは正規形に寄せる） */
  const baseUrl = useMemo(
    () => `/api/${typePath}/${refId}/${category}/messages`,
    [typePath, refId, category]
  );

  /** QA表示整形：title/question が空なら body を「最初の段落=タイトル、以降=本文」に分割 */
  const pickQa = (item: ThreadItem) => {
    let title = (item.title ?? "").trim();
    let q = (item.question ?? item.body ?? "").toString();
    if (!title) {
      const byPara = q.split(/\r?\n\r?\n/);
      if (byPara.length > 1) {
        title = byPara[0].trim();
        q = byPara.slice(1).join("\n\n").trim();
      } else {
        const lines = q.split(/\r?\n/);
        title = (lines[0] ?? "").trim();
        q = lines.slice(1).join("\n").trim();
      }
    }
    return { title, body: q };
  };

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      debug && console.log("[ThreadComments][GET]", baseUrl);
      const res = await apiHelper.get(`${baseUrl}?page=0&size=20`, {
        headers: authHeader,
      });
      const pageData = adaptPage((res as any).data);
      debug && console.log("[ThreadComments][GET][OK]", pageData);
      setData(pageData);
    } catch (e: any) {
      console.error("[ThreadComments][GET][ERR]", e?.response ?? e);
      setError("スレッドの取得に失敗しました");
      setData({
        content: [],
        totalElements: 0,
        totalPages: 1,
        page: 0,
        size: 20,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  /** 著者IDの正規化（数値文字列→number / email 小文字化） */
  const normalizeAuthor = (id: string | number) => {
    if (id == null) return { num: null as number | null, str: "" };
    if (typeof id === "number") return { num: id, str: "" };
    const s = String(id).trim();
    return { num: /^\d+$/.test(s) ? Number(s) : null, str: s.toLowerCase() };
  };

  /** 自分の投稿判定：数値ID一致 or email一致（両方あればどちらでも一致でOK） */
  const isMine = (authorId: string | number) => {
    const a = normalizeAuthor(authorId);
    if (myUserId != null && a.num != null) return myUserId === a.num;
    if (myEmail) return myEmail.trim().toLowerCase() === a.str;
    return false;
  };

  /** 投稿 */
  const handlePost = async () => {
    setPosting(true);
    setError(null);

    const composed = isQA
      ? `${qaTitle.trim()}\n\n${qaBody.trim()}`
      : text.trim();
    if (!composed) {
      setPosting(false);
      return;
    }

    // サーバは body 必須。QA でも body に「タイトル\n\n本文」を入れて保存する。
    const payload: any = { body: composed };
    // 互換性のため付けておく（無視されてもOK）
    if (isQA) {
      payload.title = qaTitle.trim();
      payload.question = qaBody.trim();
    } else {
      payload.question = composed;
    }

    try {
      debug && console.log("[ThreadComments][POST]", baseUrl, payload);
      await apiHelper.post(baseUrl, payload, { headers: authHeader });
      // 入力リセット & 即再取得（＝即時反映）
      setText("");
      setQaTitle("");
      setQaBody("");
      await fetchPage();
    } catch (e: any) {
      console.error("[ThreadComments][POST][ERR]", e?.response ?? e);
      setError("投稿に失敗しました");
    } finally {
      setPosting(false);
    }
  };

  /** 編集開始 */
  const startEdit = (item: ThreadItem) => {
    setEditingId(item.id);
    if (isQA) {
      const qa = pickQa(item);
      setEditTitle(qa.title);
      setEditText(qa.body);
    } else {
      setEditText(item.body ?? item.question ?? "");
    }
  };

  /** 編集確定 */
  const doEdit = async () => {
    if (!editingId) return;
    const newBody = isQA
      ? `${editTitle.trim()}\n\n${editText.trim()}`
      : editText.trim();
    if (!newBody) return;

    try {
      await apiHelper.put(
        `/api/messages/${editingId}`,
        { body: newBody },
        { headers: authHeader }
      );
      setEditingId(null);
      setEditTitle("");
      setEditText("");
      await fetchPage();
    } catch (e) {
      console.error("[ThreadComments][PUT][ERR]", e);
      setError("編集に失敗しました");
    }
  };

  /** 削除 */
  const doDelete = async (id: number) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await apiHelper.delete(`/api/messages/${id}`, { headers: authHeader });
      await fetchPage();
    } catch (e) {
      console.error("[ThreadComments][DELETE][ERR]", e);
      setError("削除に失敗しました");
    }
  };

  if (loading && !data)
    return <div className="text-sm text-zinc-400">読み込み中...</div>;

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 p-2 rounded">
          {error}
        </div>
      )}

      {/* Composer（上部固定） */}
      {!readOnly && !hideComposer && (
        <div className="rounded-lg bg-white p-4 space-y-3">
          {isQA ? (
            <>
              <input
                className="w-full rounded border border-zinc-300 bg-white p-2 text-sm text-black"
                placeholder="タイトル"
                value={qaTitle}
                onChange={(e) => setQaTitle(e.target.value)}
                maxLength={120}
              />
              <textarea
                className="w-full rounded border border-zinc-300 bg-white p-2 text-sm text-black"
                rows={4}
                placeholder="本文（Ctrl+Enterで送信）"
                value={qaBody}
                onChange={(e) => setQaBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    !posting && handlePost();
                  }
                }}
                maxLength={5000}
              />
            </>
          ) : (
            <textarea
              className="w-full rounded border border-zinc-300 bg-white p-2 text-sm text-black"
              rows={3}
              placeholder="コメントを書く…（Ctrl+Enterで送信）"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  !posting && handlePost();
                }
              }}
              maxLength={5000}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-600">
              {myEmail
                ? `投稿者: ${myEmail}`
                : myUserId != null
                ? `投稿者ID: ${myUserId}`
                : "ログイン情報なし"}
            </div>
            <button
              className="text-sm px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white"
              disabled={
                posting ||
                (!isQA && !text.trim()) ||
                (isQA && (!qaTitle.trim() || !qaBody.trim()))
              }
              onClick={handlePost}
            >
              {posting ? "投稿中…" : "投稿する"}
            </button>
          </div>
        </div>
      )}

      {/* 一覧 */}
      {(data?.content ?? []).map((t) => {
        const mine = isMine(t.userId);
        const display = isQA
          ? pickQa(t)
          : { title: "", body: t.body ?? t.question ?? "" };

        return (
          <div key={t.id} className="rounded-lg bg-zinc-800 p-4">
            {editingId === t.id ? (
              <div className="space-y-2">
                {isQA && (
                  <input
                    className="w-full rounded border border-zinc-600 bg-zinc-900 p-2 text-sm text-white"
                    placeholder="タイトル"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                  />
                )}
                <textarea
                  className="w-full rounded border border-zinc-600 bg-zinc-900 p-2 text-sm text-white"
                  rows={isQA ? 4 : 3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-sm"
                    onClick={doEdit}
                  >
                    保存
                  </button>
                  <button
                    className="px-3 py-1.5 rounded bg-zinc-600 hover:bg-zinc-500 text-white text-sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditTitle("");
                      setEditText("");
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isQA && (
                  <div className="font-semibold text-zinc-100 mb-1">
                    {display.title || "(無題)"}
                  </div>
                )}
                <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                  {display.body}
                </div>

                {t.response && (
                  <div className="mt-3 rounded bg-zinc-900/70 p-3">
                    <div className="text-xs font-semibold text-zinc-400 mb-1">
                      回答
                    </div>
                    <div className="text-sm text-zinc-200 whitespace-pre-wrap">
                      {t.response}
                    </div>
                  </div>
                )}

                <div className="text-xs text-right text-zinc-500 mt-2">
                  {new Date(t.createdAt).toLocaleString()}
                </div>

                {!readOnly && mine && (
                  <div className="mt-2 flex gap-2 justify-end">
                    <button
                      className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-semibold"
                      onClick={() => startEdit(t)}
                    >
                      編集
                    </button>
                    <button
                      className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                      onClick={() => doDelete(t.id)}
                    >
                      削除
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {!loading && (data?.content?.length ?? 0) === 0 && (
        <div className="text-zinc-400 text-sm">まだ投稿はありません。</div>
      )}
    </div>
  );
};
