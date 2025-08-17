// AdminQAPage.tsx — DTO優先＆フォールバック補完つき 完全版
import { useCallback, useEffect, useState } from "react";
import { MessageResponse } from "../../../models/MessageResponse";
import { AdminQuestionPage } from "./AdminQuestionPage";
import axios from "axios";
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
  // サーバDTO例: "ARTICLE" | "SYNTAX" | "PROCEDURE"
  if (!t) return undefined;
  switch (t) {
    case "ARTICLE":
      return "articles";
    case "SYNTAX":
      return "syntaxes";
    case "PROCEDURE":
      return "procedures";
    default:
      // 既に "articles" 等が入ってくる場合にも対応
      return t.toLowerCase();
  }
};

/** MessageResponse から target と id を推測（DTO優先・旧プロパティにフォールバック） */
const resolveTargetAndId = (msg: any): { target?: string; id?: number } => {
  // 1) DTO拡張版（推奨）
  const t1 = targetEnumToRoute(msg.targetType);
  if (t1 && msg.contentId) return { target: t1, id: msg.contentId };

  // 2) 旧形式（target + contentId）
  if (msg.target && msg.contentId)
    return { target: msg.target, id: msg.contentId };

  // 3) さらにフォールバック（articles/syntaxes/procedures 専用キー）
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
  if (!target || !id) return base; // 紐付け無しなら素のまま

  // DTOから優先して拾う（あればAPI追加不要）
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

  // 無ければ詳細APIで補完
  if (!title || slug === undefined) {
    try {
      const res = await axios.get(`/api/${target}/${id}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
      });
      title =
        res.data.title ?? res.data.name ?? res.data.subject ?? title ?? "";
      slug = res.data.slug ?? res.data.pathSlug ?? slug ?? "";
    } catch {
      // 失敗時はIDリンクだけでOK
    }
  }

  const linkPath = `/${target}/${id}` + (slug ? `-${slug}` : "");
  const linkTitle = title || "関連コンテンツ";

  return { ...base, linkTitle, linkPath };
};

export const AdminQAPage = () => {
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const { idToken } = useAuth();
  const { pageIndex, setTotalPages, setDisplayPage, displayPage,totalPages } =
    usePagination();

  /** 1ページ分取得して補完 */
  const fetchMessages = useCallback(async () => {
    try {
      const res = await axios.get(
        `/api/messages/admin/questions?page=${pageIndex}&size=10`,
        {
          headers: { Authorization: idToken ? `Bearer ${idToken}` : undefined },
        }
      );
      const raw: MessageResponse[] = res.data.content ?? [];

      // 並列で enrich（DTOに揃っていればHTTPは発生しない）
      const enriched = await Promise.all(
        raw.map((m) => enrichOne(m, idToken ?? undefined))
      );

      setMessages(enriched);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error("メッセージ取得失敗", e);
      setMessages([]);
    }
  }, [idToken, pageIndex]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 回答送信（1件ごと）
  const handleAnswer = async (id: number, answer: string) => {
    try {
      await axios.post(
        `/api/messages/admin/questions/${id}/answer`,
        { messageId: id, answer },
        {
          headers: { Authorization: idToken ? `Bearer ${idToken}` : undefined },
        }
      );
      alert("回答完了");
      fetchMessages(); // 再取得して表示更新
    } catch (e) {
      alert("回答送信失敗");
    }
  };

  const paginate = (pageNumber:number) => setDisplayPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-900 py-10">
      <h1 className="text-2xl font-bold text-white text-center mb-8">
        Q&A管理
      </h1>
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
