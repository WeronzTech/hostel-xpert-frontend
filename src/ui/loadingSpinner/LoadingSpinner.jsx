const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d44b5] mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
