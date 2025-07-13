import React from "react";

export const LevelBar = ({ level = 1, exp = 50 }) => (
  <div className="w-full bg-gray-700 rounded-full h-4 mt-2 mb-4">
    <div
      className="bg-blue-500 h-4 rounded-full transition-all"
      style={{ width: `${exp}%` }}
    />
  </div>
);
