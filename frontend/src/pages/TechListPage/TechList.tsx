import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../models/ArticleModel";
import axios from "axios";
import { useAuth } from "../../context/useAuthContext";
export const TechList = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [articles, setArticles] = useState<ArticleModel[]>([]);
  const [readArticleIds, setReadArticleIds] = useState<number[]>([]);
  const categories = ["Spring", "React", "Vue", "Firebase", "Tailwind"];

  const { idToken } = useAuth();
  //既読未読記事の取得
  useEffect(() => {
    axios
      .get("/api/articles/read/all", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      .then((res) => setReadArticleIds(res.data ?? []))
      .catch(() => setReadArticleIds([]));
  }, [idToken]);
  //公開中記事の取得
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get("/api/articles");
        const publishedArticles: ArticleModel[] = res.data;
        setArticles(publishedArticles);
      } catch (e) {
        console.error("記事取得失敗", e);
      }
    };
    fetchArticles();
  }, []);

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

          <ul className="space-y-2">
            {articles.map((item, i) => {
              const isRead = readArticleIds.includes(item.id);

              return (
                <li key={i}>
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
      </div>
    </div>
  );
};
