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
import { Link } from "react-router-dom";
import { LoginCTA } from "../utils/LoginCTA";

export type Props = {
  type: "article" | "syntax" | "procedure";
  refId: number;
  category: "comment" | "qa";
  readOnly?: boolean; // 閲覧専用（投稿不可）
  hideComposer?: boolean; // フォーム自体を非表示
};

// JWT から email を取り出す
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
  const [loading, setLoading] = useState(true); // ← 追加
  const [error, setError] = useState<string | null>(null); // ← 追加

  const { idToken } = useAuth();
  const canShowComposer = !readOnly && !hideComposer && !!idToken;
  const myEmail = useMemo(() => emailFromIdToken(idToken), [idToken]);

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
        signal: ac.signal as any,
      });
      setMessages(res.data.messages ?? []);
    } catch (e: any) {
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

  // - const handleSubmit = async (e: React.FormEvent) => {
  // -   e.preventDefault();
  // -   if (!idToken) return alert("ログインしてください");
  // -   if (!input.trim()) return alert("本文を入力してください");
  // -   try {
  // -     await apiHelper.post(
  // -       basePath,
  // -       { body: input },
  // -       { headers: { Authorization: `Bearer ${idToken}` } }
  // -     );
  // -     setInput("");
  // -     await fetchMessages();
  // -   } catch (e) {
  // -     console.error(e);
  // -     alert("投稿に失敗しました");
  // -   }
  // - };
  // ↑ onClick との型不一致を解消。form submit に寄せる。
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

  const handleDelete = async (id: number) => {
    const ok = window.confirm("本当に削除してよいですか？");
    if (!ok) return;
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

  // 自分の投稿かの判定
  // - m.userId?.toLowerCase() === myEmail.toLowerCase()
  // ↓ emailフィールド（authorEmail想定）で比較。なければサーバに isMine を実装するのが最善。
  const isMine = (m: ThreadMessage) => {
    const email = (m as any).authorEmail as string | undefined; // API の実フィールド名に合わせて
    return !!(
      myEmail &&
      email &&
      email.toLowerCase() === myEmail.toLowerCase()
    );
  };

  return (
    <section className="bg-zinc-900 rounded-xl p-6 my-8 shadow-lg max-w-3xl text-zinc-100">
      {/* 投稿フォーム or ログイン導線 */}
      {canShowComposer ? (
        // 投稿フォーム（formに変更）
        <form
          className="py-4 mb-6 border-b-4 border-white"
          onSubmit={handleSubmit}
        >
          <textarea
            className="w-full p-2 rounded bg-zinc-100 border text-black border-zinc-700 resize-none min-h-[70px] focus:ring-2 focus:ring-blue-600 transition"
            rows={5}
            placeholder="コメントを書く..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit" // ← 送信
            className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          >
            投稿
          </button>
        </form>
      ) : !idToken ? (
        // 未ログインだけログイン導線を表示
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
                  className="w-full p-1 rounded bg-zinc-900 border border-zinc-600 text-white"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={5}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-1 bg-green-600 rounded text-white"
                    onClick={() => handleUpdate(m.id)}
                    type="button"
                  >
                    保存
                  </button>
                  <button
                    className="px-3 py-1 bg-zinc-700 rounded text-white"
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

                {/* 自分の投稿だけ操作表示 */}
                {isMine(m) && (
                  <div className="mt-1 flex gap-2">
                    <button
                      className="text-blue-400 underline"
                      onClick={() => {
                        setEditingId(m.id);
                        setEditText(m.body);
                      }}
                      type="button"
                    >
                      編集
                    </button>
                    <button
                      className="text-red-400 underline"
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
