import React, { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link, useLocation, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { useAuth } from "../../../context/useAuthContext";
import axios from "axios";
import { ProcedureDetailActions } from "./ProcedureDetailActions";

export const ProcedureDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const [chapter, number] = (idAndSlug ?? "").split("-");
  const nextNumber = String(Number(number) + 1).padStart(2, "0");
  const nextSlug = `${chapter}-${nextNumber}`;
  const { idToken } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const backPage = params.get("page") || 1;

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");

  // 唯一のID
  const [procedureId, setProcedureId] = useState<number | null>(null);

  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // --- コピー付き & 行番号つきハイライター ---
  const CopyableHighlighter = ({
    language,
    code,
    startingLineNumber = 1,
  }: {
    language: string;
    code: string;
    startingLineNumber?: number;
  }) => {
    const [copied, setCopied] = useState(false);
    const text = code.replace(/\n$/, ""); // 末尾改行を除去（コピー & 表示を安定）

    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(text); // 行番号は含まれない
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (e) {
        console.error("Copy failed", e);
      }
    };

    return (
      <div className="relative not-prose group">
        <button
          onClick={doCopy}
          className={`absolute top-2 right-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow transition
            ${
              copied
                ? "bg-green-600 text-white"
                : "bg-zinc-700/80 hover:bg-zinc-600 text-white"
            }`}
          aria-label="Copy code"
        >
          {copied ? "Copied!" : "Copy"}
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
  };

  // --- ReactMarkdown components ---
  const markdownComponents: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children ?? "");
      if (!match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <CopyableHighlighter
          language={match[1]}
          code={codeString}
          startingLineNumber={1}
        />
      );
    },
    pre({ children }) {
      // <pre> は SyntaxHighlighter 側で描画するので素通り
      return <>{children}</>;
    },
  };

  // 読了トグル（共通仕様：POST/DELETE）
  const handleRead = async () => {
    if (!idToken || !procedureId) return;
    try {
      if (!isRead) {
        await axios.post(
          "/api/procedures/read",
          { procedureId }, // ← 統一キー
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setIsRead(true);
        alert("完了");
      } else {
        await axios.delete(`/api/procedures/read/${procedureId}`, {
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

  // 自分のユーザーID
  useEffect(() => {
    if (!idToken) return;
    axios
      .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => setMyUserId(res.data.id))
      .catch(() => void 0);
  }, [idToken]);

  // 手順本体
  useEffect(() => {
    if (!id) return;
    axios.get(`/api/procedures/${id}`).then((res) => {
      setTitle(res.data.title);
      setAuthor(res.data.authorName ?? "（不明）");
      setCreatedAt(res.data.createdAt ?? "");
      setCategory(res.data.category ?? "");
      setImageUrl(res.data.imageUrl ?? "");
      setContent(res.data.content);
      setProcedureId(res.data.id);
    });
  }, [id]);

  // 読了ステータス（未ログインなら取得しない）
  useEffect(() => {
    if (!idToken || !procedureId) return;
    axios
      .get("/api/procedures/read/status", {
        params: { contentId: procedureId }, // ← 統一キー
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        const read =
          typeof res.data === "object" && res.data !== null
            ? !!(res.data as any).read
            : !!res.data;
        setIsRead(read);
      })
      .catch(() => setIsRead(false));
  }, [idToken, procedureId]);

  return (
    <div className="min-h-screen bg-gray-900">
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
            <span className="bg-blue-500 px-2 py-0.5 rounded text-white">
              {category}
            </span>
          )}
        </div>
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>

      {/* レビュー・コメント・Q&A */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 mt-8">
        <div className="flex-1">
          {procedureId && (
            <ProcedureDetailActions
              procedureId={procedureId}
              myUserId={myUserId ?? null}
            />
          )}
        </div>

        <div className="flex-shrink-0 flex items-center">
          <button
            className={`px-4 py-2 rounded text-white font-bold shadow transition ${
              isRead ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleRead}
            style={{ cursor: "pointer" }}
          >
            {isRead ? "読了済み" : "この記事を読了する"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 flex gap-4">
        <Link to={`/procedures?page=${backPage}`}>
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition">
            開発手順一覧
          </p>
        </Link>
        <Link to={`/procedures/${nextSlug}`}>
          <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition">
            次へ
          </p>
        </Link>
      </div>
    </div>
  );
};
