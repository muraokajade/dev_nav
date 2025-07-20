import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/useAuthContext"; 
import { auth } from "../../libs/firebase"; 
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ ログアウト成功");
      navigate("/");
    } catch (error) {
      console.error("❌ ログアウト失敗", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        {/* 左：ロゴ */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-white tracking-wide"
        >
          <span className="text-blue-400">Dev</span>
          <span className="text-white">Nav</span>
          <span className="text-blue-600">+</span>
        </Link>

        {/* モバイル：ハンバーガーボタン */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            ☰
          </button>
        </div>

        {/* 中央：リンク（PCのみ表示） */}
        <div className="hidden md:flex space-x-6">
          <Link to="/tech" className="text-white hover:text-blue-300">
            技術スタック
          </Link>
          <Link to="/syntaxes" className="text-white hover:text-blue-300">
            基本文法
          </Link>
          <Link to="/mypage" className="text-white hover:text-blue-300">
            マイページ
          </Link>
          <Link to="/admin" className="text-white hover:text-blue-300">
            管理者専用
          </Link>
        </div>

        {/* PC表示 */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* <span className="text-white">ようこそ, {currentUser?.displayName}</span> */}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>

      {/* モバイルメニュー */}
      {isOpen && (
        <div className="md:hidden mt-2 space-y-2 px-4">
          <Link to="/tech" className="block text-white hover:text-blue-300">
            技術スタック
          </Link>
          <Link to="/basics" className="block text-white hover:text-blue-300">
            基本文法
          </Link>
          {isAuthenticated ? (
            <>
              <span className="block text-white">
                ようこそ, {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="block w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ログイン
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
