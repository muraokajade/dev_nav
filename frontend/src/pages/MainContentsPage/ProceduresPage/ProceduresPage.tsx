// src/pages/ProceduresPage.tsx

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePagination } from "../../../hooks/usePagination";
import { Procedure } from "../../../models/Procedure";
import axios from "axios";
import { Pagination } from "../../../utils/Pagination";

// セクション見出し定義（major番号: タイトル）
const sectionTitles: Record<string, string> = {
  "1": "セクション1:環境構築",
  "2": "セクション2:firebase × Reactで管理者ユーザー作成 + 認証機能実装",
  "3": "セクション3:Spring × firebaseで管理者権限確認",
  "4": "セクション4:Spring実際に管理者として記事投稿をする(Insomnia or Postman)",
  "5": "セクション5:React(フロントエンド)を実装してフォーム画面から管理者CRUD実装",
  "6": "セクション6:管理者として作成した記事を非ログインユーザーに公開",
  "7": "セクション7:記事詳細ページのユーザーアクション機能の作成"
  // 必要に応じて追加
};

export const ProceduresPage = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialPage = parseInt(params.get("page") || "1", 10);
  const { totalPages, displayPage, pageIndex, setDisplayPage, setTotalPages } = usePagination(initialPage);

  // APIで手順データを取得しセット
  useEffect(() => {
    const fetchProcedures = async () => {
      const res = await axios.get(`/api/procedures?page=${pageIndex}&size=10`);
      setProcedures(res.data.content);
      setTotalPages(res.data.totalPages);
    };
    fetchProcedures();
  }, [pageIndex, setTotalPages]);

  // stepNumberのx-xxのxだけでグループ化
  const grouped = procedures.reduce((acc, item) => {
    const major = item.stepNumber.split("-")[0]; // 例: "2-04" → "2"
    if (!acc[major]) acc[major] = [];
    acc[major].push(item);
    return acc;
  }, {} as Record<string, Procedure[]>);

  // ページ送り関数
  const paginate = (pageNumber: number) => setDisplayPage(pageNumber);

  return (
    <div className="text-white p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>
      <ul className="space-y-3">
        {Object.entries(grouped).map(([major, items]) => (
          <div key={major} className="mb-8">
            <h2 className="text-xl mb-4">
              {sectionTitles[major] || `セクション${major}`}
            </h2>
            <ul className="space-y-3">
              {items
                .sort((a, b) =>
                  a.stepNumber.localeCompare(b.stepNumber, "ja", { numeric: true })
                )
                .map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/procedures/${item.id}-${item.slug}?page=${displayPage}`}
                      className="block p-4 bg-gray-800 rounded hover:bg-blue-800 transition"
                    >
                      <span className="text-blue-400 font-bold mr-2">
                        {item.stepNumber}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </ul>
      {totalPages > 0 && (
        <Pagination
          displayPage={displayPage}
          totalPages={totalPages}
          maxPageLinks={5}
          paginate={paginate}
        />
      )}
    </div>
  );
};
