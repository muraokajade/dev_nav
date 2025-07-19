import { useState } from "react";

// hooks/usePagination.ts
export const usePagination = (initialPage: number = 1) => {
  const [displayPage, setDisplayPage] = useState(initialPage); // 1始まり
  const [totalPages, setTotalPages] = useState(0);
  const pageIndex = displayPage - 1; // APIに渡す用

  return { displayPage, setDisplayPage, pageIndex, totalPages, setTotalPages };
};
