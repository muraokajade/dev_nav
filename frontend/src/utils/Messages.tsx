import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/useAuthContext";
import { MessageResponse } from "../models/MessageResponse";
import axios from "axios";

export const Messages: React.FC<{
  articleId: number;
  myUserId: number;
}> = ({ articleId, myUserId }) => {
  // 投稿用
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  // Q&A一覧
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  // エラーやローディングも必要なら追加
  const [error, setError] = useState<string | null>(null);
  const { idToken } = useAuth();

  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(`/api/messages?articleId=${articleId}`);
      setMessages(res.data);
    } catch (e) {
      setError("メッセージ取得失敗");
    }
  }, [articleId]);
  // メッセージ一覧取得
  useEffect(() => {
    (async() => {
      await fetchMessages();
    })();
  }, [fetchMessages]);

  const handleSubmit = async () => {
    if (!idToken) return;
    try {
      await axios.post(
        `/api/messages/add`,
        { articleId, title, question },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setTitle("");
      setQuestion("");
      await fetchMessages();
    } catch (e) {
      setError("投稿失敗");
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-xl mx-auto mt-8">
      {/* 投稿フォーム */}
      <h2 className="text-xl font-bold mb-4">記事に質問する</h2>
      <div className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          className="w-full px-4 py-2 rounded border text-black"
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="質問内容"
          rows={3}
          className="w-full px-4 py-2 rounded border border-zinc-700 text-black"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white transition"
        >
          質問を送信
        </button>
      </div>

      {/* Q&A一覧 */}
      <h3 className="text-lg font-bold mb-2">Q&A一覧</h3>
      <ul className="space-y-4">
        {messages.map((msg) => (
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
            <div className="pl-6 mb-2 text-zinc-200">{msg.question}</div>
            {msg.response ? (
              <div className="flex items-center gap-2 pl-6 mt-1">
                <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold">
                  A
                </span>
                <span className="text-green-300">{msg.response}</span>
              </div>
            ) : (
              <div className="pl-6 text-xs text-yellow-300">未回答</div>
            )}
            <div className="text-xs text-right mt-2 text-gray-400">
              {msg.closed ? "対応済み" : "未対応"}
            </div>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="text-gray-400">まだ質問はありません</li>
        )}
      </ul>
    </div>
  );
};
