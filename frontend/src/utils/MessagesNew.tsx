import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuthContext";
import { apiHelper } from "../libs/apiHelper";

type TargetType = "ARTICLE" | "SYNTAX" | "PROCEDURE";

type MessageResponseDTO = {
  id: number;
  title: string;
  question: string;
  response?: string | null;
  closed: boolean;
  createdAt: string;
};

type MessagePageResponse = {
  content: MessageResponseDTO[];
  totalPages: number;
  totalElements: number;
  page: number; // 0-based
  size: number;
};

export const MessagesNew: React.FC<{
  targetType: TargetType;
  refId: number;
  myUserId?: number; // 使わないので props に残してもOK
}> = ({ targetType, refId }) => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  const [data, setData] = useState<MessagePageResponse | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { idToken } = useAuth();

  // - API ベースURL（バックエンドのマッピングに合わせる）
  //   例: POST/GET /api/messages/article/123?page=0&size=20
  const baseUrl = useMemo(() => {
    return `/api/messages/${targetType.toLowerCase()}/${refId}`;
  }, [targetType, refId]);

  // - 対象が変わったら 1 ページ目へ
  useEffect(() => setPage(0), [targetType, refId]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiHelper.get<MessagePageResponse>(
        `${baseUrl}?page=${page}&size=${size}`
      );
      setData(res.data);
    } catch (e) {
      setError("メッセージ取得に失敗しました。");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, page, size]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async () => {
    if (!idToken) {
      setError("ログインが必要です。");
      return;
    }
    // - 簡易バリデーション
    const t = title.trim();
    const q = question.trim();
    if (!t || !q) {
      setError("タイトルと質問は必須です。");
      return;
    }
    if (t.length > 120) {
      setError("タイトルは120文字以内で入力してください。");
      return;
    }
    if (q.length > 5000) {
      setError("質問は5000文字以内で入力してください。");
      return;
    }

    setPosting(true);
    setError(null);
    try {
      await apiHelper.post(
        baseUrl,
        { title: t, question: q },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTitle("");
      setQuestion("");
      // - 新着が先頭に来るAPIなら 1 ページ目に戻すとすぐ見える
      setPage(0); // -
      await fetchMessages();
    } catch (e) {
      setError("投稿に失敗しました。");
    } finally {
      setPosting(false);
    }
  };

  // - Ctrl+Enter で送信
  const onQuestionKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!posting) handleSubmit();
    }
  };

  const msgs = data?.content ?? [];
  const canPrev = !!data && data.page > 0;
  const canNext = !!data && data.page < data.totalPages - 1;

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-xl mx-auto mt-8 text-zinc-100">
      {/* - 未ログイン時はフォームを隠す（親でも制御しているが二重保険） */}
      {idToken ? (
        <>
          <h2 className="text-xl font-bold mb-4">質問する</h2>
          <div className="space-y-3 mb-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              className="w-full px-4 py-2 rounded border text-black"
              disabled={posting}
              // - 任意: ブラウザの補助
              maxLength={120}
            />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onQuestionKeyDown} // - 追加
              placeholder="質問内容（Ctrl+Enterで送信）"
              rows={4}
              className="w-full px-4 py-2 rounded border border-zinc-700 text-black"
              disabled={posting}
              maxLength={5000} // -
            />
            <button
              onClick={handleSubmit}
              disabled={posting}
              className={`px-6 py-2 rounded font-semibold text-white transition ${
                posting
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {posting ? "送信中..." : "質問を送信"}
            </button>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
        </>
      ) : (
        <div className="mb-6 p-4 rounded bg-white/5 text-sm">
          Q&Aを投稿するにはログインしてください。
        </div>
      )}

      {/* Q&A一覧 */}
      <div className="flex items-end justify-between mb-2">
        <h3 className="text-lg font-bold">Q&A一覧</h3>
        <div className="text-sm text-zinc-400">
          {loading
            ? "読み込み中..."
            : data
            ? `全 ${data.totalElements} 件 / ${data.page + 1} / ${Math.max(
                1,
                data.totalPages
              )} ページ`
            : "—"}
        </div>
      </div>

      <ul className="space-y-4">
        {msgs.map((msg) => (
          <li
            key={msg.id}
            className="bg-zinc-800 rounded-lg p-4 shadow flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-bold">
                Q
              </span>
              <span className="font-semibold">{msg.title}</span>
            </div>
            <div className="pl-6 mb-2 text-zinc-200 whitespace-pre-wrap">
              {msg.question}
            </div>

            {msg.response ? (
              <div className="flex items-center gap-2 pl-6 mt-1">
                <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                  A
                </span>
                <span className="text-green-300 whitespace-pre-wrap">
                  {msg.response}
                </span>
              </div>
            ) : (
              <div className="pl-6 text-xs text-yellow-300">未回答</div>
            )}

            <div className="text-xs text-right mt-2 text-gray-400">
              {msg.closed ? "対応済み" : "未対応"}・
              {new Date(msg.createdAt).toLocaleString()}
            </div>
          </li>
        ))}

        {!loading && msgs.length === 0 && (
          <li className="text-gray-400">まだ質問はありません</li>
        )}
      </ul>

      {/* ページャ */}
      <div className="flex items-center gap-3 mt-4 justify-end text-sm">
        <button
          disabled={!canPrev}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className={`px-3 py-1 rounded ${
            !canPrev
              ? "bg-zinc-700 text-zinc-400"
              : "bg-zinc-700 hover:bg-zinc-600 text-white"
          }`}
        >
          前へ
        </button>
        <span className="text-zinc-300">
          {data
            ? `${data.page + 1} / ${Math.max(1, data.totalPages)}`
            : "- / -"}
        </span>
        <button
          disabled={!canNext}
          onClick={() => setPage((p) => p + 1)}
          className={`px-3 py-1 rounded ${
            !canNext
              ? "bg-zinc-700 text-zinc-400"
              : "bg-zinc-700 hover:bg-zinc-600 text-white"
          }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};
