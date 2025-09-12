import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useDeferredValue,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../../models/ArticleModel";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { apiHelper } from "../../../libs/apiHelper";
import { SpinnerLoading } from "../../../utils/SpinnerLoading";

/** 固定値は外に出して再生成を防ぐ */
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

/** 一覧プレビュー用：Markdownざっくり除去＆短文化 */
const stripMd = (s: string) =>
  (s || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** ページキャッシュ（同一セッション内で再取得を極力避ける） */
type PageCacheEntry = { items: ArticleModel[]; totalPages: number; ts: number };
const usePageCache = () => {
  const ref = useRef<Map<number, PageCacheEntry>>(new Map());
  return ref.current;
};

export const TechList = () => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search); // 入力中はレンダ負荷を下げる
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<number[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // レース対策
  const abortArticlesRef = useRef<AbortController | null>(null);
  const abortReadRef = useRef<AbortController | null>(null);

  const { displayPage, setDisplayPage, pageIndex, totalPages, setTotalPages } =
    usePagination();
  const { idToken } = useAuth();

  const cache = usePageCache();

  /** 既読IDの取得（失敗しても一覧表示は継続） */
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
        const res = await apiHelper.get(`/api/articles/read`, {
          params: { page: pageIndex, size: PAGE_SIZE },
          headers: { Authorization: `Bearer ${idToken}` },
          signal: ac.signal as AbortSignal,
        });
        // APIが配列を返す想定 / contentのときも許容
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.content)
          ? res.data.content
          : [];
        setReadArticleIds(data);
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("既読取得失敗", e);
        }
        setReadArticleIds([]);
      }
    })();

    return () => ac.abort();
  }, [idToken, pageIndex]);

  /** 公開記事の取得（キャッシュ即描画 → 背景更新） */
  useEffect(() => {
    // 1) キャッシュがあれば即描画
    const cached = cache.get(pageIndex);
    if (cached) {
      setArticles(cached.items);
      setTotalPages(cached.totalPages);
      setLoadingArticles(false);
    } else {
      setLoadingArticles(true);
    }

    // 2) 背景更新（10分TTL）
    const FRESH_MS = 10 * 60 * 1000;
    const now = Date.now();
    if (cached && now - cached.ts < FRESH_MS) return;

    abortArticlesRef.current?.abort();
    const ac = new AbortController();
    abortArticlesRef.current = ac;

    setError(null);

    (async () => {
      try {
        const res = await apiHelper.get(`/api/articles`, {
          params: { page: pageIndex, size: PAGE_SIZE },
          signal: ac.signal as AbortSignal,
        });
        const list: ArticleModel[] = res.data?.content ?? [];
        const pages: number = res.data?.totalPages ?? 0;

        // 一覧用にはheavyなcontentを保持しない
        const light = list.map((it) => ({
          id: it.id,
          slug: it.slug,
          title: it.title,
          summary: it.summary ?? "",
          category: it.category,
          imageUrl: it.imageUrl,
          createdAt: it.createdAt,
          published: it.published,
        })) as unknown as ArticleModel[];

        cache.set(pageIndex, { items: light, totalPages: pages, ts: now });
        setArticles(light);
        setTotalPages(pages);
      } catch (e: any) {
        if (e?.name !== "CanceledError") {
          console.error("記事取得失敗", e);
          setError(
            "記事の取得に失敗しました。時間をおいて再度お試しください。"
          );
          setArticles([]);
          setTotalPages(0);
        }
      } finally {
        setLoadingArticles(false);
      }
    })();

    return () => ac.abort();
  }, [pageIndex, setTotalPages, cache]);

  /** フィルタリングは重いので useMemo + 入力を deferred に（title/summary のみ対象） */
  const filteredArticles = useMemo(() => {
    if (!articles.length) return [] as ArticleModel[];
    const q = deferredSearch.trim().toLowerCase();
    const byCategory = selectedCategory
      ? (a: ArticleModel) => a.category === selectedCategory
      : () => true;

    if (!q) return articles.filter(byCategory);

    return articles.filter((item) => {
      if (!byCategory(item)) return false;
      const t = item.title?.toLowerCase() ?? "";
      const s = (item.summary ?? "").toLowerCase();
      return t.includes(q) || s.includes(q);
    });
  }, [articles, selectedCategory, deferredSearch]);

  /** 1パスでカテゴリ別にグルーピング（順序は CATEGORIES に従う） */
  const articlesByCategory = useMemo(() => {
    const map = new Map<string, ArticleModel[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const a of filteredArticles) {
      if (!map.has(a.category)) map.set(a.category, []);
      map.get(a.category)!.push(a);
    }
    return CATEGORIES.map((cat) => ({
      category: cat,
      articles: map.get(cat) ?? [],
    }));
  }, [filteredArticles]);

  const paginate = useCallback(
    (pageNumber: number) => setDisplayPage(pageNumber),
    [setDisplayPage]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold mb-6">技術スタック一覧</h1>

          <div className="z-30 mb-6 relative rounded-lg ring-1 ring-white/10">
            {/* 背景だけに blur を適用（選択肢の座標ズレ防止） */}
            <div className="absolute inset-0 rounded-lg bg-gray-900/80 md:backdrop-blur pointer-events-none" />
            {/* 中身（blur無し） */}
            <div className="relative p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  placeholder="検索ワードを入力（タイトル/要約）"
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

          {/* エラー表示 or ローディング or 本体 */}
          {error ? (
            <div className="text-red-300 bg-red-900/30 rounded px-3 py-2">
              {error}
            </div>
          ) : loadingArticles && !cache.get(pageIndex) ? (
            <div className="flex justify-center py-12">
              <SpinnerLoading size={36} visibleLabel="読み込み中…" />
            </div>
          ) : (
            <div>
              {articlesByCategory.map(({ category, articles }) => (
                <section key={category} className="mb-8">
                  <h2 className="text-2xl font-bold mt-10 mb-4">{category}</h2>
                  <ul className="space-y-3">
                    {articles.length === 0 && (
                      <li className="text-white/60">
                        このカテゴリの記事はありません
                      </li>
                    )}
                    {articles.map((item) => {
                      const isRead = readArticleIds.includes(item.id);
                      const preview = stripMd(item.summary ?? "").slice(0, 180);
                      return (
                        <li key={item.id}>
                          <Link
                            to={`/articles/${item.id}-${item.slug}`}
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
                                  {preview || "（要約なし）"}
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

        {totalPages > 0 && !loadingArticles && (
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
