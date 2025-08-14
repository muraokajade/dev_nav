import { Link } from "react-router-dom";

export const LpPage = () => {
  const mockArticles = [
    {
      id: 1,
      category: "React",
      level: "初級",
      title: "useStateとuseEffectの基本",
      createdAt: "2025-08-01",
    },
    {
      id: 2,
      category: "Spring Boot",
      level: "中級",
      title: "REST APIを作ってみよう",
      createdAt: "2025-07-28",
    },
    {
      id: 3,
      category: "TypeScript",
      level: "中級",
      title: "型安全なフォームの作り方",
      createdAt: "2025-07-25",
    },
    {
      id: 4,
      category: "JPA",
      level: "上級",
      title: "複雑なクエリを@Queryで実装する",
      createdAt: "2025-07-20",
    },
  ];

  // 共通ボタンスタイル
  const primaryBtn =
    "px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold";
  const ghostBtn =
    "px-5 py-2 rounded-lg border border-gray-400 hover:bg-gray-700 transition font-semibold";

  return (
    <main className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-20">
          <h1 className="text-3xl font-bold mb-4">
            2025年最新 日本語版
            <br />
            Spring × React 実践教材
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            日本語での統合教材は希少。TypeScript × Java を一気通貫で学び、
            実装からデプロイまで短期間で習得できます。
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/start" className={primaryBtn}>
              学習を始める
            </Link>
            <Link to="/articles" className={ghostBtn}>
              記事を探す
            </Link>
          </div>
        </section>

        {/* ステップ */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6">最短3ステップで成果へ</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 1, title: "環境構築", link: "/articles/env-setup" },
              { id: 2, title: "最小アプリ起動", link: "/articles/hello" },
              { id: 3, title: "CRUDと認証へ", link: "/articles/crud-auth" },
            ].map((s) => (
              <div
                key={s.id}
                className="bg-gray-800 rounded-lg p-5 shadow-md min-h-[150px] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-gray-400">STEP {s.id}</div>
                  <div className="font-semibold mt-1">{s.title}</div>
                </div>
                <Link
                  to={s.link}
                  className={`${ghostBtn} mt-3 text-center block`}
                >
                  開く
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 記事検索デモ */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6">記事検索デモ</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {mockArticles.map((a) => (
              <div key={a.id} className="bg-gray-800 rounded-lg p-5 shadow-md">
                <div className="text-xs text-sky-400 mb-1">
                  {a.category}・{a.level}
                </div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 実績 */}
        <section className="mb-20 text-center">
          <h2 className="text-2xl font-bold mb-4">実績と信頼</h2>
          <p className="text-gray-300 mb-6">
            記事数 60本以上 / 機能実装完了 / 統合教材検索1位を目指す
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {["初心者も安心", "実務者も活用可", "日本語で完結"].map(
              (label, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-md">
                  {label}
                </div>
              )
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">今すぐ学習を始めましょう</h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/start" className={primaryBtn}>
              学習を始める
            </Link>
            <Link to="/articles" className={ghostBtn}>
              記事を探す
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};
