import React from "react";

// 型をつけたくなければanyでOK（後でtype/interface追加で◎）
export const ActionCard = ({ label, value, icon }: any) => (
  <div className="bg-gray-800 rounded-xl shadow p-4 flex flex-col items-center justify-center">
    <span className="text-3xl mb-2">{icon}</span>
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-gray-400 text-sm">{label}</span>
  </div>
);
