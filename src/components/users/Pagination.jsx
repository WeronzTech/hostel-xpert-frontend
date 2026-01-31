import {
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalItems,
  indexOfFirst,
  indexOfLast,
}) => {
  const maxVisiblePages = 2;
  const halfVisiblePages = Math.floor(maxVisiblePages / 2);

  const getPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(currentPage + halfVisiblePages, totalPages);

    if (currentPage <= halfVisiblePages) {
      endPage = maxVisiblePages;
    } else if (currentPage >= totalPages - halfVisiblePages) {
      startPage = totalPages - maxVisiblePages + 1;
    }

    return Array.from(
      {length: endPage - startPage + 1},
      (_, i) => startPage + i
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white p-4 rounded-lg shadow-sm gap-4">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{indexOfFirst + 1}</span> to{" "}
          <span className="font-medium">
            {Math.min(indexOfLast, totalItems)}
          </span>{" "}
          of <span className="font-medium">{totalItems}</span> residents
        </div>

        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="border cursor-pointer border-gray-300 rounded-lg px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="p-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <FaAngleDoubleLeft className="w-3 h-3" />
        </button>
        <button
          className="p-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous"
        >
          <FaAngleLeft className="w-3 h-3" />
        </button>

        {/* First page + ellipsis */}
        {currentPage > halfVisiblePages + 1 && totalPages > maxVisiblePages && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 cursor-pointer py-1 rounded-lg border border-gray-300 text-gray-700 min-w-[2.5rem]"
            >
              1
            </button>
            {currentPage > halfVisiblePages + 2 && (
              <span className="px-2 py-1">...</span>
            )}
          </>
        )}

        {/* Visible page numbers */}
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 cursor-pointer py-1 rounded-lg border min-w-[2.5rem] ${
              currentPage === page
                ? "bg-[#4d44b5] text-white border-[#4d44b5]"
                : "border-gray-300 text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page + ellipsis */}
        {currentPage < totalPages - halfVisiblePages &&
          totalPages > maxVisiblePages && (
            <>
              {currentPage < totalPages - halfVisiblePages - 1 && (
                <span className="px-2 py-1">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 cursor-pointer py-1 rounded-lg border border-gray-300 text-gray-700 min-w-[2.5rem]"
              >
                {totalPages}
              </button>
            </>
          )}

        <button
          className="p-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next"
        >
          <FaAngleRight className="w-3 h-3" />
        </button>
        <button
          className="p-2 cursor-pointer border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
        >
          <FaAngleDoubleRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
