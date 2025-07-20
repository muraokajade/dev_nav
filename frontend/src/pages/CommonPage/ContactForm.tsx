import { useState } from "react";
import axios from "axios";

export const ContactForm = () => {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      await axios.post("/api/contact", { title, question });
      setTitle("");
      setQuestion("");
      setSent(true);
    } catch (e) {
      alert("失敗しました。")
    }
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg max-w-xl mx-auto mt-8">
      <h2 className="text-xl text-white font-bold mb-4">お問い合わせ</h2>
      <div className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="件名"
          className="w-full px-4 py-2 rounded border text-black"
        />
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="お問い合わせ内容"
          rows={4}
          className="w-full px-4 py-2 rounded border border-zinc-700 text-black"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold text-white transition"
          disabled={sent}
        >
          {sent ? "送信完了！" : "送信"}
        </button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </div>
    </div>
  );
};
