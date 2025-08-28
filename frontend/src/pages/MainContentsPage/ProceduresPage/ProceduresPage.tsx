// src/pages/ProceduresPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";
import { useReadStatus, ReadTarget } from "../../../hooks/useReadStatus"; // ★ 共通化フック

// セクション見出し定義（major番号: タイトル）
const sectionTitles: Record<string, string> = {
  "1": "セクション1:環境構築",
  "2": "セクション2:firebase × Reactで管理者ユーザー作成 + 認証機能実装",
  "3": "セクション3:Spring × firebaseで管理者権限確認",
  "4": "セクション4:Spring実際に管理者として記事投稿をする(Insomnia or Postman)",
  "5": "セクション5:React(画面)を実装してSpringと連携しながら管理者専用のCRUD機能実装",
  "6": "セクション6:管理者として作成した記事を非ログインユーザーに公開",
  "7": "セクション7:記事詳細ページのユーザーアクション機能の作成・いいね機能・読了機能",
  "8": "セクション8:レビュー点数(スターレビュー)の実装",
  "9": "セクション9:レビューコメントの実装",
  "10": "セクション10:Q&A機能の実装",
  "11": "セクション11:マイページ機能の実装",
};

// 全角→半角
const toHalfWidthDigits = (s: string) =>
  (s || "").replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

// 区切り統一・桁解釈・ゼロ詰め
const normalizeStep = (raw: string) => {
  const t0 = toHalfWidthDigits(raw)
    .replace(/[‐–—−－/／⁄・\.．,、]/g, "-")
    .replace(/\s+/g, "")
    .trim();

  if (/^\d{3}$/.test(t0)) return `${t0[0]}-${t0.slice(1)}`;        // 509 -> 5-09
  if (/^\d{4}$/.test(t0)) return `${t0.slice(0,2)}-${t0.slice(2)}`; // 1001 -> 10-01

  const m = t0.match(/^(\d+)-(\d+)$/);
  return m ? `${parseInt(m[1],10)}-${m[2].padStart(2,"0")}` : t0;   // 5-9 -> 5-09
};

const parseStep = (raw: string): [number, number] => {
  const s = normalizeStep(raw);
  const m = s.match(/^(\d+)-(\d{1,2})$/);
  return m ? [parseInt(m[1],10), parseInt(m[2],10)] 
           : [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
};


type Row = Procedure & { major: number; minor: number; stepNumber: string };

export const ProceduresPage = () => {
  const [procedures, setProcedures] = useState<Row[]>([]);

  // URL ?page 初期値
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPage = parseInt(params.get("page") || "1", 10);

  // クライアント側ページング（1ページ10件のまま）
  const { totalPages, displayPage, setDisplayPage, setTotalPages } =
    usePagination(initialPage);
  const pageSize = 10;

  // 既読状態（共通フックから）
  const { isRead } = useReadStatus(ReadTarget.Procedures);

  // --- 全ページ一括取得 → 正規化 → 数値ソート → クライアントページング ---
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // まず1ページ取り、総ページ数を把握
        const first = await axios.get(`/api/procedures?page=0&size=50`);
        const total = Number(first.data.totalPages) || 1;

        // 残りページもまとめて取得
        const rest = await Promise.all(
          Array.from({ length: total - 1 }, (_, i) =>
            axios.get(`/api/procedures?page=${i + 1}&size=50`)
          )
        );

        const content: Procedure[] = [
          ...first.data.content,
          ...rest.flatMap((r) => r.data.content),
        ];

        // 正規化＆major/minor数値化
        const normalized: Row[] = content.map((p) => {
          const step = normalizeStep(p.stepNumber);
          const [major, minor] = parseStep(step);
          return { ...p, stepNumber: step, major, minor };
        });

        // 数値で完全ソート
        normalized.sort((a, b) =>
          a.major !== b.major ? a.major - b.major : a.minor - b.minor
        );

        setProcedures(normalized);
        setTotalPages(Math.ceil(normalized.length / pageSize));
      } catch (e) {
        console.error("手順一覧の取得に失敗しました", e);
        setProcedures([]);
        setTotalPages(0);
      }
    };

    fetchAll();
  }, [setTotalPages]);

  // 表示スライス
  const start = (displayPage - 1) * pageSize;
  const visible = useMemo(
    () => procedures.slice(start, start + pageSize),
    [procedures, start]
  );

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  return (
    <div className="text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>

      <div className="space-y-3">
        {visible.map((item, idx) => {
          const showHeader = idx === 0 || item.major !== visible[idx - 1].major;
          const majorStr = String(item.major);
          const readFlag = isRead(item.id);
          return (
            <div key={item.id}>
              {showHeader && (
                <h2 className="text-xl tracking-wide text-white/80 mt-10 mb-3 flex items-center gap-2">
                  <span className="inline-block h-px w-6 bg-white/15" />
                  {sectionTitles[majorStr] || `セクション${majorStr}`}
                </h2>
              )}

              <Link
                to={`/procedures/${item.id}-${item.slug}?page=${displayPage}`}
                className="group block rounded-lg p-4 bg-white/5 ring-1 ring-white/10 hover:bg-white/7 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 h-7 px-2 rounded bg-sky-500/20 text-sky-300 text-sm grid place-items-center font-semibold">
                    {item.stepNumber}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/60 line-clamp-1">
                      {sectionTitles[String(item.major)] ??
                        `セクション${item.major}`}
                    </p>
                  </div>
                  {/* 既読/未読バッジ */}
                  <span
                    className={`ml-auto shrink-0 h-6 px-2 rounded text-xs grid place-items-center transition-opacity opacity-60 group-hover:opacity-100 ${
                      readFlag
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-white/70"
                    }`}
                    aria-label={readFlag ? "既読" : "未読"}
                  >
                    {readFlag ? "既読" : "未読"}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {totalPages > 0 && (
        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={paginate}
        />
      )}
    </div>
  );
};
