// src/App.tsx
import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 直ロード（初回表示に必要）
import { Navbar } from "./pages/CommonPage/Navbar";
import { Footer } from "./pages/CommonPage/Footer";
import { Home } from "./pages/HomePage/Home";
import { StartPage } from "./pages/StartPage/StartPage";
import { AddTechForm } from "./pages/AdminPage/components/AddTechForm";
import { AddSyntaxForm } from "./pages/AdminPage/components/AddSyntaxForm";
import { AddProcedureForm } from "./pages/AdminPage/components/AddProcedureForm";

// ---- Lazy: 一覧・詳細・認証・管理・静的 ----
// CRA でも chunk 名ヒントが効く（webpack magic comments）
const Login = lazy(() =>
  import(/* webpackChunkName: "auth-login" */ "./pages/CommonPage/Login").then(
    (m) => ({ default: m.Login })
  )
);
const Register = lazy(() =>
  import(
    /* webpackChunkName: "auth-register" */ "./pages/CommonPage/Register"
  ).then((m) => ({ default: m.Register }))
);

// Articles
const TechList = lazy(() =>
  import(
    /* webpackChunkName: "articles-list" */ "./pages/MainContentsPage/TechPage/TechList"
  ).then((m) => ({ default: m.TechList }))
);
const TechDetailPage = lazy(() =>
  import(
    /* webpackChunkName: "articles-detail" */ "./pages/MainContentsPage/TechPage/TechDetailPage"
  ).then((m) => ({ default: m.TechDetailPage }))
);

// Syntaxes
const SyntaxList = lazy(() =>
  import(
    /* webpackChunkName: "syntaxes-list" */ "./pages/MainContentsPage/SyntaxPage/SyntaxList"
  ).then((m) => ({ default: m.SyntaxList }))
);
const SyntaxDetailPage = lazy(() =>
  import(
    /* webpackChunkName: "syntaxes-detail" */ "./pages/MainContentsPage/SyntaxPage/SyntaxDetailPage"
  ).then((m) => ({ default: m.SyntaxDetailPage }))
);

// Procedures
const ProceduresPage = lazy(() =>
  import(
    /* webpackChunkName: "procedures-list" */ "./pages/MainContentsPage/ProceduresPage/ProceduresPage"
  ).then((m) => ({ default: m.ProceduresPage }))
);
const ProcedureDetailPage = lazy(() =>
  import(
    /* webpackChunkName: "procedures-detail" */ "./pages/MainContentsPage/ProceduresPage/ProcedureDetailPage"
  ).then((m) => ({ default: m.ProcedureDetailPage }))
);

// My Page (認証保護ルートはコンポごと遅延)
const MypageRoute = lazy(() =>
  import(/* webpackChunkName: "mypage-route" */ "./routes/MyPageRoute").then(
    (m) => ({ default: m.MypageRoute })
  )
);
const MyPage = lazy(() =>
  import(/* webpackChunkName: "mypage" */ "./pages/MyPage/MyPage").then(
    (m) => ({
      default: m.MyPage,
    })
  )
);

// Admin
const AdminRoute = lazy(() =>
  import(/* webpackChunkName: "admin-route" */ "./routes/AdminRoute").then(
    (m) => ({ default: m.AdminRoute })
  )
);
const AdminPage = lazy(() =>
  import(
    /* webpackChunkName: "admin-page" */ "./pages/AdminPage/Adminpage"
  ).then((m) => ({ default: m.AdminPage }))
);
const AdminTechList = lazy(() =>
  import(
    /* webpackChunkName: "admin-articles" */ "./pages/AdminPage/components/AdminTechList"
  ).then((m) => ({ default: m.AdminTechList }))
);
const AdminSyntaxList = lazy(() =>
  import(
    /* webpackChunkName: "admin-syntaxes" */ "./pages/AdminPage/components/AdminSyntaxList"
  ).then((m) => ({ default: m.AdminSyntaxList }))
);
const AdminProcedureList = lazy(() =>
  import(
    /* webpackChunkName: "admin-procedures" */ "./pages/AdminPage/components/AdminProcedureList"
  ).then((m) => ({ default: m.AdminProcedureList }))
);
const AdminQAPage = lazy(() =>
  import(
    /* webpackChunkName: "admin-qa" */ "./pages/AdminPage/components/AdminQAPage"
  ).then((m) => ({ default: m.AdminQAPage }))
);

// Static pages
const About = lazy(() =>
  import(
    /* webpackChunkName: "static-about" */ "./pages/CommonPage/About"
  ).then((m) => ({ default: m.About }))
);
const PrivacyPolicy = lazy(() =>
  import(
    /* webpackChunkName: "static-policy" */ "./pages/CommonPage/PrivacyPolicy"
  ).then((m) => ({ default: m.PrivacyPolicy }))
);
const ContactForm = lazy(() =>
  import(
    /* webpackChunkName: "static-contact" */ "./pages/CommonPage/ContactForm"
  ).then((m) => ({ default: m.ContactForm }))
);

const NotFound = lazy(
  () => import(/* webpackChunkName: "not-found" */ "./pages/NotFound")
);

// 軽いフェードだけの簡易フォールバック（SSRなしのCRA前提）
function PageFallback() {
  return (
    <div className="flex items-center justify-center py-16 text-gray-300">
      読み込み中…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        {/* ルート全体を1つのサスペンス境界で包む（最小限のフォールバックでレイアウト崩れ防止） */}
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public（即描画） */}
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<StartPage />} />

            {/* Articles */}
            <Route path="/articles" element={<TechList />} />
            <Route path="/articles/:idAndSlug" element={<TechDetailPage />} />

            {/* Syntaxes */}
            <Route path="/syntaxes" element={<SyntaxList />} />
            <Route path="/syntaxes/:idAndSlug" element={<SyntaxDetailPage />} />

            {/* Procedures */}
            <Route path="/procedures" element={<ProceduresPage />} />
            <Route
              path="/procedures/:idAndSlug"
              element={<ProcedureDetailPage />}
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* My Page */}
            <Route
              path="/mypage"
              element={
                <MypageRoute>
                  <MyPage />
                </MypageRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-article"
              element={
                <AdminRoute>
                  <AddTechForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-syntax"
              element={
                <AdminRoute>
                  <AddSyntaxForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/add-procedure"
              element={
                <AdminRoute>
                  <AddProcedureForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/articles"
              element={
                <AdminRoute>
                  <AdminTechList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/syntaxes"
              element={
                <AdminRoute>
                  <AdminSyntaxList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/procedures"
              element={
                <AdminRoute>
                  <AdminProcedureList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/qa"
              element={
                <AdminRoute>
                  <AdminQAPage />
                </AdminRoute>
              }
            />

            {/* Static */}
            <Route path="/about" element={<About />} />
            <Route path="/policy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<ContactForm />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
