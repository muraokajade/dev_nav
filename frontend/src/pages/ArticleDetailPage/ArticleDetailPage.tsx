import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ReviewScore } from "../../utils/ReviewScore";
import { useAuth } from "../../context/useAuthContext";
import axios from "axios";
import { ReviewComments } from "../../utils/ReviewComments";
import { LikeButton } from "../../utils/LikeButton";

export const ArticleDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const { idToken } = useAuth();
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);

  //console.log(idToken);
  const handleLike = async () => {
    if (!idToken) return;
    if (liked) {
      try {
        await axios.delete(`/api/likes/${articleId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } catch (e) {
        console.error("削除失敗", e);
      }
    } else {
      try {
        await axios.post(
          "/api/likes",
          { articleId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } catch (e) {
        console.error("いいね失敗", e);
      }
    }
  };
  // 記事読了API用のハンドラ追加
  const handleRead = async () => {
    if (!idToken || !articleId) return;
    try {
      await axios.post(
        "/api/articles/read",
        { articleId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setIsRead(true);
      alert("完了");
    } catch (e) {
      alert("読了登録失敗");
      console.error(e);
    }
  };
  // 「既読済みか」初回取得（オプション：DB側で既読チェックAPIがあれば）
  useEffect(() => {
    if (!idToken || !articleId) return;
    axios
      .get(`/api/articles/read/status?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setIsRead(res.data.read ?? false))
      .catch(() => setIsRead(false));
  }, [idToken, articleId]);

  //いいね情報取得初回表示
  useEffect(() => {
    if (!idToken || !articleId) return;
    axios
      .get(`/api/likes/status?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        setLiked(res.data.liked);
        setLikeCount(res.data.count);
      });
  }, [articleId, idToken]);

  // ユーザー情報取得
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
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 本文エリアだけ狭めに中央寄せ */}
      <LikeButton liked={liked} count={likeCount} onClick={handleLike} />
      <div className="prose prose-invert max-w-4xl mx-auto py-10">
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
      </div>

      {/* レビューとコメントはやや広めの領域で中央寄せ */}
      {articleId && myUserId != null && (
        <div className="max-w-4xl w-full mx-auto px-4">
          <ReviewScore articleId={articleId} myUserId={myUserId} />
          <ReviewComments articleId={articleId} myUserId={myUserId} />
        </div>
      )}
      <div className="flex justify-end max-w-4xl mx-auto mt-4">
        <button
          className={`px-4 py-2 rounded font-bold shadow transition ${
            isRead
              ? "bg-green-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={isRead}
          onClick={handleRead}
        >
          {isRead ? "読了済み" : "この記事を読了する"}
        </button>
      </div>

      {/* 戻るボタンも本文と同じ幅で中央寄せ */}
      <div className="prose prose-invert max-w-3xl mx-auto py-8">
        <Link to="/tech">
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
