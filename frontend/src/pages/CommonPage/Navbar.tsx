import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/useAuthContext";
import { auth } from "../../libs/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAuthenticated, isAdmin } = useAuth();

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
          <Link to="/tech" onClick={() => setIsOpen(false)} className="text-white hover:text-blue-300">
            技術スタック
          </Link>
          <Link to="/syntaxes" onClick={() => setIsOpen(false)} className="text-white hover:text-blue-300">
            基本文法
          </Link>
          <Link to="/procedures" onClick={() => setIsOpen(false)} className="text-white hover:text-blue-300">
            開発手順書
          </Link>
          {/* ★追加 */}
          <Link to="/mypage" onClick={() => setIsOpen(false)} className="text-white hover:text-blue-300">
            マイページ
          </Link>
          {isAdmin && (
            <Link to="/admin" onClick={() => setIsOpen(false)} className="text-white hover:text-blue-300">
              管理者専用
            </Link>
          )}
        </div>

        {/* PC表示 */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* <span className="text-white">ようこそ, {currentUser?.displayName}</span> */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false); // メニューを閉じる
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ログイン
            </Link>
          )}
        </div>
      </div>

      {/* モバイルメニュー */}
      {isOpen && (
        <div className="md:hidden flex flex-col px-4 py-3 space-y-2 text-lg text-center">
          <Link
            to="/tech"
            onClick={() => setIsOpen(false)}
            className="block text-white hover:text-blue-300"
          >
            技術スタック
          </Link>
          <Link
            to="/syntaxes"
            onClick={() => setIsOpen(false)}
            className="block text-white hover:text-blue-300"
          >
            基本文法
          </Link>
          <Link
            to="/procedures"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-300"
          >
            開発手順書
          </Link>
          {/* ★追加 */}
          <Link
            to="/mypage"
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-blue-300"
          >
            マイページ
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-300"
            >
              管理者専用
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className="block text-white">
                ようこそ, {currentUser?.email}
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false); // メニューを閉じる
                }}
                className="block md:w-full mx-auto  bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block md:w-full mx-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ログイン
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
