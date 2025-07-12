import React from "react";
import "./App.css";
import { Home } from "./pages/HomePage/Home";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { Navbar } from "./pages/CommonPage/Navbar";
import { TechList } from "./pages/TechListPage/TechList";
import { AdminRoute } from "./routes/AdminRoute";
import { AdminPage } from "./pages/AdminPage/Adminpage";
import { Login } from "./pages/CommonPage/Login";
import { AddArticleForm } from "./pages/AdminPage/components/AddArticleForm";
import { ArticleList } from "./pages/AdminPage/components/ArticleList";
import { AddSyntaxForm } from "./pages/AdminPage/components/AddSyntaxForm";
import { SyntaxList } from "./pages/AdminPage/components/SyntaxList";
import { ArticleDetailPage } from "./pages/ArticleDetailPage/ArticleDetailPage";

export default function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tech" element={<TechList />} />
        <Route path="/login" element={<Login />} />


        {/* 管理者専用ルート */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />

        {/* 記事投稿 */}
        <Route path="/admin/add-article" element={
          <AdminRoute>
            <AddArticleForm />
          </AdminRoute>
        } />
        {/* 文法投稿 */}
        <Route path="/admin/add-syntax" element={
          <AdminRoute>
            <AddSyntaxForm />
          </AdminRoute>
        } />

        {/* 記事一覧 */}
        <Route path="/admin/articles" element={
          <AdminRoute>
            <ArticleList />
          </AdminRoute>
        } />
        <Route path="/articles/:idAndSlug" element={<ArticleDetailPage />} />
        {/* 文法一覧 */}
        <Route path="/admin/syntaxes" element={
          <AdminRoute>
            <SyntaxList />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
}
