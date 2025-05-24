const VehicleItemMobileSkeleton = () => {
  return (
    <div className="flex items-center p-4 bg-gray-100 rounded-lg animate-pulse">
      {/* Image placeholder */}
      <div className="w-12 h-12 mr-4 bg-gray-300 rounded-lg"></div>

      <div className="flex-1 flex flex-row items-center justify-between">
        {/* Vehicle info placeholder */}
        <div className="flex flex-col space-y-2">
          <div className="h-5 bg-gray-300 rounded w-32"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>

        {/* Status and additional info placeholder */}
        <div className="flex flex-col items-end gap-1">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
          <div className="flex gap-3">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
            <div className="px-3 h-6 bg-gray-300 rounded-lg w-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// You can use this component to create lists of multiple skeletons
export const VehicleItemMobileSkeletonList = ({
  count = 8,
}: {
  count?: number;
}) => {
  return (
    <div className="space-y-3">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <VehicleItemMobileSkeleton key={index} />
        ))}
    </div>
  );
};

export default VehicleItemMobileSkeleton;
