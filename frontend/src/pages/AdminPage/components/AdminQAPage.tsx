// AdminQAPage.tsx — DTO優先＆フォールバック補完つき 改訂版
import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageResponse } from "../../../models/MessageResponse";
import { AdminQuestionPage } from "./AdminQuestionPage";
import { apiHelper } from "../../../libs/apiHelper";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";

/** 管理UI向けに補完したメッセージ型（子で link を使えるようにする） */
type EnrichedMessage = MessageResponse & {
  linkTitle?: string;
  linkPath?: string;
};

/** TargetType(enum) → ルート名に変換 */
const targetEnumToRoute = (t: string | undefined) => {
  if (!t) return undefined;
  switch (t) {
    case "ARTICLE":
      return "articles";
    case "SYNTAX":
      return "syntaxes";
    case "PROCEDURE":
      return "procedures";
    default:
      return t.toLowerCase();
  }
};

/** MessageResponse から target と id を推測（DTO優先・旧プロパティにフォールバック） */
const resolveTargetAndId = (msg: any): { target?: string; id?: number } => {
  const t1 = targetEnumToRoute(msg.targetType);
  if (t1 && msg.contentId) return { target: t1, id: msg.contentId };
  if (msg.target && msg.contentId)
    return { target: msg.target, id: msg.contentId };
  if (msg.articleId) return { target: "articles", id: msg.articleId };
  if (msg.syntaxId) return { target: "syntaxes", id: msg.syntaxId };
  if (msg.procedureId) return { target: "procedures", id: msg.procedureId };
  return {};
};

/** タイトル/スラグは DTOから拾い、無ければ詳細APIで補完 */
const enrichOne = async (
  base: MessageResponse,
  idToken?: string
): Promise<EnrichedMessage> => {
  const { target, id } = resolveTargetAndId(base);
  if (!target || !id) return base;

  const titleFromDto =
    (base as any).contentTitle ??
    (base as any).articleTitle ??
    (base as any).syntaxTitle ??
    (base as any).procedureTitle;

  const slugFromDto =
    (base as any).contentSlug ??
    (base as any).articleSlug ??
    (base as any).syntaxSlug ??
    (base as any).procedureSlug;

  let title: string | undefined = titleFromDto;
  let slug: string | undefined = slugFromDto;

  if (!title || slug === undefined) {
    try {
      const res = await apiHelper.get(`/api/${target}/${id}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
      });
      title =
        res.data.title ?? res.data.name ?? res.data.subject ?? title ?? "";
      slug = res.data.slug ?? res.data.pathSlug ?? slug ?? "";
    } catch {
      // 失敗時はIDリンクだけでOK
    }
  }

  // - slugはURLに混ぜるのでencode（保険）
  const safeSlug = slug ? encodeURIComponent(slug) : "";

  const linkPath = `/${target}/${id}` + (safeSlug ? `-${safeSlug}` : "");
  const linkTitle = title || "関連コンテンツ";

  return { ...base, linkTitle, linkPath };
};

export const AdminQAPage = () => {
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const [loading, setLoading] = useState(false); // - 追加: 取得中表示
  const [error, setError] = useState<string | null>(null); // - 追加: エラー表示

  const { idToken } = useAuth();
  const { pageIndex, setTotalPages, setDisplayPage, displayPage, totalPages } =
    usePagination();

  // - 共通ヘッダをメモ化
  const authHeader = useMemo(
    () => (idToken ? { Authorization: `Bearer ${idToken}` } : undefined),
    [idToken]
  );

  /** 1ページ分取得して補完 */
  const fetchMessages = useCallback(async () => {
    setLoading(true); // - 追加
    setError(null); // - 追加
    try {
      const res = await apiHelper.get(
        `/api/messages/admin/questions?page=${pageIndex}&size=10`,
        { headers: authHeader } // - 共通ヘッダ
      );
      const raw: MessageResponse[] = res.data.content ?? [];

      // - 部分失敗に強い: Promise.allSettled
      const settled = await Promise.allSettled(
        raw.map((m) => enrichOne(m, idToken ?? undefined))
      );
      const enriched = settled
        .filter(
          (s): s is PromiseFulfilledResult<EnrichedMessage> =>
            s.status === "fulfilled"
        )
        .map((s) => s.value);

      setMessages(enriched);
      setTotalPages(res.data.totalPages ?? 0); // - null防衛
    } catch (e: any) {
      console.error("メッセージ取得失敗", e);
      setMessages([]);
      setTotalPages(0);
      setError(e?.response?.data?.message || "Q&A一覧の取得に失敗しました。");
    } finally {
      setLoading(false); // - 追加
    }
  }, [pageIndex, authHeader, idToken, setTotalPages]); // - 依存修正

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 回答送信（1件ごと）
  const handleAnswer = async (id: number, answer: string) => {
    try {
      await apiHelper.post(
        `/api/messages/admin/questions/${id}/answer`,
        { messageId: id, answer },
        { headers: authHeader } // - 統一
      );
      await fetchMessages(); // - 再取得して表示更新
    } catch (e: any) {
      alert(e?.response?.data?.message || "回答送信に失敗しました。");
    }
  };

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900 py-10">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Q&A管理
      </h1>

      {/* - 追加: エラー/ローディング表示 */}
      <div className="max-w-2xl mx-auto mb-4">
        {error && (
          <div className="rounded bg-red-900/30 text-red-200 px-3 py-2">
            {error}
          </div>
        )}
        {loading && <div className="text-zinc-300">読み込み中...</div>}
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {messages.map((msg) => (
          <AdminQuestionPage
            key={msg.id}
            message={msg as any} // 子で linkTitle / linkPath を利用
            onAnswer={(answer) => handleAnswer(msg.id, answer)}
          />
        ))}

        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={paginate}
        />
      </div>
    </div>
  );
};
