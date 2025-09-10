// src/App.tsx
import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Navbar } from "./pages/CommonPage/Navbar";
import { Footer } from "./pages/CommonPage/Footer";

import { Home } from "./pages/HomePage/Home";
import { StartPage } from "./pages/StartPage/StartPage";

import { About } from "./pages/CommonPage/About";
import { PrivacyPolicy } from "./pages/CommonPage/PrivacyPolicy";
import { ContactForm } from "./pages/CommonPage/ContactForm";

import { Login } from "./pages/CommonPage/Login";
import { Register } from "./pages/CommonPage/Register";

import { TechList } from "./pages/MainContentsPage/TechPage/TechList";
import { TechDetailPage } from "./pages/MainContentsPage/TechPage/TechDetailPage";

import { SyntaxList } from "./pages/MainContentsPage/SyntaxPage/SyntaxList";
import { SyntaxDetailPage } from "./pages/MainContentsPage/SyntaxPage/SyntaxDetailPage";

import { ProceduresPage } from "./pages/MainContentsPage/ProceduresPage/ProceduresPage";
import { ProcedureDetailPage } from "./pages/MainContentsPage/ProceduresPage/ProcedureDetailPage"; // ← これでOK

import { AdminRoute } from "./routes/AdminRoute";
import { AdminPage } from "./pages/AdminPage/Adminpage";
import { AdminTechList } from "./pages/AdminPage/components/AdminTechList";
import { AdminSyntaxList } from "./pages/AdminPage/components/AdminSyntaxList";
import { AdminProcedureList } from "./pages/AdminPage/components/AdminProcedureList";
import { AdminQAPage } from "./pages/AdminPage/components/AdminQAPage";
import { AddTechForm } from "./pages/AdminPage/components/AddTechForm";
import { AddSyntaxForm } from "./pages/AdminPage/components/AddSyntaxForm";
import { AddProcedureForm } from "./pages/AdminPage/components/AddProcedureForm";

import { MypageRoute } from "./routes/MyPageRoute";
import { MyPage } from "./pages/MyPage/MyPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <Routes>
          {/* Public */}
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
          <Route path="*" element={<NotFound />} />
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
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
