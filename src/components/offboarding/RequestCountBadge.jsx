const RequestCountBadge = ({count, className = ""}) => {
  const displayCount = count > 9 ? "9+" : count;

  if (!count || count === 0) return null;

  return (
    <span
      className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${className}`}
    >
      {displayCount}
    </span>
  );
};

export default RequestCountBadge;
