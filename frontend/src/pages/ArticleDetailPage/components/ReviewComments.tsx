import React, { useCallback, useEffect, useState } from "react";
import { Comments } from "../../../models/Comments"; 
import { useAuth } from "../../../context/useAuthContext"; 
import axios from "axios";

export const ReviewComments: React.FC<{
  articleId: number;
  myUserId: number;
}> = ({ articleId, myUserId }) => {
  const [comments, setComments] = useState<Comments[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const { idToken } = useAuth();

  // fetchCommentsをuseCallbackで定義
  const fetchComments = useCallback(() => {
    axios
      .get(`/api/review-comments?articleId=${articleId}`)
      .then((res) => setComments(res.data))
      .catch((e) => console.error("取得失敗", e));
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) return;
    try {
      await axios.post(
        "/api/review-comments",
        { articleId, comment: input },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setInput("");
    } catch (e) {
      alert("失敗しました");
    }
  };

  const handleEdit = (id: number) => {};
  const handleDelete = async(id: number) => {
    const ok = window.confirm("本当に削除してよいですか？");
    if(!ok) return;
    try {
        await axios.delete(`/api/review-comments/${id}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        fetchComments(); // 再取得
      } catch (e) {
        alert("削除に失敗しました");
      }
  };
  const handleUpdate = async (id: number) => {
    try {
      await axios.put(
        `/api/review-comments/${id}`,
        { comment: editText },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setEditingId(null);
      await fetchComments();
    } catch (e) {
      alert("更新失敗しました。");
    }
  };

  return (
    <section className="bg-zinc-900 rounded-xl p-6 my-8 shadow-lg max-w-3xl text-zinc-100">
      <h3 className="font-bold mb-3 text-lg text-zinc-200">コメント</h3>
      <div className="py-4 mb-6 border-b-4 border-white">
        <textarea
          className="w-full p-2 rounded bg-zinc-100 border text-black border-zinc-700 resize-none min-h-[70px] focus:ring-2 focus:ring-blue-600 transition"
          rows={5}
          placeholder="コメントを書く..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          onClick={handleSubmit}
        >
          投稿
        </button>
      </div>
      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="bg-zinc-800 p-3 rounded">
            {editingId === c.id ? (
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
                    onClick={() => handleUpdate(c.id)}
                  >
                    保存
                  </button>
                  <button
                    className="px-3 py-1 bg-zinc-700 rounded text-white"
                    onClick={() => setEditingId(null)}
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="whitespace-pre-wrap">{c.comment}</p>
                <div className="text-xs text-zinc-400 mt-1">
                  {c.updatedAt
                    ? `更新: ${c.updatedAt}`
                    : `作成: ${c.createdAt}`}
                </div>
                {c.userId === myUserId && (
                  <div className="mt-1 flex gap-2">
                    <button
                      className="text-blue-400 underline"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditText(c.comment);
                      }}
                    >
                      編集
                    </button>
                    <button
                      className="text-red-400 underline"
                      onClick={() => handleDelete(c.id)}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
