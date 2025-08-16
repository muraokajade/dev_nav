import React, { useEffect, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link, useLocation, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { useAuth } from "../../../context/useAuthContext";
import axios from "axios";
import { LikeButton } from "../../../utils/LikeButton";
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

  // ★ ここを唯一のIDとして利用
  const [procedureId, setProcedureId] = useState<number | null>(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // --- コピー付きハイライター ---
  const CopyableHighlighter = ({
    language,
    code,
  }: {
    language: string;
    code: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
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
          className={`absolute top-2 right-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow
            ${
              copied
                ? "bg-green-600 text-white"
                : "bg-zinc-700/80 hover:bg-zinc-600 text-white"
            }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: "0.75rem" }}
        >
          {code.replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  };

  // --- ReactMarkdown の components を型定義 ---
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
      return <CopyableHighlighter language={match[1]} code={codeString} />;
    },
    pre({ children }) {
      return <>{children}</>;
    },
  };

  // // --- いいね処理（※APIが articles ベースなら適宜戻してください） ---
  // const handleLike = async () => {
  //   if (!idToken || !procedureId) return;
  //   if (liked) {
  //     try {
  //       await axios.delete(`/api/likes/${procedureId}`, {
  //         headers: { Authorization: `Bearer ${idToken}` },
  //       });
  //       setLiked(false);
  //       setLikeCount((prev) => prev - 1);
  //     } catch (e) {
  //       console.error("削除失敗", e);
  //     }
  //   } else {
  //     try {
  //       await axios.post(
  //         "/api/likes",
  //         { procedureId }, // ← ★ ここも procedureId を送る
  //         { headers: { Authorization: `Bearer ${idToken}` } }
  //       );
  //       setLiked(true);
  //       setLikeCount((prev) => prev + 1);
  //     } catch (e) {
  //       console.error("いいね失敗", e);
  //     }
  //   }
  // };

  // --- 読了処理（※APIが articles ベースなら適宜戻してください） ---
// 読了トグル（articles と同形）
const handleRead = async () => {
  if (!idToken || !procedureId) return;
  try {
    if (!isRead) {
      await axios.post("/api/procedures/read", { procedureId }, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
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
    alert(isRead ? "解除失敗" : "読了登録失敗");
    console.error(e);
  }
};


  // --- 各種データ取得 ---
  // 自分のユーザーID
  useEffect(() => {
    if (idToken) {
      axios
        .get("/api/me", { headers: { Authorization: `Bearer ${idToken}` } })
        .then((res) => setMyUserId(res.data.id))
        .catch(() => void 0);
    }
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
      setProcedureId(res.data.id); // ← ★ 正式にセット
    });
  }, [id]);

  // 読了ステータス
  useEffect(() => {
    if (!idToken || !procedureId) return;
    axios
      .get(`/api/procedures/read/status?procedureId=${procedureId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setIsRead(res.data.read ?? false))
      .catch(() => void 0);
  }, [idToken, procedureId]);



  // --- JSX ---
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

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 mt-8">
        <div className="flex-1">
          {procedureId && myUserId != null && (
            <ProcedureDetailActions
              procedureId={procedureId} // ← ★ 正しく渡す
              myUserId={myUserId}
            />
          )}
        </div>

        <div className="flex-shrink-0 flex items-center">
          <button
            className={`px-4 py-2 rounded text-white font-bold shadow transition ${
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
