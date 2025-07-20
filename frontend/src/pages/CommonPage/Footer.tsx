import { FaGithub, FaXTwitter, FaEnvelope } from "react-icons/fa6";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 pt-12 pb-6 mt-auto shadow-inner border-t border-gray-800">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 px-6">

        {/* サービスロゴ・コピー */}
        <div className="mb-4 md:mb-0 flex flex-col items-start">
          <Link to="/" className="text-3xl font-extrabold flex items-center gap-1 mb-1">
            <span className="text-blue-400">Dev</span>
            <span className="text-white">Nav</span>
            <span className="text-blue-600">+</span>
          </Link>
          <span className="text-sm text-gray-400">
            本格派エンジニアのための技術ナビゲーター
          </span>
        </div>

        {/* サイトマップ */}
        <nav className="flex flex-col gap-2 text-base">
          <Link to="/" className="hover:text-blue-400 transition">トップ</Link>
          <Link to="/tech" className="hover:text-blue-400 transition">記事一覧</Link>
          <Link to="/mypage" className="hover:text-blue-400 transition">マイページ</Link>
          <Link to="/about" className="hover:text-blue-400 transition">運営者情報</Link>
          <Link to="/contact" className="hover:text-blue-400 transition">お問い合わせ</Link>
          <Link to="/policy" className="hover:text-blue-400 transition">プライバシーポリシー</Link>
        </nav>

        {/* SNS／GitHub等 */}
        {/* <div className="flex flex-col items-start gap-3">
          <div className="flex gap-4">
            <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 text-2xl">
              <FaGithub />
            </a>
            <a href="https://x.com/your-twitter" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 text-2xl">
              <FaXTwitter />
            </a>
            <a href="mailto:your@email.com" className="hover:text-blue-400 text-2xl">
              <FaEnvelope />
            </a>
          </div>
          <span className="text-xs text-gray-400">Powered by React / Spring Boot / Firebase</span>
        </div> */}
      </div>

      {/* コピーライト行 */}
      <div className="text-lg border-t border-gray-700 mt-10 pt-4 text-gray-500 text-center">
        &copy; 2025 <span className="text-lg text-blue-400">Dev</span>
        <span className="text-lg text-white">Nav</span>
        <span className="text-lg text-blue-600">+</span>. All rights reserved.
      </div>
    </footer>
  );
};
