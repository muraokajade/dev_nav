import { useState } from "react";
import { Link } from "react-router-dom";
// import { AddArticleForm } from "./components/AddArticleForm"; 
// import { ArticleList } from "../TeckListPage/ArticleList"; 

export const AdminPage = () => {
    const menus = [
        { name: "技術記事投稿", path: "/admin/add-article", icon: "📝" },
        { name: "基本文法投稿", path: "/admin/add-syntax", icon: "📝" },
        { name: "記事一覧", path: "/admin/articles", icon: "📄" },
        { name: "文法一覧", path: "/admin/syntaxes", icon: "📄" },
        { name: "ユーザー管理", path: "/admin/users", icon: "👤" },
    ]

    return (
        <div className="min-h-screen bg-gray-900">
          <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-8">管理者ダッシュボード</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {menus.map(menu => (
                <Link
                  to={menu.path}
                  key={menu.path}
                  className="flex items-center bg-white rounded-2xl p-6 shadow hover:bg-gray-100 transition"
                >
                  <span className="text-3xl mr-4">{menu.icon}</span>
                  <span className="text-lg font-semibold text-gray-900">{menu.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      );
};