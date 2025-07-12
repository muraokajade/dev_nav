import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";
import { useState } from "react";
import ReactMarkdown from "react-markdown"; // 追加
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const AddArticleForm = () => {
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [sectionTitle, setSectionTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { idToken, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    if (loading) return;
    e.preventDefault();
    if (!slug || !title || !sectionTitle || !content || !imageFile) {
      alert("すべての項目を入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("sectionTitle", sectionTitle);
    formData.append("content", content);
    formData.append("image", imageFile);

    try {
      await axios.post("/api/admin/add-article", formData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          // "Content-Type": "multipart/form-data",
        },
      });
      setSlug("");
      setTitle("");
      setSectionTitle("");
      setContent("");
      setImageFile(null);
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
          <textarea
            className="w-full text-black border p-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="内容"
            rows={40}
          />

          {/* --- Markdownプレビュー --- */}
          <div className="prose prose-invert max-w-none mt-2 p-4 bg-gray-800 rounded text-white">
            <div className="font-bold mb-1">プレビュー:</div>
            <ReactMarkdown
              children={content}
              components={{
                code({ node, className, children, ...props }) {
                  // ↓「classNameにlanguage-xxxが付いていれば“ブロック”、なければインライン」
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="not-prose"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
              }}
            />
          </div>

          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                console.log("📁 選択したファイル:", e.target.files[0]);
                setImageFile(e.target.files[0]);
              }
            }}
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
