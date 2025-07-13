import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";

export const Home = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      {/* --- three.js全画面背景 --- */}
      <Canvas
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [0, 0, 6], fov: 60 }}
      >
        {/* ▼ three.js部分はまずワイヤーフレームBox（あとで差し替えOK） */}
        {/* <ambientLight /> */}
        {/* <mesh> */}
        {/*   <boxGeometry args={[2, 2, 2]} /> */}
        {/*   <meshStandardMaterial color="#2942ff" wireframe /> */}
        {/* </mesh> */}
        {/* ↑ three.jsのエフェクトを増やすならこの中に追加！ */}
      </Canvas>

      {/* --- 中央UI（z-10） --- */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-5xl w-full py-16 px-4 rounded-2xl shadow-2xl">
          {/* --- ロゴ部分 --- */}
          <h1 className="text-5xl font-extrabold mb-5 text-blue-400 drop-shadow-lg tracking-tight">
            DevNav+ <span className="text-white">Spring Boot × React ナビゲーター</span>
          </h1>
          <p className="text-lg mb-8 text-gray-200 font-medium">
            <span className="text-blue-300 font-bold">Spring Boot</span>と
            <span className="text-blue-300 font-bold">React</span>で作られた、本格派の技術ポータル。
            <br />
            実務で通用する設計とモダンなUI/UXを体感しながら、「コードを書く楽しさ」と「開発の最前線」を体験できます。
          </p>

          {/* --- 主な機能 --- */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3 text-white flex items-center gap-2">
              <span>🛠</span> 主な機能
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>
                Spring Boot／Reactの記事・コードサンプルを体系的にまとめて参照
              </li>
              <li>
                技術ごとの「使えるTips」や実践ノウハウを収集
              </li>
              <li>
                自分の学習記録やアクション履歴を可視化（マイページ機能）
              </li>
              <li>
                コメント・レビュー・いいねで、リアクションや意見を残せる
              </li>
            </ul>
          </section>

          {/* --- このサイトについて --- */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-3 text-white flex items-center gap-2">
              <span>📚</span> このサイトについて
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>
                日本語でまとまった「Spring Boot × React」教材が少ない現状を変えるべく開発
              </li>
              <li>
                最新トレンドや現場経験を取り入れた、実践的な技術ガイド
              </li>
              <li>
                技術の「かっこよさ」「楽しさ」を直感的に感じられるUI設計
              </li>
            </ul>
          </section>

          {/* --- 注目記事 --- */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
              <span>🚀</span> 注目記事
            </h2>
            <div className="bg-gray-800/80 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition flex flex-col items-start">
              <h3 className="text-xl font-semibold mb-1 text-blue-300">
                Spring Boot × React 実践ナレッジ集
              </h3>
              <p className="text-gray-400 mb-3">
                API設計、フロント連携、セキュリティまで“現場視点”で徹底解説。
              </p>
              <Link
                to="/tech/spring"
                className="text-blue-400 hover:underline font-bold"
              >
                記事を読む →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
