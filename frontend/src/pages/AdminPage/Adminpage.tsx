import { useEffect, useMemo, useState } from "react";
import { AddTechForm } from "./components/AddTechForm";
import { AddSyntaxForm } from "./components/AddSyntaxForm";
import { AdminTechList } from "./components/AdminTechList";
import { AdminSyntaxList } from "./components/AdminSyntaxList";
import { AdminQAPage } from "./components/AdminQAPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { AddProcedureForm } from "./components/AddProcedureForm";
import { AdminProcedureList } from "./components/AdminProcedureList";

type MenuItem = { key: string; name: string; icon: string };
type MenuSection = "投稿" | "一覧" | "その他";

const LS_ACTIVE = "admin.active";
const LS_SECTION = "admin.section";

export const AdminPage = () => {
  const groupedMenus: Record<MenuSection, MenuItem[]> = useMemo(
    () => ({
      投稿: [
        { key: "add-article", name: "記事投稿", icon: "📝" },
        { key: "add-syntax", name: "文法投稿", icon: "📝" },
        { key: "add-procedure", name: "開発手順投稿", icon: "📝" },
      ],
      一覧: [
        { key: "articles", name: "記事一覧", icon: "📄" },
        { key: "syntaxes", name: "文法一覧", icon: "📄" },
        { key: "procedures", name: "開発手順一覧", icon: "📄" },
      ],
      その他: [
        { key: "dashboard", name: "ダッシュボード", icon: "⚙" },
        { key: "qa", name: "Q&A管理", icon: "❓" },
      ],
    }),
    []
  );

  // 有効なキー/セクションかをチェックする小道具
  const allKeys = useMemo(
    () =>
      new Set(
        Object.values(groupedMenus)
          .flat()
          .map((m) => m.key)
      ),
    [groupedMenus]
  );
  const isValidKey = (k: string | null): k is string => !!k && allKeys.has(k);
  const isValidSection = (s: string | null): s is MenuSection =>
    s === "投稿" || s === "一覧" || s === "その他";

  // 初期値を localStorage から同期的に読み出し（初回レンダーで反映→チラつき回避）
  const [active, setActive] = useState<string>(() => {
    const saved = localStorage.getItem(LS_ACTIVE);
    return isValidKey(saved) ? saved : "dashboard";
  });
  const [openSection, setOpenSection] = useState<MenuSection>(() => {
    const saved = localStorage.getItem(LS_SECTION);
    return isValidSection(saved) ? saved : "投稿";
  });

  // 変更があったら保存
  useEffect(() => {
    localStorage.setItem(LS_ACTIVE, active);
  }, [active]);
  useEffect(() => {
    localStorage.setItem(LS_SECTION, openSection);
  }, [openSection]);

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <AdminDashboard />;
      case "add-article":
        return <AddTechForm />;
      case "add-syntax":
        return <AddSyntaxForm />;
      case "add-procedure":
        return <AddProcedureForm />;
      case "articles":
        return <AdminTechList />;
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
      <aside className="bg-gray-900 py-4 sm:py-8 sm:w-64 w-full">
        <div className="flex flex-col gap-4 px-4">
          {/* セクション切替 */}
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

          {/* 選択中セクションのメニュー */}
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
      <main className="flex-1 bg-gray-900 p-4 sm:p-10 overflow-x-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
