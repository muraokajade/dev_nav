// src/pages/syntax/detail/SyntaxDetailPage.tsx
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";

import { useAuth } from "../../../context/useAuthContext";
import { LikeButton } from "../../../utils/LikeButton";
import { SyntaxDetailActions } from "./SyntaxDetailActions";
import { apiHelper } from "../../../libs/apiHelper";

type CodeBlockProps = {
  language?: string;
  code: string;
  startingLineNumber?: number;
};

function CodeBlock({ language, code, startingLineNumber = 1 }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const text = code.replace(/\n$/, "");

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  if (!language) {
    return <code className="rounded bg-zinc-800/70 px-1.5 py-0.5">{text}</code>;
  }

  return (
    <div className="relative group not-prose">
      <button
        onClick={onCopy}
        className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow transition ${
          copied
            ? "bg-green-600 text-white"
            : "bg-zinc-700/85 hover:bg-zinc-600 text-white"
        }`}
        aria-label="Copy code"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-xl overflow-hidden"
        customStyle={{ margin: 0 }}
        showLineNumbers
        startingLineNumber={startingLineNumber}
        lineNumberStyle={{
          minWidth: "2.25em",
          paddingRight: "0.75em",
          opacity: 0.6,
          userSelect: "none",
        }}
        wrapLongLines
      >
        {text}
      </SyntaxHighlighter>
    </div>
  );
}

const Fallback = ({ msg }: { msg: string }) => (
  <div className="text-red-300 bg-red-900/30 p-3 rounded">{msg}</div>
);

export const SyntaxDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.match(/^\d+/)?.[0] ?? idAndSlug?.split("-")[0] ?? null;
  const { idToken } = useAuth();

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLike = async () => {
    if (!idToken || !syntaxId) return;
    try {
      if (liked) {
        await apiHelper.delete(`/api/syntaxes/likes/${syntaxId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(false);
        setLikeCount((v) => v - 1);
      } else {
        await apiHelper.post(`/api/syntaxes/likes?syntaxId=${syntaxId}`, null, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(true);
        setLikeCount((v) => v + 1);
      }
    } catch (e) {
      console.error("like toggle failed", e);
    }
  };

  const handleRead = async () => {
    if (!idToken || !syntaxId) return;
    try {
      if (!isRead) {
        await apiHelper.post(
          "/api/syntaxes/read",
          { syntaxId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setIsRead(true);
        alert("完了");
      } else {
        await apiHelper.delete(`/api/syntaxes/read/${syntaxId}`, {
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

  useEffect(() => {
    if (!idToken || !syntaxId) return;
    let ignore = false;
    (async () => {
      try {
        const res = await apiHelper.get("/api/syntaxes/read/status", {
          params: { syntaxId },
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!ignore) setIsRead(!!res.data?.read);
      } catch {
        if (!ignore) setIsRead(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [idToken, syntaxId]);

  useEffect(() => {
    if (!idToken || !syntaxId) return;
    apiHelper
      .get(`/api/syntaxes/likes/status?syntaxId=${syntaxId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        setLiked(!!res.data.liked);
        setLikeCount(res.data.count ?? 0);
      })
      .catch(() => void 0);
  }, [syntaxId, idToken]);

  useEffect(() => {
    if (!idToken) return;
    apiHelper
      .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => setMyUserId(res.data.id))
      .catch(() => void 0);
  }, [idToken]);

  useEffect(() => {
    if (!id) {
      setErrorMsg("URLのIDが取得できません");
      setLoading(false);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const { data } = await apiHelper.get(`/api/syntaxes/${id}`);
        if (ignore) return;
        setTitle(data.title);
        setAuthor(data.authorName ?? "（不明）");
        setCreatedAt(data.createdAt ?? "");
        setCategory(data.category ?? "");
        setImageUrl(data.imageUrl ?? "");
        setContent(data.content);
        setSyntaxId(data.id);
        setErrorMsg(null);
      } catch (e) {
        console.error("fetch syntaxes failed", e);
        setErrorMsg("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900">
      {loading && <div className="text-gray-300 p-4">読み込み中...</div>}
      {!loading && errorMsg && <Fallback msg={errorMsg} />}

      <LikeButton liked={liked} count={likeCount} onClick={handleLike} />

      {/* 本文カード（Techと同じ 4xl 幅） */}
      <div className="prose prose-invert whitespace-normal text-white max-w-4xl mx-auto py-10 bg-zinc-900 rounded-2xl shadow-2xl mb-8">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{title}</h1>

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

        <ReactMarkdown
          components={{
            pre({ children }) {
              const child = Array.isArray(children) ? children[0] : children;
              // @ts-ignore
              const className = child?.props?.className as string | undefined;
              // @ts-ignore
              const raw = child?.props?.children ?? "";
              const codeString = Array.isArray(raw)
                ? raw.join("")
                : String(raw);
              const match = /language-(\w+)/.exec(className || "");
              if (!match) {
                return (
                  <pre className="rounded-xl p-4 bg-zinc-800/60 overflow-auto">
                    {children}
                  </pre>
                );
              }
              return <CodeBlock language={match[1]} code={codeString} />;
            },
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = Array.isArray(children)
                ? children.join("")
                : String(children);
              if (match)
                return <CodeBlock language={match[1]} code={codeString} />;
              return (
                <code
                  className="rounded bg-zinc-800/70 px-1.5 py-0.5"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* レビュー・コメント・Q&A（Tech と同じ親ラッパー：4xl 幅に統一） */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 mt-8 px-4">
        <div className="flex-1 w-full">
          {syntaxId && (
            <SyntaxDetailActions
              syntaxId={syntaxId}
              myUserId={myUserId ?? null}
            />
          )}
        </div>
        <div className="flex-shrink-0 flex items-center">
          <button
            className={`px-4 py-2 text-white rounded font-bold shadow transition ${
              isRead
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleRead}
          >
            {isRead ? "読了済み" : "この記事を読了する"}
          </button>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link to="/syntaxes">
          <p className="inline-block text-white bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
