import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown"; // 追加
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownToolbar } from "../../../utils/MarkdownToolbar";
import { MarkdownTextarea } from "../../../utils/MarkdownTextarea";

export const AddProcedureForm = () => {
  const [stepNumber, setStepNumber] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    if (!slug || !title || !category || !content) {
      alert("入力項目に不足があります。");
      return;
    }

    const formData = new FormData();
    formData.append("stepNumber", stepNumber);
    formData.append("slug", slug);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post("/api/admin/add-procedure", formData, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          // "Content-Type": "multipart/form-data",
        },
      });
      setStepNumber("");
      setSlug("");
      setTitle("");
      setCategory("");
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
        <button
          type="button"
          className="mb-4 px-4 py-2 bg-gray-600 rounded text-white"
          onClick={() => setIsPreviewOpen(true)}
        >
          プレビューを見る
        </button>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            className="w-full text-black border p-2"
            value={stepNumber}
            onChange={(e) => setStepNumber(e.target.value)}
            placeholder="手順番号（例: 1-01）"
          />
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

          <MarkdownTextarea
            value={content}
            onChange={setContent}
            rows={30}
            placeholder="内容"
          />

          <input
            type="file"
            accept="image/*"
            className="w-full"
            onChange={(e) => {
              if (e.target.files?.[0]) {
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

        {/* プレビューモーダル */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div
              className="
              bg-gray-900 rounded-xl shadow-lg p-6 max-w-2xl w-full relative
              max-h-[80vh] flex flex-col
            "
            >
              <button
                className="absolute top-2 right-3 text-xl text-white"
                onClick={() => setIsPreviewOpen(false)}
              >
                ×
              </button>
              <div className="font-bold mb-3 text-white">プレビュー</div>
              <div
                className="
                prose prose-invert max-w-none bg-gray-800 p-4 rounded
                flex-1 overflow-y-auto break-words
              "
              >
                <ReactMarkdown
                  children={content}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = Array.isArray(children)
                        ? children.join("")
                        : String(children);

                      return match ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="not-prose"
                          {...props}
                        >
                          {codeString.replace(/\n$/, "")}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
