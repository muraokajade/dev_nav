import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";
import { useState } from "react";

export const AddSyntaxForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");

  const { idToken, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    if (loading) return;
    e.preventDefault();
    if (!slug || !title || !sectionTitle) {
      alert("すべての項目を入力してください");
      return;
    }

    //これは間違い!!
    // const formData = new FormData();
    // formData.append("slug", slug);
    // formData.append("title", title);
    // formData.append("sectionTitle", sectionTitle);

    try {
      await axios.post(
        "/api/admin/add-syntax",
        { slug, title, sectionTitle },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      setSlug("");
      setTitle("");
      setSectionTitle("");
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
          <input
            className="w-full text-black border p-2"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="セクションタイトル"
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
