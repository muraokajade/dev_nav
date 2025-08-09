import { useCallback, useEffect, useState } from "react";
import { MessageResponse } from "../../../models/MessageResponse";
import { AdminQuestionPage } from "./AdminQuestionPage";
import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";

export const AdminQAPage = () => {
  // 質問の配列を取得
  const [messages, setMessages] = useState<MessageResponse[]>([]);

  const { idToken } = useAuth();

  // 1. 関数として宣言（useCallbackでメモ化も推奨！）
  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        "/api/messages/admin/questions?page=0&size=5",
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setMessages(res.data);
    } catch (e) {
      console.error("メッセージ取得失敗");
    }
  }, [idToken]);

  useEffect(() => {
    (async() => {
      await fetchMessages();
    })()
  }, [fetchMessages]);

  // 回答送信（1件ごと）
  const handleAnswer = async (id: number, answer: string) => {
    try {
      await axios.post(
        `/api/messages/admin/questions/${id}/answer`,
        { messageId: id, answer },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      alert("回答完了"); // ← ここ！
      fetchMessages();
    } catch (e) {
      alert("回答送信失敗");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Q&A管理
      </h1>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {messages.map((msg) => (
          <AdminQuestionPage
            key={msg.id}
            message={msg}
            onAnswer={(answer) => handleAnswer(msg.id, answer)}
          />
        ))}
      </div>
    </div>
  );
};
