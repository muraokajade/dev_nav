// src/pages/ProceduresPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";

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

// 全角→半角数字／全空白除去／ハイフン統一
const toHalfWidthDigits = (s: string) =>
  (s || "").replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

const normalizeStep = (s: string) =>
  toHalfWidthDigits(s)
    .replace(/[‐–—−－]/g, "-")
    .replace(/\s+/g, "")
    .trim();

// "major-minor" → [major, minor]
const parseStep = (raw: string): [number, number] => {
  const s = normalizeStep(raw);
  const m = s.match(/^(\d+)-(\d+)$/);
  if (!m) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
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

  // --- 全ページ一括取得 → 正規化 → 数値ソート → クライアントページング ---
  useEffect(() => {
    const fetchAll = async () => {
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
                  <span className="ml-auto opacity-50 group-hover:opacity-100">
                    ›
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
