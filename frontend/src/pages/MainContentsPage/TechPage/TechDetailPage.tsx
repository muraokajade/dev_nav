import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";
import { useAuth } from "../../../context/useAuthContext";
// - import axios from "axios";
import { apiHelper } from "../../../libs/apiHelper";
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

// 追加：失敗時の簡易UI
const Fallback = ({ msg }: { msg: string }) => (
  <div className="text-red-300 bg-red-900/30 p-3 rounded">{msg}</div>
);

export const TechDetailPage = () => {
  const { idAndSlug } = useParams();
  // - const id = idAndSlug?.split("-")[0];
  const id = idAndSlug?.match(/^\d+/)?.[0] ?? null;
  // ★ NOTE: slug に先頭数字以外が混ざっても安全な抽出。URL 仕様変更時はここだけ直せばOK。

  const { idToken } = useAuth();
  // - const baseURL = process.env.REACT_APP_API_URL;

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // いいね機能
  const handleLike = async () => {
    if (!idToken || !articleId) return;
    try {
      if (liked) {
        // - await axios.delete(`${baseURL}/api/likes/${articleId}`, { headers: { Authorization: `Bearer ${idToken}` } });
        await apiHelper.delete(`/api/likes/${articleId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setLiked(false);
        setLikeCount((v) => v - 1);
      } else {
        // - await axios.post(`${baseURL}/api/likes`, { articleId }, { headers: { Authorization: `Bearer ${idToken}` } });
        await apiHelper.post(
          `/api/likes`,
          { articleId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setLiked(true);
        setLikeCount((v) => v + 1);
      }
    } catch (e) {
      console.error("like toggle failed", e);
      // ★ NOTE: 401/403 は未ログインや権限不足。UIでログイン導線を出すならここでトースト文言差し替え推奨。
    }
  };

  // 読了機能
  const handleRead = async () => {
    if (!idToken || !articleId) return;
    try {
      if (!isRead) {
        // - await axios.post(`${baseURL}/api/articles/read`, { articleId }, { headers: { Authorization: `Bearer ${idToken}` } });
        await apiHelper.post(
          `/api/articles/read`,
          { articleId },
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setIsRead(true);
        alert("完了");
      } else {
        // - await axios.delete(`${baseURL}/api/articles/read/${articleId}`, { headers: { Authorization: `Bearer ${idToken}` } });
        await apiHelper.delete(`/api/articles/read/${articleId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setIsRead(false);
        alert("読了解除");
      }
    } catch (e) {
      console.error(e);
      alert(isRead ? "解除失敗" : "読了登録失敗");
      // ★ NOTE: 後で alert → トーストに置き換え想定なら、共通 Toast ユーティリティを噛ませると差し替え楽。
    }
  };

  // 読了状態取得
  useEffect(() => {
    if (!idToken || !articleId) return;
    (async () => {
      try {
        // - const res = await axios.get(`${baseURL}/api/articles/read/status?articleId=${articleId}`, { headers: { Authorization: `Bearer ${idToken}` } });
        const res = await apiHelper.get(
          `/api/articles/read/status?articleId=${articleId}`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        const read =
          typeof res.data === "object" && res.data !== null
            ? !!res.data.read
            : !!res.data;
        setIsRead(read);
      } catch {
        setIsRead(false);
      }
    })();
  }, [idToken, articleId]); // - baseURL依存は不要
  // ★ NOTE: 将来的にページ遷移連打でのレースが気になるなら AbortController を追加（今は軽量優先でOK）。

  // いいね状態取得
  useEffect(() => {
    if (!idToken || !articleId) return;
    // - axios.get(`${baseURL}/api/likes/status?articleId=${articleId}`, { headers: { Authorization: `Bearer ${idToken}` } })
    apiHelper
      .get(`/api/likes/status?articleId=${articleId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => {
        setLiked(!!res.data.liked);
        setLikeCount(res.data.count ?? 0);
      })
      .catch(() => void 0);
  }, [idToken, articleId]); // - baseURL依存は不要
  // ★ NOTE: 未ログイン時は呼ばない設計。ログイン前でも件数だけ見せたいなら GET を公開API化して分岐。

  // myUserId取得
  useEffect(() => {
    if (!idToken) return;
    // - axios.get(`${baseURL}/api/me`, { headers: { Authorization: `Bearer ${idToken}` } })
    apiHelper
      .get(`/api/me`, { headers: { Authorization: `Bearer ${idToken}` } })
      .then((res) => setMyUserId(res.data.id))
      .catch(() => void 0);
  }, [idToken]); // - baseURL依存は不要
  // ★ NOTE: 401の時は握り潰してOKな仕様。将来は useAuth 側で me 取得をまとめても良い。

  // 記事メタ＆本文取得
  useEffect(() => {
    if (!id) {
      setErrorMsg("URLのIDが取得できません");
      setLoading(false);
      return;
    }
    let ignore = false;
    (async () => {
      try {
        // - const { data } = await axios.get(`${baseURL}/api/articles/${id}`);
        const { data } = await apiHelper.get(`/api/articles/${id}`);
        if (ignore) return;
        setTitle(data.title);
        setAuthor(data.authorName ?? "（不明）");
        setCreatedAt(data.createdAt ?? "");
        setCategory(data.category ?? "");
        setImageUrl(data.imageUrl ?? "");
        setContent(data.content);
        setArticleId(data.id);
        setErrorMsg(null);
      } catch (e) {
        console.error("fetch article failed", e);
        setErrorMsg("記事の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]); // - baseURL依存は不要
  // ★ NOTE: ここも AbortController 追加でより堅牢化可。今は ignore フラグで十分。

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 進行表示 */}
      {loading && <div className="text-gray-300 p-4">読み込み中...</div>}
      {!loading && errorMsg && <Fallback msg={errorMsg} />}

      {/* いいねボタン */}
      <LikeButton liked={liked} count={likeCount} onClick={handleLike} />
      {/* ★ NOTE: disabled をサポートしているなら loading 中や未ログイン時に押せないUIにするのが親切。 */}

      {/* カード */}
      <div className="prose prose-invert whitespace-normal text-white max-w-4xl mx-auto py-10 bg-zinc-900 rounded-2xl shadow-2xl mb-8">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
          // ★ NOTE: LCP改善は後で優先度属性や width/height 指定を検討（Next.js なら <Image>）。
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
              if (/language-/.test(className || "")) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = Array.isArray(children)
                  ? children.join("")
                  : String(children);
                return <CodeBlock language={match?.[1]} code={codeString} />;
              }
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

      {/* レビュー・コメント・Q&Aタブ */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 mt-8">
        <div className="flex-1">
          {articleId && (
            <TechDetailActions
              articleId={articleId}
              myUserId={myUserId ?? null}
            />
          )}
          {/* ★ NOTE: TechDetailActions 内でも myUserId=null のとき投稿UIを抑制する実装にしていてOK。 */}
        </div>
        <div className="flex-shrink-0 flex items-center">
          <button
            className={`px-4 py-2 text-white rounded text-white font-bold shadow transition ${
              isRead
                ? "bg-green-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleRead}
            style={{ cursor: "pointer" }}
            // ★ NOTE: 未ログインや loading 中は disabled にするのもアリ（UX向上）。
            // disabled={!idToken || loading}
          >
            {isRead ? "読了済み" : "この記事を読了する"}
          </button>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="max-w-4xl mx-auto py-8">
        <Link to="/articles">
          <p className="inline-block text-white bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
            技術記事一覧に戻る
          </p>
        </Link>
      </div>
    </div>
  );
};
