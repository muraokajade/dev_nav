import React from "react";
import "./App.css";
import { Home } from "./pages/HomePage/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "./pages/CommonPage/Navbar";
import { TechList } from "./pages/MainContentsPage/TechPage/TechList";
import { AdminRoute } from "./routes/AdminRoute";
import { AdminPage } from "./pages/AdminPage/Adminpage";
import { Login } from "./pages/CommonPage/Login";
import { AddTechForm } from "./pages/AdminPage/components/AddTechForm";
import { AdminTechList } from "./pages/AdminPage/components/AdminTechList";
import { AddSyntaxForm } from "./pages/AdminPage/components/AddSyntaxForm";
import { AdminSyntaxList } from "./pages/AdminPage/components/AdminSyntaxList";
import { TechDetailPage } from "./pages/MainContentsPage/TechPage/TechDetailPage";
import { MypageRoute } from "./routes/MyPageRoute";
import { MyPage } from "./pages/MyPage/MyPage";
import { Register } from "./pages/CommonPage/Register";
import { AdminQAPage } from "./pages/AdminPage/components/AdminQAPage";
import { SyntaxList } from "./pages/MainContentsPage/SyntaxPage/SyntaxList";
import { SyntaxDetailPage } from "./pages/MainContentsPage/SyntaxPage/SyntaxDetailPage";
import { Footer } from "./pages/CommonPage/Footer";
import { About } from "./pages/CommonPage/About";
import { PrivacyPolicy } from "./pages/CommonPage/PrivacyPolicy";
import { ContactForm } from "./pages/CommonPage/ContactForm";
import { ProcedureDetailPage } from "./pages/MainContentsPage/ProceduresPage/ProcedureDetailPage";
import { ProceduresPage } from "./pages/MainContentsPage/ProceduresPage/ProceduresPage";
import { AddProcedureForm } from "./pages/AdminPage/components/AddProcedureForm";
import { AdminProcedureList } from "./pages/AdminPage/components/AdminProcedureList";
import { StartPage } from "./pages/StartPage/StartPage";
import { ArticlesPage } from "./pages/ArticlePage/ArticlePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/" element={<ArticlesPage />} />
          <Route path="/articles" element={<TechList />} />
          <Route path="/syntaxes" element={<SyntaxList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/articles/:idAndSlug" element={<TechDetailPage />} />
          <Route path="/syntaxes/:idAndSlug" element={<SyntaxDetailPage />} />
          <Route path="/procedures" element={<ProceduresPage />} />
          <Route
            path="/procedures/:idAndSlug"
            element={<ProcedureDetailPage />}
          />
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
                <AddTechForm />
              </AdminRoute>
            }
          />
          {/* 開発手順投稿 */}
          <Route
            path="/admin/add-article"
            element={
              <AdminRoute>
                <AddProcedureForm />
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
                <AdminTechList />
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
          {/* 開発手順一覧 */}
          <Route
            path="/admin/syntaxes"
            element={
              <AdminRoute>
                <AdminProcedureList />
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
