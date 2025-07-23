import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../models/ArticleModel";
import axios from "axios";
import { useAuth } from "../../context/useAuthContext";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../../utils/Pagination";
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
        const res = await axios.get(
          `/api/articles/read?page=${pageIndex}&size=10`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
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
      <div className="p-8 max-w-3xl mx-auto">
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold mb-6">技術スタック一覧</h1>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="検索ワードを入力"
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:border-blue-500 w-full sm:w-1/2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:border-blue-500 text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            {articlesByCategory.map(({ category, articles }) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{category}</h2>
                <ul className="space-y-2">
                  {articles.length === 0 && (
                    <li className="text-gray-400">
                      このカテゴリの記事はありません
                    </li>
                  )}
                  {articles.map((item, i) => {
                    const isRead = readArticleIds.includes(item.id);
                    return (
                      <li key={item.id}>
                        <Link
                          to={`/articles/${item.id}-${item.slug}`}
                          className="block p-4 rounded bg-gray-800 hover:bg-gray-700 transition"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={item.imageUrl || "/default-thumbnail.jpg"}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex flex-col">
                              <span className="text-lg font-semibold mb-4">
                                {item.title}
                                {isRead ? (
                                  <span className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs">
                                    既読
                                  </span>
                                ) : (
                                  <span className="ml-2 px-2 py-1 bg-gray-500 text-white rounded text-xs">
                                    未読
                                  </span>
                                )}
                              </span>
                              <p className="text-sm text-gray-300">
                                {item.content.slice(0, 300)}
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
