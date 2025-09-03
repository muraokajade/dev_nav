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
        className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow transition
          ${
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

  const [pending, setPending] = useState(false);

  // ---- helpers --------------------------------------------------
  const authHeader = idToken
    ? { Authorization: `Bearer ${idToken}` }
    : undefined;

  const syncLikeState = async (sid: number) => {
    try {
      const res = await apiHelper.get(`/api/syntaxes/likes/status`, {
        headers: authHeader,
        params: { syntaxId: sid },
      });
      setLiked(!!res.data?.liked);
      setLikeCount(typeof res.data?.count === "number" ? res.data.count : 0);
    } catch {
      // 未ログインやAPI不達などはとりあえずゼロに倒す
      setLiked(false);
      setLikeCount((c) => Math.max(0, c));
    }
  };

  // ---- like toggle ---------------------------------------------
  const handleLike = async () => {
    if (pending || !idToken || !syntaxId) return;
    setPending(true);
    try {
      if (liked) {
        // DELETE: まずは query param で送る（本番仕様）
        try {
          await apiHelper.delete(`/api/syntaxes/likes`, {
            headers: authHeader,
            params: { syntaxId },
          });
        } catch (e: any) {
          // 互換: path param の旧仕様にも対応
          if (e?.response?.status === 404 || e?.response?.status === 405) {
            await apiHelper.delete(`/api/syntaxes/likes/${syntaxId}`, {
              headers: authHeader,
            });
          } else {
            throw e;
          }
        }
      } else {
        // POST: JSON ボディ
        try {
          await apiHelper.post(
            `/api/syntaxes/likes`,
            { syntaxId },
            { headers: authHeader }
          );
        } catch (e: any) {
          // 互換: クエリ版にも対応
          if (e?.response?.status === 404 || e?.response?.status === 415) {
            await apiHelper.post(`/api/syntaxes/likes`, null, {
              headers: authHeader,
              params: { syntaxId },
            });
          } else if (e?.response?.status === 405) {
            await apiHelper.post(
              `/api/syntaxes/likes?syntaxId=${syntaxId}`,
              null,
              { headers: authHeader }
            );
          } else {
            throw e;
          }
        }
      }
      // 成功後はサーバ値で確定（楽観更新しない）
      await syncLikeState(syntaxId);
    } catch (e) {
      console.error("like toggle failed", e);
    } finally {
      setPending(false);
    }
  };

  // ---- read toggle ---------------------------------------------
  const handleRead = async () => {
    if (!idToken || !syntaxId) return;
    try {
      if (!isRead) {
        await apiHelper.post(
          "/api/syntaxes/read",
          { syntaxId },
          { headers: authHeader }
        );
        setIsRead(true);
        alert("完了");
      } else {
        await apiHelper.delete(`/api/syntaxes/read/${syntaxId}`, {
          headers: authHeader,
        });
        setIsRead(false);
        alert("読了解除");
      }
    } catch (e) {
      console.error(e);
      alert(isRead ? "解除失敗" : "読了登録失敗");
    }
  };

  // ---- initial fetches -----------------------------------------
  useEffect(() => {
    if (!id) return;
    apiHelper
      .get(`/api/syntaxes/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setAuthor(res.data.authorName ?? "（不明）");
        setCreatedAt(res.data.createdAt ?? "");
        setCategory(res.data.category ?? "");
        setImageUrl(res.data.imageUrl ?? "");
        setContent(res.data.content);
        setSyntaxId(res.data.id);
      })
      .catch((e) => console.error("fetch syntaxes failed", e));
  }, [id]);

  useEffect(() => {
    if (!idToken) return;
    apiHelper
      .get("/api/me", { headers: authHeader })
      .then((res) => setMyUserId(res.data.id))
      .catch(() => void 0);
  }, [idToken]); // me

  useEffect(() => {
    if (!idToken || !syntaxId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiHelper.get("/api/syntaxes/read/status", {
          params: { syntaxId },
          headers: authHeader,
        });
        if (!cancelled) setIsRead(!!res.data?.read);
      } catch {
        if (!cancelled) setIsRead(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idToken, syntaxId]); // read state

  useEffect(() => {
    if (!idToken || !syntaxId) return;
    syncLikeState(syntaxId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, syntaxId]); // like state

  return (
    <div className="min-h-screen bg-gray-900">
      <LikeButton
        liked={liked}
        count={likeCount}
        onClick={handleLike} /* disabled={pending} */
      />

      <div className="prose prose-invert max-w-4xl mx-auto py-10 bg-zinc-900 rounded-2xl shadow-2xl mb-8">
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
            <span className="bg-blue-500 px-2 py-0.5 rounded text白">
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
            className={`px-4 py-2 rounded text白 font-bold shadow transition ${
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

      <div className="max-w-4xl mx-auto py-8">
        <Link to="/syntaxes">
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text白 font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
