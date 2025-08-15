import { RenderPagination } from "./RenderPagination";

export const Pagination: React.FC<{
  displayPage: number;
  totalPages: number;
  maxPageLinks: number;
  paginate: (page: number) => void;
}> = ({ displayPage, totalPages, maxPageLinks, paginate }) => {
  return (
    <nav aria-label="ページネーション" className="mt-4">
      <ul className="flex items-center justify-center gap-2 whitespace-nowrap">
        <li>
          <button
            className="h-9 px-3 rounded-xl bg-gray-700 hover:bg-gray-500"
            onClick={() => paginate(1)}
          >
            最初
          </button>
        </li>

        {RenderPagination(displayPage, totalPages, maxPageLinks).map((p) => (
          <li key={p}>
            <button
              className={`h-9 w-9 rounded-xl transition
            ${
              displayPage === p
                ? "bg-blue-600 text-white font-bold shadow"
                : "bg-gray-700 hover:bg-gray-500"
            }`}
              onClick={() => paginate(p)}
            >
              {p}
            </button>
          </li>
        ))}

        <li>
          <button
            className="h-9 px-3 rounded-xl bg-gray-700 hover:bg-gray-500"
            onClick={() => paginate(totalPages)}
          >
            最後
          </button>
        </li>
      </ul>
    </nav>
  );
};
