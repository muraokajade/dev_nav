import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { useAuth } from "../../../context/useAuthContext";
import axios from "axios";
import { LikeButton } from "../../../utils/LikeButton";
import { TechDetailActions } from "./TechDetailActions";

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
      await navigator.clipboard.writeText(text); // 行番号は含めない
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  // インラインコードはここでは扱わない（<code>側で表示）
  if (!language) {
    return (
      <code className="rounded bg-zinc-800/70 px-1.5 py-0.5">{text}</code>
    );
  }

  return (
    <div className="relative group not-prose">
      <button
        onClick={onCopy}
        className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow transition
          ${copied ? "bg-green-600 text-white" : "bg-zinc-700/85 hover:bg-zinc-600 text-white"}`}
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

export const TechDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const { idToken } = useAuth();

  // リッチ化用：記事メタ情報
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [articleId, setArticleId] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // いいね機能
  const handleLike = async () => {
    if (!idToken || !articleId) return;
    try {
      if (liked) {
        await axios.delete(`/api/likes/${articleId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(false);
        setLikeCount((v) => v - 1);
      } else {
        await axios.post(
          "/api/likes",
          { articleId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setLiked(true);
        setLikeCount((v) => v + 1);
      }
    } catch (e) {
      console.error("like toggle failed", e);
    }
  };

  // 読了機能
  const handleRead = async () => {
    if (!idToken || !articleId) return;
    try {
      if (!isRead) {
        await axios.post(
          "/api/articles/read",
          { articleId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setIsRead(true);
        alert("完了");
      } else {
        await axios.delete(`/api/articles/read/${articleId}`, {
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

  // 読了状態取得
  useEffect(() => {
    if (!idToken || !articleId) return;
    (async () => {
      try {
        const res = await axios.get(`/api/articles/read/status?articleId=${articleId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const read =
          typeof res.data === "object" && res.data !== null ? !!res.data.read : !!res.data;
        setIsRead(read);
      } catch {
        setIsRead(false);
      }
    })();
  }, [idToken, articleId]);

  // いいね状態取得
  useEffect(() => {
    if (!idToken || !articleId) return;
    axios
      .get(`/api/likes/status?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        setLiked(!!res.data.liked);
        setLikeCount(res.data.count ?? 0);
      })
      .catch(() => void 0);
  }, [idToken, articleId]);

  // myUserId取得
  useEffect(() => {
    if (!idToken) return;
    axios
      .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => setMyUserId(res.data.id))
      .catch(() => void 0);
  }, [idToken]);

  // 記事メタ＆本文取得
  useEffect(() => {
    if (!id) return;
    let ignore = false;
    (async () => {
      try {
        const { data } = await axios.get(`/api/articles/${id}`);
        if (ignore) return;
        setTitle(data.title);
        setAuthor(data.authorName ?? "（不明）");
        setCreatedAt(data.createdAt ?? "");
        setCategory(data.category ?? "");
        setImageUrl(data.imageUrl ?? "");
        setContent(data.content);
        setArticleId(data.id);
      } catch (e) {
        console.error("fetch article failed", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* いいねボタン */}
      <LikeButton liked={liked} count={likeCount} onClick={handleLike} />

      {/* カード */}
      <div className="prose prose-invert whitespace-normal text-white max-w-4xl mx-auto py-10 bg-zinc-900 rounded-2xl shadow-2xl mb-8">
        {imageUrl && (
          <img src={imageUrl} alt={title} className="w-full h-64 object-cover rounded-xl mb-8" />
        )}

        <h1 className="text-4xl font-bold mb-4">{title}</h1>

        <div className="flex items-center gap-4 mb-6 text-gray-400 text-sm">
          <span>著者: {author}</span>
          {createdAt && <span>投稿日: {dayjs(createdAt).format("YYYY/MM/DD")}</span>}
          {category && <span className="bg-blue-500 px-2 py-0.5 rounded text-white">{category}</span>}
        </div>

        {/* 本文（preをハックして、コピー付きCodeBlockに差し替え） */}
        <ReactMarkdown
          components={{
            pre({ children }) {
              // children は <code class="language-xxx">...</code>
              const child = Array.isArray(children) ? children[0] : children;
              // @ts-ignore
              const className = child?.props?.className as string | undefined;
              // @ts-ignore
              const raw = child?.props?.children ?? "";
              const codeString = Array.isArray(raw) ? raw.join("") : String(raw);
              const match = /language-(\w+)/.exec(className || "");
              if (!match) {
                return <pre className="rounded-xl p-4 bg-zinc-800/60 overflow-auto">{children}</pre>;
              }
              return <CodeBlock language={match[1]} code={codeString} />;
            },
            code({ className, children, ...props }) {
              // インラインコードはここ（pre外）に来る
              if (/language-/.test(className || "")) {
                // まれにpreを通らずに来るパターンもケア
                const match = /language-(\w+)/.exec(className || "");
                const codeString = Array.isArray(children) ? children.join("") : String(children);
                return <CodeBlock language={match?.[1]} code={codeString} />;
              }
              return (
                <code className="rounded bg-zinc-800/70 px-1.5 py-0.5" {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* レビュー・コメント・Q&Aタブ */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 mt-8">
        <div className="flex-1">
          {articleId && <TechDetailActions articleId={articleId} myUserId={myUserId ?? null} />}
        </div>
        <div className="flex-shrink-0 flex items-center">
          <button
            className={`px-4 py-2 rounded text-white font-bold shadow transition ${
              isRead ? "bg-green-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleRead}
            style={{ cursor: "pointer" }}
          >
            {isRead ? "読了済み" : "この記事を読了する"}
          </button>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="max-w-4xl mx-auto py-8">
        <Link to="/articles">
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
