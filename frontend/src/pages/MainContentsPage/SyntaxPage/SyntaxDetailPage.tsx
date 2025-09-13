// ==========================
// src/pages/syntaxes/SyntaxDetailPage.tsx
// ==========================
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";

import dayjs from "dayjs";
import { useAuth } from "../../../context/useAuthContext";
import { LikeButton } from "../../../utils/LikeButton";
import { apiHelper } from "../../../libs/apiHelper";
import { ReviewScore } from "../../../utils/ReviewScore";
import { ThreadComments } from "../../../components/ThreadComments";

// ★ PrismLight + 必要言語だけ登録
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import oneDark from "react-syntax-highlighter/dist/esm/styles/prism/one-dark";

import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("jsx", jsx);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.registerLanguage("yml", yaml);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("html", markup);

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

/* ---------- tiny UI bits ---------- */
const Spinner = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
    aria-hidden
  />
);

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-white/10 ${className}`} />
);

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
        aria-label="コードをコピー"
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

  const { idToken, isAuthenticated } = useAuth();

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

  // 本文データ
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [syntaxId, setSyntaxId] = useState<number | null>(null);

  // UI状態
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // アクション系
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isRead, setIsRead] = useState(false);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myEmail, setMyEmail] = useState<string | null>(emailFromJwt(idToken));
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"review" | "comment" | "qa">("review");

  // トースト
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

  // いいね取得
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

  // いいね押下
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

  // 記事本体の取得（Loading/エラー管理）
  const [reloadTick, setReloadTick] = useState(0);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setPageLoading(true);
    setPageError(null);

    apiHelper
      .get(`/api/syntaxes/${id}`)
      .then((res) => {
        if (cancelled) return;
        setTitle(res.data.title);
        setAuthor(res.data.authorName ?? "（不明）");
        setCreatedAt(res.data.createdAt ?? "");
        setCategory(res.data.category ?? "");
        setImageUrl(res.data.imageUrl ?? "");
        setContent(res.data.content ?? "");
        setSyntaxId(Number(res.data.id));
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("fetch syntaxes failed", e);
        const msg =
          (e?.response?.status === 404 && "記事が見つかりませんでした") ||
          "記事の読み込みに失敗しました";
        setPageError(msg);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadTick]);

  // 自分情報（ログイン時）
  useEffect(() => {
    if (!idToken) {
      setMyUserId(null);
      setMyEmail(emailFromJwt(idToken));
      return;
    }
    let cancelled = false;
    apiHelper
      .get(`/api/me`, { headers: authHeader })
      .then((r) => {
        if (cancelled) return;
        setMyUserId(r.data?.id ?? null);
        setMyEmail(r.data?.email ?? emailFromJwt(idToken));
      })
      .catch(() => {
        if (cancelled) return;
        setMyUserId(null);
        setMyEmail(emailFromJwt(idToken));
      });
    return () => {
      cancelled = true;
    };
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

      {/* いいね（本文ロード後に表示） */}
      {isAuthenticated && !pageLoading && !pageError && (
        <div className="max-w-4xl mx-auto pt-6">
          <LikeButton
            liked={liked}
            count={likeCount}
            onClick={handleLike}
            disabled={pending}
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto py-6">
        {/* ====== ローディング / エラー / 本文 ====== */}
        {pageLoading ? (
          // --- Skeleton（読み込み中）
          <div
            className="prose prose-invert max-w-none text-white bg-zinc-900 rounded-2xl shadow-2xl p-6"
            aria-busy="true"
          >
            <Skeleton className="h-8 w-2/3 rounded mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-6 w-16 rounded" />
            </div>
            <Skeleton className="h-48 w-full rounded-xl mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
            <div className="mt-6 flex items-center gap-2 text-gray-300">
              <Spinner />
              <span className="text-sm">読み込み中...</span>
            </div>
          </div>
        ) : pageError ? (
          // --- Error 表示
          <div className="rounded-2xl bg-zinc-900 text-white shadow-2xl p-6">
            <div className="flex items-center gap-3 text-red-300">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="opacity-80"
              >
                <path fill="currentColor" d="M11 7h2v6h-2zm0 8h2v2h-2z" />
                <path
                  fill="currentColor"
                  d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2V7h2v7z"
                />
              </svg>
              <b>{pageError}</b>
            </div>
            <button
              className="mt-4 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={() => setReloadTick((x) => x + 1)}
            >
              再読み込み
            </button>
            <div className="mt-6">
              <Link to="/syntaxes" className="text-sky-400 underline">
                技術記事一覧に戻る
              </Link>
            </div>
          </div>
        ) : (
          // --- 本文
          <div className="prose prose-invert max-w-none whitespace-normal text-white bg-zinc-900 rounded-2xl shadow-2xl p-6">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-64 object-cover rounded-xl mb-6"
              />
            )}
            <h1 className="text-4xl font-bold mb-4">{title}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-6 text-gray-400 text-sm">
              <span>著者: {author}</span>
              {createdAt && (
                <span>投稿日: {dayjs(createdAt).format("YYYY/MM/DD")}</span>
              )}
              {category && (
                <span className="bg-blue-500/90 px-2 py-0.5 rounded text-white">
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
                    ? (children as any)[0]
                    : (children as any);
                  // @ts-ignore
                  const className = child?.props?.className as
                    | string
                    | undefined;
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
                    return (
                      <CodeBlock language={match?.[1]} code={codeString} />
                    );
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
        )}

        {/* Actions（本文ロード後のみ表示） */}
        {!pageLoading && !pageError && (
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
                {pending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    更新中...
                  </span>
                ) : isRead ? (
                  "読了済み（クリックで解除）"
                ) : (
                  "この記事を読了する"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tabs（本文ロード後のみ表示） */}
        {!pageLoading && !pageError && (
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

            {syntaxId && tab === "comment" && (
              <ThreadComments
                type="SYNTAX"
                refId={syntaxId}
                category="comment"
                readOnly={!idToken}
                hideComposer={!idToken}
                myUserId={myUserId ?? null}
                myEmail={myEmail ?? null}
                authHeader={authHeader}
              />
            )}

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
        )}

        {/* 一覧へ */}
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
