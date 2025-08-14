// StartPage.tsx
import { Link } from "react-router-dom";

export const StartPage = () => {
  const steps = [
    { id: 1, title: "環境構築", link: "/articles/env-setup" },
    { id: 2, title: "最小アプリ起動(React×Spring)", link: "/articles/hello" },
    { id: 3, title: "CRUDと認証へ", link: "/articles/crud-auth" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">
        学習を始める
      </h1>
      <p className="text-gray-400 mb-10">
        最短で成果に繋がる3ステップを用意しました。
      </p>

      {/* 3ステップ */}
      <ol className="grid md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <li
            key={s.id}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition"
          >
            <div className="text-xs uppercase tracking-wide text-gray-400">
              STEP {s.id}
            </div>
            <div className="font-semibold mt-1 text-white">{s.title}</div>
            <Link
              to={s.link}
              className="inline-block mt-3 px-3 py-1 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-400 transition"
            >
              開く
            </Link>
          </li>
        ))}
      </ol>

      {/* 進捗チェック */}
      <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="font-semibold mb-4 text-white">今日のチェック</div>
        <ul className="space-y-3 text-sm">
          {[
            "ローカル環境を起動できた",
            "API→フロントで一覧を表示できた",
            "GitHubにPushした",
          ].map((item, idx) => (
            <li key={idx} className="flex items-center">
              <input
                type="checkbox"
                className="mr-3 w-4 h-4 accent-sky-500"
              />
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* おすすめ */}
      <div className="mt-12">
        <div className="font-semibold mb-4 text-white">おすすめ記事</div>
        <div className="grid md:grid-cols-3 gap-6">
          {["環境構築完全版", "最小CRUD", "JWT認証"].map((t, i) => (
            <Link
              key={i}
              to={`/articles/${i}`}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] text-gray-200 transition"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};
