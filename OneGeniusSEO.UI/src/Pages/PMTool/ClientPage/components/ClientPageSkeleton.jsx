const ClientPageSkeleton = () => {
  return (
    <div
      className="tw:flex-grow tw:flex tw:flex-col tw:animate-pulse"
      style={{ height: "calc(100vh - 55px)" }}
    >
      {/* Header Skeleton */}
      <div className="tw:p-4">
        <div className="tw:h-8 tw:bg-white/20 tw:rounded-md tw:w-64"></div>
      </div>

      {/* Content Skeleton */}
      <div className="tw:flex-1 tw:p-4 tw:pb-8 tw:flex tw:items-start tw:gap-4 tw:overflow-hidden">
        {/* List Skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="tw:w-72 tw:bg-gray-200 tw:rounded-lg tw:p-2 tw:flex-shrink-0 tw:flex tw:flex-col tw:shadow-md"
            style={{ height: "400px" }}
          >
            {/* List Header */}
            <div className="tw:flex tw:justify-between tw:items-center tw:px-2 tw:pt-1 tw:mb-2">
              <div className="tw:h-5 tw:bg-gray-300 tw:rounded tw:w-32"></div>
              <div className="tw:w-6 tw:h-6 tw:bg-gray-300 tw:rounded"></div>
            </div>

            {/* Cards Skeleton */}
            <div className="tw:space-y-2 tw:px-1 tw:pb-2 tw:flex-1">
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="tw:bg-white tw:rounded-md tw:p-2.5 tw:shadow-sm"
                >
                  <div className="tw:h-4 tw:bg-gray-200 tw:rounded tw:w-full tw:mb-1"></div>
                  <div className="tw:h-3 tw:bg-gray-200 tw:rounded tw:w-3/4"></div>
                </div>
              ))}
            </div>

            {/* Add Card Button Skeleton */}
            <div className="tw:mx-1 tw:mt-2 tw:p-2 tw:h-10 tw:bg-gray-300/50 tw:rounded-lg"></div>
          </div>
        ))}

        {/* Add List Button Skeleton */}
        <div className="tw:w-72 tw:flex-shrink-0 tw:bg-white/20 tw:p-3 tw:rounded-xl tw:flex tw:items-center tw:gap-2">
          <div className="tw:w-4 tw:h-4 tw:bg-white/40 tw:rounded"></div>
          <div className="tw:h-4 tw:bg-white/40 tw:rounded tw:w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default ClientPageSkeleton;
