// src/pages/ProceduresPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiHelper } from "../../../libs/apiHelper";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import { Pagination } from "../../../utils/Pagination";
import { useReadStatus, ReadTarget } from "../../../hooks/useReadStatus";

/* ================== 設定 ================== */
const CACHE_KEY = "procedures_normalized_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10分
const PAGE_SIZE = 10;

/* ================== セクション見出し ================== */
const sectionTitles: Record<string, string> = {
  "1": "セクション1:環境構築",
  "2": "セクション2:firebase × Reactで管理者ユーザー作成 + 認証機能実装",
  "3": "セクション3:Spring × firebaseで管理者権限確認",
  "4": "セクション4:Spring実際に管理者として記事投稿をする",
  "5": "セクション5:ReactとSpringの管理者CRUD機能",
  "6": "セクション6:記事公開",
  "7": "セクション7:ユーザーアクション機能（いいね・読了）",
  "8": "セクション8:レビュー点数",
  "9": "セクション9:レビューコメント",
  "10": "セクション10:Q&A機能",
  "11": "セクション11:マイページ機能",
};

/* ================== 正規化ユーティリティ ================== */
// 事前コンパイルして微最適化
const reZenkakuDigits = /[０-９]/g;
const reDelimsToHyphen = /[‐–—−－/／⁄・\.．,、]/g;
const reSpaces = /\s+/g;

const toHalfWidthDigits = (s: string) =>
  (s || "").replace(reZenkakuDigits, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );

// 入力例: "59" -> "5-09", "509" -> "5-09", "5/9" -> "5-09", "5-9" -> "5-09"
const normalizeStep = (raw: string): string => {
  const t0 = toHalfWidthDigits(String(raw ?? ""))
    .replace(reDelimsToHyphen, "-")
    .replace(reSpaces, "")
    .trim();

  const mHyphen = t0.match(/^(\d+)-(\d+)$/);
  if (mHyphen) {
    const major = String(parseInt(mHyphen[1], 10));
    const minor = mHyphen[2].padStart(2, "0");
    return `${major}-${minor}`;
  }

  if (/^\d+$/.test(t0)) {
    const len = t0.length;
    if (len === 1) return `0-0${t0}`;
    if (len === 2) return `${t0[0]}-${t0.slice(1).padStart(2, "0")}`;
    if (len === 3) return `${t0[0]}-${t0.slice(1).padStart(2, "0")}`;
    const major = String(parseInt(t0.slice(0, -2), 10));
    const minor = t0.slice(-2).padStart(2, "0");
    return `${major}-${minor}`;
  }

  return t0;
};

const parseStep = (raw: string): [number, number] => {
  const s = normalizeStep(raw);
  const m = s.match(/^(\d+)-(\d{2})$/);
  if (!m) return [999, 999];
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return Number.isFinite(major) && Number.isFinite(minor)
    ? [major, minor]
    : [999, 999];
};

type Row = Procedure & { major: number; minor: number; stepNumber: string };

type CacheShape = {
  at: number;
  rows: Row[];
};

/* ================== 本体 ================== */
export const ProceduresPage = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPage = parseInt(params.get("page") || "1", 10);

  const { totalPages, displayPage, setDisplayPage, setTotalPages } =
    usePagination(initialPage);

  const { isRead } = useReadStatus(ReadTarget.Procedures);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 1) キャッシュ命中なら即描画
    const cachedRaw = sessionStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      try {
        const cached: CacheShape = JSON.parse(cachedRaw);
        if (
          Date.now() - cached.at < CACHE_TTL_MS &&
          Array.isArray(cached.rows)
        ) {
          setRows(cached.rows);
          setTotalPages(Math.ceil(cached.rows.length / PAGE_SIZE));
          setLoading(false);
          return;
        }
      } catch {
        /* ignore */
      }
    }

    // 2) 未命中なら取得
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // まず1ページ取得して total を知る
        const first = await apiHelper.get(`/api/procedures`, {
          params: { page: 0, size: 50 },
          signal: ac.signal as AbortSignal,
        });
        const total = Number(first.data?.totalPages) || 1;

        const rest =
          total > 1
            ? await Promise.all(
                Array.from({ length: total - 1 }, (_, i) =>
                  apiHelper.get(`/api/procedures`, {
                    params: { page: i + 1, size: 50 },
                    signal: ac.signal as AbortSignal,
                  })
                )
              )
            : [];

        const content: Procedure[] = [
          ...(first.data?.content ?? []),
          ...rest.flatMap((r) => r.data?.content ?? []),
        ];

        // 正規化 + ソート
        const normalized: Row[] = content.map((p) => {
          const step = normalizeStep(p.stepNumber);
          const [major, minor] = parseStep(step);
          return { ...p, stepNumber: step, major, minor };
        });
        normalized.sort((a, b) =>
          a.major !== b.major ? a.major - b.major : a.minor - b.minor
        );

        setRows(normalized);
        const totalP = Math.ceil(normalized.length / PAGE_SIZE);
        setTotalPages(totalP);

        // キャッシュ保存
        const payload: CacheShape = { at: Date.now(), rows: normalized };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("手順一覧取得失敗", e);
          setError("手順一覧の取得に失敗しました");
        }
        setRows([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [setTotalPages]);

  // 表示ページの行だけ切り出し
  const start = (displayPage - 1) * PAGE_SIZE;
  const visible = useMemo(
    () => rows.slice(start, start + PAGE_SIZE),
    [rows, start]
  );

  return (
    <div className="text-white p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>

      {loading && <div className="mb-6 text-white/80">通信中...</div>}
      {!loading && error && (
        <div className="mb-6 text-red-300 bg-red-900/30 p-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {!loading &&
          visible.map((item, idx) => {
            const showHeader =
              idx === 0 || item.major !== visible[idx - 1].major;
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
                  className="group block rounded-lg p-4 bg-white/5 ring-1 ring-white/10 hover:bg-white/7 transition"
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
                        {sectionTitles[majorStr] || `セクション${majorStr}`}
                      </p>
                    </div>
                    <span
                      className={`ml-auto shrink-0 h-6 px-2 rounded text-xs grid place-items-center ${
                        readFlag
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      {readFlag ? "既読" : "未読"}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
      </div>

      {!loading && totalPages > 0 && (
        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={setDisplayPage}
        />
      )}
    </div>
  );
};
