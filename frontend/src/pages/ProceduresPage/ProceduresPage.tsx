// src/pages/ProceduresPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { dummyProcedures } from "./dummyProcedures"; 

export const ProceduresPage = () => (
  <div className="text-white p-8 max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-8">開発手順 一覧</h1>
      <h2 className="text-xl mb-4">環境構築</h2>
    <ul className="space-y-3">
      {dummyProcedures.map((item) => (
        <li key={item.stepNumber}>
          <Link
            to={`/procedures/${item.stepNumber}-${item.slug}`}
            className="block p-4 bg-gray-800 rounded hover:bg-blue-800 transition"
          >
            <span className="text-blue-400 font-bold mr-2">{item.stepNumber}</span>
            <span>{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);


