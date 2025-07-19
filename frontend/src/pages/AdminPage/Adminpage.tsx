import { useState } from "react";
import { AddArticleForm } from "./components/AddArticleForm";
import { AddSyntaxForm } from "./components/AddSyntaxForm";
import { AdminArticleList } from "./components/AdminArticleList";
import { AdminSyntaxList } from "./components/AdminSyntaxList";
import { AdminQAPage } from "./components/AdminQAPage";
import { AdminDashboard } from "./components/AdminDashboard";
// ...必要なら他のimport

export const AdminPage = () => {
  // サイドメニューの定義
  const menus = [
    { key: "dashboard", name: "ダッシュボード", icon: "🏠" },
    { key: "add-article", name: "技術記事投稿", icon: "📝" },
    { key: "add-syntax", name: "基本文法投稿", icon: "📝" },
    { key: "articles", name: "記事一覧", icon: "📄" },
    { key: "syntaxes", name: "文法一覧", icon: "📄" },
    { key: "qa", name: "Q&A管理", icon: "❓" },
  ];

  // 現在アクティブなメニュー
  const [active, setActive] = useState("dashboard");

  // メイン表示を切り替える
  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard />;
      case "add-article":
        return <AddArticleForm />;
      case "add-syntax":
        return <AddSyntaxForm />;
      case "articles":
        return <AdminArticleList />;
      case "syntaxes":
        return <AdminSyntaxList />;
      case "qa":
        return <AdminQAPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* サイドメニュー */}
      <aside className="w-56 bg-zinc-950 py-8 flex flex-col gap-2">
        {menus.map((menu) => (
          <button
            key={menu.key}
            onClick={() => setActive(menu.key)}
            className={`flex items-center gap-3 px-6 py-3 text-lg font-semibold rounded-l-xl transition
              ${
                active === menu.key
                  ? "bg-blue-700 text-white"
                  : "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
              }`}
          >
            <span className="text-2xl">{menu.icon}</span>
            <span>{menu.name}</span>
          </button>
        ))}
      </aside>

      {/* メインエリア */}
      <main className="flex-1 bg-gray-950 p-10">{renderContent()}</main>
    </div>
  );
};
