// LikedArticlesList.tsx
import { Link } from "react-router-dom";
import type { Article as HookArticle } from "../../../hooks/useLikedArticles";

type Props = {
  articles: HookArticle[];
  showTitle?: boolean; // 追加
  variant?: "card" | "bare"; // 追加
};

export const LikedArticlesList = ({ articles, variant = "card" }: Props) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    variant === "card" ? (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 divide-y divide-white/10">
        {children}
      </div>
    ) : (
      <>{children}</>
    );

  return (
    <Wrapper>
      {articles.length === 0 ? (
        <div className="px-4 py-3 text-gray-400">まだありません</div>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.id} className="px-4 py-3">
              <Link
                to={`/articles/${article.id}`}
                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline transition flex items-center gap-1"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="inline"
                  aria-hidden
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
    </Wrapper>
  );
};
