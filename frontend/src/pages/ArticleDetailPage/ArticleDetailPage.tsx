import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ReviewScore } from "./ReviewScore";
import { useAuth } from "../../context/useAuthContext";
import axios from "axios";

export const ArticleDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const { idToken } = useAuth();
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState<number | null>(null);

  // ユーザー情報
  useEffect(() => {
    if (idToken) {
      axios
        .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
        .then((res) => setMyUserId(res.data.id));
    }
  }, [idToken]);


  // 記事詳細をAPIから取得
  useEffect(() => {
    if (!id) return;
    axios.get(`/api/articles/${id}`).then((res) => {
      setContent(res.data.content);
      setArticleId(res.data.id);
      // 他のフィールド（titleなど）もここでセット可能
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-3xl mx-auto">
        <div className="prose prose-invert max-w-4xl mx-auto py-10 min-h-screen">
          <ReactMarkdown
            children={content}
            components={{
              code({ className, children, ...props }: any) {
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

          {articleId && myUserId != null && (
            <ReviewScore articleId={articleId} myUserId={myUserId} />
          )}

          <Link to="/tech">
            <p className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
              技術記事一覧に戻る
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
