// src/pages/ProceduresPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import { Procedure } from "../../models/Procedure";
import axios from "axios";
import { Pagination } from "../../utils/Pagination";

export const ProceduresPage = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const {totalPages,displayPage, pageIndex,setDisplayPage, setTotalPages } = usePagination();
  useEffect(() => {
    const fetchProcedures = async () => {
      const res = await axios.get(`/api/procedures?page=${pageIndex}&size=10`);

      console.log(res.data);
      setProcedures(res.data.content);
      setTotalPages(res.data.totalPages);
    };
    fetchProcedures();
  }, [pageIndex, setTotalPages]);

  const grouped = procedures.reduce((acc, item) => {
  const key = item.category || "未分類";
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {} as Record<string, Procedure[]>);


  const paginate = (pageNumber:number) => setDisplayPage(pageNumber); 

  return (
    <div className="text-white p-8 max-w-2xl mx-auto">
      <ul className="space-y-3">
        <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>
      {Object.entries(grouped).map(([section, items]) => (
        <div key={section} className="mb-8">
          <h2 className="text-xl mb-4">{section}</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/procedures/${item.id}-${item.slug}`}
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
