// src/components/ThreadComments.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiHelper } from "../libs/apiHelper";
import { ThreadMessage, ThreadWithMessages } from "../models/ThreadMessage";
import { useAuth } from "../context/useAuthContext";
import { LoginCTA } from "../utils/LoginCTA";

export type Props = {
  type: "article" | "syntax" | "procedure";
  refId: number;
  category: "comment" | "qa";
  readOnly?: boolean; // 閲覧専用（投稿不可）
  hideComposer?: boolean; // 投稿フォーム自体を非表示
};

// JWTからemail抽出（簡易）
function emailFromIdToken(token?: string | null): string | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return typeof json.email === "string" ? json.email : null;
  } catch {
    return null;
  }
}

export const ThreadComments: React.FC<Props> = ({
  type,
  refId,
  category,
  readOnly = false,
  hideComposer = false,
}) => {
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { idToken } = useAuth();
  const canShowComposer = !readOnly && !hideComposer && !!idToken;
  const myEmail = useMemo(() => emailFromIdToken(idToken), [idToken]);

  // APIパス（例: /api/syntax/123/comment/messages）
  const basePath = useMemo(
    () => `/api/${type}/${refId}/${category}/messages`,
    [type, refId, category]
  );

  // レース対策
  const abortRef = useRef<AbortController | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!refId) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setError(null);
    try {
      const res = await apiHelper.get<ThreadWithMessages>(basePath, {
        signal: ac.signal as AbortSignal,
      });
      setMessages(res.data.messages ?? []);
    } catch (e: any) {
      // axiosのキャンセル名は CanceledError
      if (e?.name === "CanceledError") return;
      console.error(e);
      setError("コメントの取得に失敗しました");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [basePath, refId]);

  useEffect(() => {
    fetchMessages();
    return () => abortRef.current?.abort();
  }, [fetchMessages]);

  // 投稿
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!idToken) {
      alert("ログインしてください");
      return;
    }
    if (!input.trim()) {
      alert("本文を入力してください");
      return;
    }
    try {
      await apiHelper.post(
        basePath,
        { body: input },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setInput("");
      await fetchMessages();
    } catch (e) {
      console.error(e);
      alert("投稿に失敗しました");
    }
  };

  // 削除
  const handleDelete = async (id: number) => {
    if (!window.confirm("本当に削除してよいですか？")) return;
    try {
      await apiHelper.delete(`/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      await fetchMessages();
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  // 更新
  const handleUpdate = async (id: number) => {
    if (!idToken) return alert("ログインしてください");
    if (!editText.trim()) return alert("本文を入力してください");
    try {
      await apiHelper.put(
        `/api/messages/${id}`,
        { body: editText },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setEditingId(null);
      await fetchMessages();
    } catch (e) {
      console.error(e);
      alert("更新に失敗しました");
    }
  };

  // 自分の投稿か？
  // APIの実フィールドに合わせて authorEmail を参照
  const isMine = (m: ThreadMessage) => {
    const email = (m as any).authorEmail as string | undefined;
    return !!(
      myEmail &&
      email &&
      email.toLowerCase() === myEmail.toLowerCase()
    );
  };

  return (
    // ★ 幅制限を解除（親が狭くても突破したい場合は、この親を FullWidth などで包む）
    <section className="not-prose w-full !max-w-none bg-zinc-900 rounded-xl p-6 my-8 shadow-lg text-zinc-100">
      {/* 投稿フォーム or ログイン導線 */}
      {canShowComposer ? (
        <form
          className="w-full py-4 mb-6 border-b-4 border-white"
          onSubmit={handleSubmit}
        >
          <textarea
            className="
              w-full p-3 rounded bg-zinc-100 border text-black border-zinc-700
              focus:ring-2 focus:ring-blue-600 transition
              resize-y
              !min-h-[160px] md:!min-h-[200px]
            "
            rows={8}
            placeholder="コメントを書く..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          >
            投稿
          </button>
        </form>
      ) : !idToken ? (
        <div className="py-4 mb-6 border-b-4 border-white">
          <LoginCTA
            text={`ログインすると${
              category === "qa" ? "Q&Aを投稿" : "コメントを投稿"
            }できます。`}
          />
        </div>
      ) : null}

      {/* 取得状態 */}
      {loading && <div className="text-zinc-300 py-2">読み込み中…</div>}
      {error && !loading && (
        <div className="text-red-300 bg-red-900/30 p-3 rounded mb-3">
          {error}
        </div>
      )}

      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="bg-zinc-800 p-3 rounded">
            {editingId === m.id ? (
              <>
                <textarea
                  className="
                    w-full p-3 rounded bg-zinc-900 border border-zinc-600 text-white
                    resize-y !min-h-[160px]
                  "
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={8}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
                    onClick={() => handleUpdate(m.id)}
                    type="button"
                  >
                    保存
                  </button>
                  <button
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                    onClick={() => setEditingId(null)}
                    type="button"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="whitespace-pre-wrap">{m.body}</p>
                <div className="text-xs text-zinc-400 mt-1">
                  {m.updatedAt
                    ? `更新: ${m.updatedAt}`
                    : `作成: ${m.createdAt}`}
                </div>

                {/* 自分の投稿だけ操作を表示 */}
                {isMine(m) && (
                  <div className="mt-1 flex gap-2">
                    <button
                      className="text-blue-400 hover:text-blue-300 underline"
                      onClick={() => {
                        setEditingId(m.id);
                        setEditText(m.body);
                      }}
                      type="button"
                    >
                      編集
                    </button>
                    <button
                      className="text-red-400 hover:text-red-300 underline"
                      onClick={() => handleDelete(m.id)}
                      type="button"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
        {!loading && !messages.length && (
          <li className="text-zinc-400">まだ投稿はありません。</li>
        )}
      </ul>
    </section>
  );
};
