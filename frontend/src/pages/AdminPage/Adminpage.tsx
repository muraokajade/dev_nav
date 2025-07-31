import { useState } from "react";
import { AddArticleForm } from "./components/AddTechForm";
import { AddSyntaxForm } from "./components/AddSyntaxForm";
import { AdminArticleList } from "./components/AdminTechList";
import { AdminSyntaxList } from "./components/AdminSyntaxList";
import { AdminQAPage } from "./components/AdminQAPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AddProcedureForm } from "./components/AddProcedureForm";
import { AdminProcedureList } from "./components/AdminProcedureList";
type MenuItem = { key: string; name: string; icon: string };
type MenuSection = "投稿" | "一覧" | "その他";
export const AdminPage = () => {
  const [active, setActive] = useState("dashboard");
  const [openSection, setOpenSection] = useState<MenuSection>("投稿");

  const groupedMenus: Record<MenuSection, MenuItem[]> = {
    投稿: [
      { key: "add-article", name: "記事投稿", icon: "📝" },
      { key: "add-syntax", name: "文法投稿", icon: "📝" },
      { key: "add-procedure", name: "開発投稿", icon: "📝" },
    ],
    一覧: [
      { key: "articles", name: "記事一覧", icon: "📄" },
      { key: "syntaxes", name: "文法一覧", icon: "📄" },
      { key: "procedures", name: "手順一覧", icon: "📄" },
    ],
    その他: [
      { key: "dashboard", name: "ダッシュボード", icon: "⚙" },
      { key: "qa", name: "Q&A管理", icon: "❓" },
    ],
  };

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard />;
      case "add-article":
        return <AddArticleForm />;
      case "add-syntax":
        return <AddSyntaxForm />;
      case "add-procedure":
        return <AddProcedureForm />;
      case "articles":
        return <AdminArticleList />;
      case "syntaxes":
        return <AdminSyntaxList />;
      case "procedures":
        return <AdminProcedureList />;
      case "qa":
        return <AdminQAPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col sm:flex-row">
      {/* サイドメニュー */}
      <aside className="bg-zinc-950 py-4 sm:py-8 sm:w-64 w-full">
        <div className="flex flex-col gap-4 px-4">
          {/* 横並びのセクション切替 */}
          <div className="flex gap-2 justify-center sm:justify-start flex-wrap">
            {(Object.keys(groupedMenus) as MenuSection[]).map((section) => (
              <button
                key={section}
                onClick={() => setOpenSection(section)}
                className={`px-3 py-1 text-sm rounded-full font-semibold transition
                  ${
                    openSection === section
                      ? "bg-blue-700 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* 選択中セクションのメニューリスト */}
          <div className="flex flex-col gap-1">
            {groupedMenus[openSection].map((menu) => (
              <button
                key={menu.key}
                onClick={() => setActive(menu.key)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded transition 
                  ${
                    active === menu.key
                      ? "bg-blue-700 text-white"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
              >
                <span>{menu.icon}</span>
                <span className="truncate">{menu.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* メインエリア */}
      <main className="flex-1 bg-gray-950 p-4 sm:p-10 overflow-x-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
