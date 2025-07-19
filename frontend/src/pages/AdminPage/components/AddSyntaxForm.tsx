import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";
import { useState } from "react";

export const AddSyntaxForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
  ];

  const { idToken, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    if (loading) return;
    e.preventDefault();
    if (!slug || !title || !category) {
      alert("すべての項目を入力してください");
      return;
    }

    try {
      await axios.post(
        "/api/admin/add-syntax",
        { slug, title, category, content },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setSlug("");
      setTitle("");
      setCategory("");
      setContent("");
      alert("投稿完了");
    } catch (err) {
      console.error("❌ 投稿失敗", err);
      alert("投稿に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            className="w-full text-black border p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="スラッグ（URL識別子）"
          />
          <input
            className="w-full text-black border p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトル"
          />
          <select
            className="w-full text-black border p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">カテゴリを選択</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <textarea
            className="w-full text-black border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容"
            rows={40}
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            投稿
          </button>
        </form>
      </div>
    </div>
  );
};
