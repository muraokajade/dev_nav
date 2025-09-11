// src/pages/MainContentsPage/SyntaxPage/SyntaxList.tsx
import {
  useEffect,
  useState,
  useMemo,
  useDeferredValue,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../../models/ArticleModel";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { apiHelper } from "../../../libs/apiHelper";

const CATEGORIES = [
  "Spring",
  "React",
  "Vue",
  "Firebase",
  "Tailwind",
  "Other",
  "環境開発",
] as const;
const PAGE_SIZE = 10;

export const SyntaxList = () => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [syntaxes, setSyntaxes] = useState<ArticleModel[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { displayPage, setDisplayPage, pageIndex, totalPages, setTotalPages } =
    usePagination();
  const { idToken } = useAuth();

  // レース対策（必要なら）
  const abortReadRef = useRef<AbortController | null>(null);
  const abortListRef = useRef<AbortController | null>(null);

  /** 既読ID */
  useEffect(() => {
    if (!idToken) {
      setReadArticleIds([]);
      return;
    }
    abortReadRef.current?.abort();
    const ac = new AbortController();
    abortReadRef.current = ac;

    (async () => {
      try {
        const res = await apiHelper.get(`/api/syntaxes/read/all`, {
          headers: { Authorization: `Bearer ${idToken}` },
          signal: ac.signal as AbortSignal,
        });
        setReadArticleIds(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        if (e?.name !== "CanceledError") console.error("既読取得失敗", e);
        setReadArticleIds([]);
      }
    })();

    return () => ac.abort();
  }, [idToken]);

  /** 一覧 */
  useEffect(() => {
    abortListRef.current?.abort();
    const ac = new AbortController();
    abortListRef.current = ac;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await apiHelper.get(`/api/syntaxes`, {
          params: { page: pageIndex, size: PAGE_SIZE },
          signal: ac.signal as AbortSignal,
        });
        const list: ArticleModel[] = res.data?.content ?? [];
        setSyntaxes(list);
        setTotalPages(res.data?.totalPages ?? 0);
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("文法記事取得失敗", e);
          setError(
            "文法記事の取得に失敗しました。時間をおいて再度お試しください。"
          );
        }
        setSyntaxes([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [pageIndex, setTotalPages]);

  /** 重いフィルタはメモ化 + 入力はdeferred */
  const filtered = useMemo(() => {
    if (!syntaxes.length) return [] as ArticleModel[];

    const q = deferredSearch.trim().toLowerCase();
    const byCategory = selectedCategory
      ? (a: ArticleModel) => a.category === selectedCategory
      : () => true;

    if (!q) return syntaxes.filter(byCategory);

    return syntaxes.filter((item) => {
      if (!byCategory(item)) return false;
      const t = item.title?.toLowerCase() ?? "";
      const c = item.content?.toLowerCase() ?? "";
      return t.includes(q) || c.includes(q);
    });
  }, [syntaxes, selectedCategory, deferredSearch]);

  /** 1パスでカテゴリ分割（表示順は固定） */
  const syntaxesByCategory = useMemo(() => {
    const map = new Map<string, ArticleModel[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return CATEGORIES.map((cat) => ({
      category: cat,
      syntaxes: map.get(cat) ?? [],
    }));
  }, [filtered]);

  const paginate = useCallback(
    (pageNumber: number) => setDisplayPage(pageNumber),
    [setDisplayPage]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold mb-6">基本文法</h1>

          {/* フィルター */}
          <div className="z-30 mb-6 relative rounded-lg ring-1 ring-white/10">
            <div className="absolute inset-0 rounded-lg bg-gray-900/80 md:backdrop-blur pointer-events-none" />
            <div className="relative p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  placeholder="検索ワードを入力"
                  className="min-w-0 flex-1 rounded-lg bg-white/5 ring-1 ring-white/10 px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="h-11 w-full sm:w-56 rounded-lg bg-white/5 ring-1 ring-white/10 px-3 outline-none focus:ring-2 focus:ring-sky-400"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">すべてのカテゴリ</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 通信状態 */}
          {error && (
            <div className="text-red-300 bg-red-900/30 rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}
          {loading && !error && (
            <div className="text-gray-300 py-6">通信中...</div>
          )}

          {!loading && !error && (
            <div>
              {syntaxesByCategory.map(({ category, syntaxes }) => (
                <section key={category} className="mb-8">
                  <h2 className="text-2xl font-bold mt-10 mb-4">{category}</h2>
                  <ul className="space-y-3">
                    {syntaxes.length === 0 && (
                      <li className="text-white/60">
                        このカテゴリの記事はありません
                      </li>
                    )}
                    {syntaxes.map((item) => {
                      const isRead = readArticleIds.includes(item.id);
                      return (
                        <li key={item.id}>
                          <Link
                            to={`/syntaxes/${item.id}-${item.slug}`}
                            className="block rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/7 transition p-4"
                          >
                            <div className="flex gap-4">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  width={64}
                                  height={64}
                                  loading="lazy"
                                  decoding="async"
                                  fetchPriority="low"
                                  className="w-16 h-16 rounded object-cover flex-none"
                                />
                              )}
                              <div className="min-w-0 w-full">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-lg font-semibold leading-snug line-clamp-2">
                                    {item.title}
                                  </span>
                                  <span
                                    className={`shrink-0 h-6 px-2 rounded text-xs grid place-items-center ${
                                      isRead
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : "bg-white/10 text-white/70"
                                    }`}
                                  >
                                    {isRead ? "既読" : "未読"}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-white/70 line-clamp-3 break-words">
                                  {(item.summary ?? item.content ?? "")
                                    .replace(/#### |### /g, "")
                                    .replace(/[#>*`-]+/g, "")
                                    .replace("想定読者", "【想定読者】")
                                    .replace(
                                      "注意ポイントまとめ",
                                      "【注意ポイントまとめ】"
                                    )
                                    .replace(
                                      "対応例（Java）",
                                      "【対応例（Java）】"
                                    )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {totalPages > 0 && !loading && (
          <Pagination
            displayPage={displayPage}
            totalPages={totalPages}
            maxPageLinks={5}
            paginate={paginate}
          />
        )}
      </div>
    </div>
  );
};
