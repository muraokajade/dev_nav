// ==========================
// src/pages/syntaxes/SyntaxDetailPage.tsx
// ==========================
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import dayjs from "dayjs";

import { useAuth } from "../../../context/useAuthContext";
import { LikeButton } from "../../../utils/LikeButton";
import { apiHelper } from "../../../libs/apiHelper";
import { ReviewScore } from "../../../utils/ReviewScore";
import { ThreadComments } from "../../../components/ThreadComments";

/* ---------- helpers ---------- */
const emailFromJwt = (token?: string | null): string | null => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = JSON.parse(atob(base64));
    return json?.email ?? null;
  } catch {
    return null;
  }
};

/* ---------- UI bits ---------- */
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
  if (!language)
    return <code className="rounded bg-zinc-800/70 px-1.5 py-0.5">{text}</code>;
  return (
    <div className="relative group not-prose">
      <button
        onClick={onCopy}
        className={`absolute right-2 top-2 z-10 rounded px-2 py-1 text-xs font-semibold shadow transition ${
          copied
            ? "bg-green-600 text-white"
            : "bg-zinc-700/85 hover:bg-zinc-600 text-white"
        }`}
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

const Toast = ({
  message,
  kind = "success",
}: {
  message: string;
  kind?: "success" | "error";
}) => (
  <div
    className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
    role="status"
    aria-live="polite"
  >
    <div
      className={`px-4 py-3 rounded-lg shadow-lg text-sm ${
        kind === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  </div>
);

/* ---------- Page ---------- */
export const SyntaxDetailPage = () => {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.match(/^\d+/)?.[0] ?? idAndSlug?.split("-")[0] ?? null;
  const { idToken } = useAuth(); // user は使わない

  // axios: Authorization をデフォルト設定
  useEffect(() => {
    if (idToken) {
      apiHelper.defaults.headers.common["Authorization"] = `Bearer ${idToken}`;
    } else {
      delete apiHelper.defaults.headers.common["Authorization"];
    }
  }, [idToken]);

  const authHeader = idToken
    ? { Authorization: `Bearer ${idToken}` }
    : undefined;

  // 本文
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [syntaxId, setSyntaxId] = useState<number | null>(null);

  // 状態
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myEmail, setMyEmail] = useState<string | null>(emailFromJwt(idToken));
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"review" | "comment" | "qa">("review"); // ★ 初期は review

  // toast
  const [toast, setToast] = useState<{
    msg: string;
    kind?: "success" | "error";
  } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  };
  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    []
  );

  const syncLikeState = async (sid: number) => {
    try {
      const res = await apiHelper.get(`/api/syntaxes/likes/status`, {
        headers: authHeader,
        params: { syntaxId: sid },
      });
      setLiked(!!res.data?.liked);
      setLikeCount(typeof res.data?.count === "number" ? res.data.count : 0);
    } catch {
      setLiked(false);
      setLikeCount((c) => Math.max(0, c));
    }
  };

  const lockRef = useRef(false);
  const handleLike = async () => {
    if (lockRef.current || pending || !idToken || !syntaxId) return;
    lockRef.current = true;
    setPending(true);
    try {
      const headers = { ...authHeader, "Content-Type": "application/json" };
      if (liked) {
        await apiHelper.delete(`/api/syntaxes/likes/${syntaxId}`, { headers });
      } else {
        await apiHelper.post(`/api/syntaxes/likes`, { syntaxId }, { headers });
      }
      await syncLikeState(syntaxId);
    } catch (e) {
      console.error("like toggle failed", e);
      showToast("いいねの更新に失敗しました", "error");
    } finally {
      setPending(false);
      setTimeout(() => {
        lockRef.current = false;
      }, 400);
    }
  };

  // 読了トグル
  const handleRead = async () => {
    if (!idToken || !syntaxId || pending) return;
    setPending(true);
    try {
      if (!isRead) {
        setIsRead(true);
        await apiHelper.post(
          `/api/syntaxes/read`,
          { syntaxId },
          { headers: { ...authHeader, "Content-Type": "application/json" } }
        );
        showToast("読了完了");
      } else {
        setIsRead(false);
        await apiHelper.delete(`/api/syntaxes/read/${syntaxId}`, {
          headers: authHeader,
        });
        showToast("読了解除");
      }
    } catch (e) {
      setIsRead((v) => !v);
      console.error(e);
      showToast("読了更新に失敗しました", "error");
    } finally {
      setPending(false);
    }
  };

  // 初期取得
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
        setSyntaxId(Number(res.data.id)); // ★ number化
      })
      .catch((e) => console.error("fetch syntaxes failed", e));
  }, [id]);

  // /api/me から id と email を取得（失敗時は JWT から推測）
  useEffect(() => {
    if (!idToken) {
      setMyUserId(null);
      setMyEmail(emailFromJwt(idToken));
      return;
    }
    apiHelper
      .get(`/api/me`, { headers: authHeader })
      .then((r) => {
        setMyUserId(r.data?.id ?? null);
        setMyEmail(r.data?.email ?? emailFromJwt(idToken));
      })
      .catch(() => {
        setMyUserId(null);
        setMyEmail(emailFromJwt(idToken));
      });
  }, [idToken]);

  // 読了状態
  useEffect(() => {
    if (!idToken || !syntaxId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiHelper.get(`/api/syntaxes/read/status`, {
          params: { syntaxId },
          headers: authHeader,
        });
        if (!cancelled) {
          const read =
            typeof res.data === "object" && res.data !== null
              ? !!(res.data as any).read
              : !!res.data;
          setIsRead(read);
        }
      } catch {
        if (!cancelled) setIsRead(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idToken, syntaxId]);

  // いいね状態
  useEffect(() => {
    if (!idToken || !syntaxId) return;
    syncLikeState(syntaxId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, syntaxId]);

  const isLoggedIn = !!idToken;

  return (
    <div className="min-h-screen bg-gray-900">
      {toast && <Toast message={toast.msg} kind={toast.kind} />}

      {/* いいね */}
      <div className="max-w-4xl mx-auto pt-6">
        <LikeButton liked={liked} count={likeCount} onClick={handleLike} />
      </div>

      <div className="max-w-4xl mx-auto py-6">
        {/* 本文 */}
        <div className="prose prose-invert max-w-none whitespace-normal text-white bg-zinc-900 rounded-2xl shadow-2xl p-6">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 object-cover rounded-xl mb-6"
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
            {isRead && (
              <span className="bg-green-600 text-white px-2 py-0.5 rounded">
                読了済み
              </span>
            )}
          </div>

          <ReactMarkdown
            components={{
              pre({ children }) {
                const child = Array.isArray(children)
                  ? children[0]
                  : (children as any);
                // @ts-ignore
                const className = child?.props?.className as string | undefined;
                // @ts-ignore
                const raw = child?.props?.children ?? "";
                const codeString = Array.isArray(raw)
                  ? (raw as any[]).join("")
                  : String(raw);
                const match = /language-(\w+)/.exec(className || "");
                if (!match)
                  return (
                    <pre className="rounded-xl p-4 bg-zinc-800/60 overflow-auto">
                      {children}
                    </pre>
                  );
                return <CodeBlock language={match[1]} code={codeString} />;
              },
              code({ className, children, ...props }) {
                if (/language-/.test(className || "")) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = Array.isArray(children)
                    ? (children as any[]).join("")
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

        {/* 本文の下：アクション行（読了ボタン） */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-6">
          <div className="flex-1" />
          <div className="flex-shrink-0">
            <button
              className={`px-4 py-2 rounded text-white font-bold shadow transition ${
                isRead
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-blue-600 hover:bg-blue-700"
              } ${
                !idToken || !syntaxId || pending
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleRead}
              disabled={!idToken || !syntaxId || pending}
              title={
                !idToken
                  ? "ログインが必要です"
                  : isRead
                  ? "読了解除"
                  : "この記事を読了する"
              }
            >
              {isRead ? "読了済み（クリックで解除）" : "この記事を読了する"}
            </button>
          </div>
        </div>

        {/* タブ & 各コンテンツ */}
        <div className="mt-8 rounded-2xl bg-zinc-900 text-white shadow-2xl p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("review")}
              className={`px-3 py-1 rounded ${
                tab === "review"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-200"
              }`}
            >
              レビュー
            </button>
            <button
              onClick={() => setTab("comment")}
              className={`px-3 py-1 rounded ${
                tab === "comment"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-200"
              }`}
            >
              コメント
            </button>
            <button
              onClick={() => setTab("qa")}
              className={`px-3 py-1 rounded ${
                tab === "qa"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-200"
              }`}
            >
              Q&A
            </button>
          </div>

          {syntaxId && tab === "review" && (
            <ReviewScore
              targetType="SYNTAX"
              refId={syntaxId}
              myUserId={isLoggedIn ? myUserId ?? null : null}
              readonly={!isLoggedIn}
            />
          )}

          {/* コメント（上部Composer＋一覧、自分の投稿のみ 編集=緑／削除=赤） */}
          {syntaxId && tab === "comment" && (
            <ThreadComments
              type="SYNTAX" // or "SYNTAX" | "PROCEDURE"
              refId={syntaxId}
              category="comment" // or "qa"
              readOnly={!idToken}
              hideComposer={!idToken}
              myUserId={myUserId ?? null}
              myEmail={myEmail ?? null} // ★ これが無いと所有判定できず編集/削除が出ない
              authHeader={authHeader} // ★ PUT/DELETE/POST 用
            />
          )}

          {/* Q&A（スレッド式） */}
          {syntaxId && tab === "qa" && (
            <ThreadComments
              type="SYNTAX"
              refId={syntaxId}
              category="qa"
              readOnly={!isLoggedIn}
              hideComposer={!isLoggedIn}
              myUserId={myUserId ?? null}
              myEmail={myEmail ?? null}
              authHeader={authHeader}
            />
          )}
        </div>

        {/* 戻る */}
        <div className="py-8">
          <Link to="/syntaxes">
            <p className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition duration-200">
              技術記事一覧に戻る
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};
