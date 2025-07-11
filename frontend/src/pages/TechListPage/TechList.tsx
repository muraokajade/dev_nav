import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleModel } from "../../models/ArticleModel";
import axios from "axios";
export const TechList = () => {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [articles, setArticles] = useState<ArticleModel[]>([]);
    const categories = ["Spring", "React", "Vue", "Firebase", "Tailwind"];

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
    
          {/* グループごとに表示 */}
          {/* {grouped.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.category} className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 border-b border-gray-600 pb-1">
                    {group.category}
                  </h2>
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i}>
                        <Link
                          to={`/articles/${item.slug}`}
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
                              </span>
                              <p className="text-sm text-gray-300">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )} */}
        </div>
      </div>
      </div>
      );
}