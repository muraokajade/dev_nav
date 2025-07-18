import { Link } from "react-router-dom";

type Article = {
  id: number;
  title: string;
  authorName: string;
  // 必要に応じてプロパティ追加
};

type Props = {
  articles: Article[];
};

export const LikedArticlesList = ({ articles }: Props) => {
  console.log("articles:", articles);
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-2">いいねした記事一覧</h2>
      {articles.length === 0 ? (
        <div className="text-gray-400">まだありません</div>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.id} className="border-b py-2">
              <Link
                to={`/articles/${article.id}`}
                className="font-semibold text-blue-400 hover:text-blue-600 hover:underline transition cursor-pointer flex items-center gap-1"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="inline"
                >
                  <path
                    d="M4 8h8m0 0l-3-3m3 3l-3 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {article.title}
              </Link>

              <span className="ml-2 text-gray-400">{article.authorName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
