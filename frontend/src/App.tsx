import React from "react";
import "./App.css";
import { Home } from "./pages/HomePage/Home";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { Navbar } from "./pages/CommonPage/Navbar";
import { TechList } from "./pages/MainContentsPage/TechList";
import { AdminRoute } from "./routes/AdminRoute";
import { AdminPage } from "./pages/AdminPage/Adminpage";
import { Login } from "./pages/CommonPage/Login";
import { AddArticleForm } from "./pages/AdminPage/components/AddArticleForm";
import { AdminArticleList } from "./pages/AdminPage/components/AdminArticleList";
import { AddSyntaxForm } from "./pages/AdminPage/components/AddSyntaxForm";
import { AdminSyntaxList } from "./pages/AdminPage/components/AdminSyntaxList";
import { ArticleDetailPage } from "./pages/ArticleDetailPage/ArticleDetailPage";
import { MypageRoute } from "./routes/MyPageRoute";
import { MyPage } from "./pages/MyPage/MyPage";
import { Register } from "./pages/CommonPage/Register";
import { AdminQAPage } from "./pages/AdminPage/components/AdminQAPage";
import { SyntaxList } from "./pages/MainContentsPage/SyntaxList";
import { SyntaxDetailPage } from "./pages/SyntaxDetailPage/SyntaxDetailPage";
import { Footer } from "./pages/CommonPage/Footer";
import { About } from "./pages/CommonPage/About";
import { PrivacyPolicy } from "./pages/CommonPage/PrivacyPolicy";
import { ContactForm } from "./pages/CommonPage/ContactForm";
import { ProceduresDetail } from "./pages/ProceduresPage/ProceduresDetail";
import { ProceduresPage } from "./pages/ProceduresPage/ProceduresPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tech" element={<TechList />} />
          <Route path="/syntaxes" element={<SyntaxList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/articles/:idAndSlug" element={<ArticleDetailPage />} />
          <Route path="/syntaxes/:idAndSlug" element={<SyntaxDetailPage />} />
          <Route path="/procedures" element={<ProceduresPage />} />
          <Route path="/procedures/:idAndSlug" element={<ProceduresDetail />} />
          <Route
            path="/mypage"
            element={
              <MypageRoute>
                <MyPage />
              </MypageRoute>
            }
          />
          {/* 管理者専用ルート */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* 記事投稿 */}
          <Route
            path="/admin/add-article"
            element={
              <AdminRoute>
                <AddArticleForm />
              </AdminRoute>
            }
          />
          {/* 文法投稿 */}
          <Route
            path="/admin/add-syntax"
            element={
              <AdminRoute>
                <AddSyntaxForm />
              </AdminRoute>
            }
          />

          {/* 記事一覧 */}
          <Route
            path="/admin/articles"
            element={
              <AdminRoute>
                <AdminArticleList />
              </AdminRoute>
            }
          />
          {/* 記事一覧 */}
          <Route
            path="/admin/qa"
            element={
              <AdminRoute>
                <AdminQAPage />
              </AdminRoute>
            }
          />

          {/* 文法一覧 */}
          <Route
            path="/admin/syntaxes"
            element={
              <AdminRoute>
                <AdminSyntaxList />
              </AdminRoute>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactForm />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
