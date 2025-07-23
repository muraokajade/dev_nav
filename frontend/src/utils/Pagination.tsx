import { RenderPagination } from "./RenderPagination"; 

export const Pagination: React.FC<{
  displayPage: number;
  totalPages: number;
  maxPageLinks: number;
  paginate: (page: number) => void;
}> = ({ displayPage, totalPages, maxPageLinks, paginate }) => {
return (
  <nav aria-label="ページネーション">
    <ul className="flex items-center gap-2 justify-center my-4">
      <li>
        <button
          className="px-3 py-1 rounded-xl bg-gray-700 text-white hover:bg-gray-500 transition"
          onClick={() => paginate(1)}
        >
          最初
        </button>
      </li>
      {RenderPagination(displayPage, totalPages, maxPageLinks).map((page) => (
        <li key={page}>
          <button
            className={
              "px-3 py-1 rounded-xl " +
              (displayPage === page
                ? "bg-blue-600 text-white font-bold shadow"
                : "bg-gray-700 text-white hover:bg-gray-500")
            }
            onClick={() => paginate(page)}
          >
            {page}
          </button>
        </li>
      ))}
      <li>
        <button
          className="px-3 py-1 rounded-xl bg-gray-700 text-white hover:bg-gray-500 transition"
          onClick={() => paginate(totalPages)}
        >
          最後
        </button>
      </li>
    </ul>
  </nav>
);

};
