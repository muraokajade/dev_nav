import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../../models/ArticleModel";
import axios from "axios";
import { useAuth } from "../../../context/useAuthContext";
import { usePagination } from "../../../hooks/usePagination";
import { Pagination } from "../../../utils/Pagination";
import { get } from "../../../api";
export const TechList = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<number[]>([]);
  const { displayPage, setDisplayPage, pageIndex, totalPages, setTotalPages } =
    usePagination();
  const categories = [
    "Spring",
    "React",
    "Vue",
    "Firebase",
    "Tailwind",
    "Other",
    "環境開発",
  ];

  const { idToken } = useAuth();
  // console.log("idToken", idToken);

  //既読未読記事の取得
  useEffect(() => {
    if (!idToken) return;
    const fetchReadedArticles = async () => {
      try {
        const res = await get(`/api/articles/read?page=${pageIndex}&size=10`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        console.log(res.data);
        setReadArticleIds(res.data.content ?? []);
      } catch (e) {
        console.error(e);
        setReadArticleIds([]);
      }
    };
    fetchReadedArticles();
  }, [idToken, pageIndex]);

  //公開中記事の取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`/api/articles?page=${pageIndex}&size=10`);
        console.log(res.config.url);
        const publishedArticles: ArticleModel[] = res.data.content;
        setArticles(publishedArticles);
        setTotalPages(res.data.totalPages);
      } catch (e) {
        console.error("記事取得失敗", e);
      }
    };
    fetchArticles();
  }, [pageIndex]);

  const filteredArticles = articles.filter((item) => {
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    const matchesSearch =
      search === "" ||
      item.title.includes(search) ||
      (item.content && item.content.includes(search));
    return matchesCategory && matchesSearch;
  });

  const articlesByCategory = categories.map((cat) => ({
    category: cat,
    articles: filteredArticles.filter((a) => a.category === cat),
  }));

  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

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
                  placeholder="検索ワードを入力"
                  className="min-w-0 flex-1 rounded-lg bg-white/5 ring-1 ring-white/10
                   px-4 py-2 outline-none focus:ring-2 focus:ring-sky-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="h-11 w-full sm:w-56 rounded-lg bg-white/5 ring-1 ring-white/10
                   px-3 outline-none focus:ring-2 focus:ring-sky-400"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">すべてのカテゴリ</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            {articlesByCategory.map(({ category, articles }) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mt-10 mb-4">{category}</h2>
                <ul className="space-y-3">
                  {articles.length === 0 && (
                    <li className="text-white/60">
                      このカテゴリの記事はありません
                    </li>
                  )}
                  {articles.map((item) => {
                    const isRead = readArticleIds.includes(item.id);
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
                                className="w-16 h-16 rounded object-cover flex-none"
                              />
                            )}
                            <div className="min-w-0 w-full">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-lg font-semibold leading-snug line-clamp-2">
                                  {item.title}
                                </span>
                                <span
                                  className={`shrink-0 h-6 px-2 rounded text-xs grid place-items-center
                  ${
                    isRead
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/10 text-white/70"
                  }`}
                                >
                                  {isRead ? "既読" : "未読"}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-white/70 line-clamp-3 break-words">
                                {item.summary
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
              </div>
            ))}
          </div>
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
    </div>
  );
};
