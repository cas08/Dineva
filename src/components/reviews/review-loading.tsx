import React from "react";

const LoadingReviewsList: React.FC = () => {
  return (
    <div className="space-y-4 min-h-screen max-w-4xl">
      {" "}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="p-6 border rounded-lg shadow-lg bg-white animate-pulse space-y-4 max-w-4xl mx-auto break-words"
        >
          <div className="w-32 h-6 bg-gray-200"></div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, starIndex) => (
              <div
                key={starIndex}
                className="w-6 h-6 bg-gray-200 rounded-full"
              ></div>
            ))}
          </div>
          <div className="w-full h-16 bg-gray-200"></div>{" "}
        </div>
      ))}
    </div>
  );
};

export default LoadingReviewsList;
