import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div className="bg-gray-900 text-white py-16 px-6 md:px-20 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">DevNav+ へようこそ</h1>

      <p className="text-lg mb-8 text-gray-300">
        このアプリは、あなたの技術スタックや文法知識を「自分で管理・拡張」していくためのナレッジナビです。
        転職準備・学習の整理・ポートフォリオの参考など、幅広く活用できます。
      </p>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-white mb-3">🛠 できること</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>Spring / React / Vue の技術スタック一覧を参照</li>
          <li>JavaScript / TypeScript / Java の基本文法ガイドを確認</li>
          <li>今後は、お気に入り登録やコメント投稿も予定</li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-3">🎯 このサイトはこんな人におすすめ</h2>
        <ul className="list-disc list-inside text-gray-300">
          <li>技術スタックを整理したい学習者</li>
          <li>実務に向けて文法知識を補完したい方</li>
          <li>ポートフォリオをブラッシュアップしたい方</li>
        </ul>
      </section>

      {/* 注目技術カード */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">🚀 注目記事</h2>
        <div className="bg-gray-800 p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-2xl font-semibold mb-2">Spring Boot入門</h3>

          <p className="text-sm text-gray-400 mb-1">カテゴリ: Spring</p>
          <p className="mb-4">- GETで情報取得（Spring BootのREST API構成を具体的に解説）</p>

          <Link
            to="/tech/spring"
            className="text-blue-400 hover:underline"
          >
            詳しく見る →
          </Link>
        </div>
      </section>
    </div>
  );
};
