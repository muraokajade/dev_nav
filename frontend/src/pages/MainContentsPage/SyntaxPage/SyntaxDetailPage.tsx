import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";

import { useAuth } from "../../../context/useAuthContext";
import axios from "axios";
import { LikeButton } from "../../../utils/LikeButton";
import { SyntaxDetailActions } from "./SyntaxDetailActions";

export const SyntaxDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const { idToken } = useAuth();
  //console.log(idToken);

  // リッチ化用：記事メタ情報
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [syntaxId, setSyntaxId] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // いいね
  const handleLike = async () => {
    if (!idToken) return;
    if (liked) {
      try {
        await axios.delete(`/api/syntaxes/likes?syntaxId=${syntaxId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } catch (e) {
        console.error("削除失敗", e);
      }
    } else {
      try {
        await axios.post(`/api/syntaxes/likes?syntaxId=${syntaxId}`, null, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } catch (e) {
        console.error("いいね失敗", e);
      }
    }
  };

  // 読了
  // 読了トグル
  const handleRead = async () => {
    if (!idToken || !syntaxId) return;
    try {
      if (!isRead) {
        await axios.post(
          "/api/syntaxes/read",
          { contentId: syntaxId }, // syntaxIdでもOKだが汎用名に統一
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setIsRead(true);
        alert("完了");
      } else {
        await axios.delete(`/api/syntaxes/read/${syntaxId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setIsRead(false);
        alert("読了解除");
      }
    } catch (e) {
      console.error(e);
      alert(isRead ? "解除失敗" : "読了登録失敗");
    }
  };

  // 読了状態取得（/api/syntaxes/read/status）
  useEffect(() => {
    if (!idToken || !syntaxId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get("/api/syntaxes/read/status", {
          params: { contentId: syntaxId }, // procedureId/articleId/syntaxId も可
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!cancelled) setIsRead(!!res.data?.read);
      } catch {
        if (!cancelled) setIsRead(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idToken, syntaxId]);

  //いいね状態取得
  useEffect(() => {
    if (!idToken || !syntaxId) return;
    axios
      .get(`/api/syntaxes/likes/status?syntaxId=${syntaxId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        console.log(res.data);
        setLiked(res.data.liked);
        setLikeCount(res.data.count);
      });
  }, [syntaxId, idToken]);

  //api/me
  useEffect(() => {
    if (idToken) {
      axios
        .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
        .then((res) => setMyUserId(res.data.id));
    }
  }, [idToken]);

  // 記事メタ＆本文取得
  useEffect(() => {
    if (!id) return;
    axios.get(`/api/syntaxes/${id}`).then((res) => {
      console.log(res.data);
      setTitle(res.data.title);
      console.log(res.data);
      setAuthor(res.data.authorName ?? "（不明）");
      setCreatedAt(res.data.createdAt ?? "");
      setCategory(res.data.category ?? "");
      setContent(res.data.content);
      setSyntaxId(res.data.id);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* いいねボタン */}
      <LikeButton liked={liked} count={likeCount} onClick={handleLike} />

      {/* リッチ化された記事カード */}
      <div className="prose prose-invert max-w-4xl mx-auto py-10 bg-zinc-900 rounded-2xl shadow-2xl mb-8">
        {/* サムネイル（必要に応じて） */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        {/* タイトル */}
        <h1 className="text-4xl font-bold mb-4">{title}</h1>

        {/* 著者・日付・カテゴリ */}
        <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm">
          <span>著者: {author}</span>
          {createdAt && (
            <span>投稿日: {dayjs(createdAt).format("YYYY/MM/DD")}</span>
          )}
          {category && (
            <span className="bg-blue-500 px-2 py-0.5 rounded text-white">
              {category}
            </span>
          )}
        </div>

        {/* 本文 */}
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

      {/* レビュー・コメント・Q&Aタブ */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex flex-wrap gap-4 items-center md:justify-between">
          <div className="flex items-center gap-3">
            {syntaxId && (
              <SyntaxDetailActions
                syntaxId={syntaxId}
                myUserId={myUserId ?? null}
              />
            )}
          </div>

          <button
            className={`px-4 py-2 rounded text-white font-bold shadow transition ${
              isRead
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            style={{ cursor: "pointer" }}
            onClick={handleRead}
          >
            {isRead ? "読了済み" : "この記事を読了する"}
          </button>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="max-w-4xl mx-auto py-8">
        <Link to="/syntaxes">
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
