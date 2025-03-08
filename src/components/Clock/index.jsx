import React from "react";
import { useDateTime } from "../../hooks/useDateTime";

export function Clock() {
  const { date, dayPercentage, time } = useDateTime();

  return (
    <div className="mt-10 mb-5">
      <span className="block font-bold text-7xl text-center text-white">
        {time}
      </span>
      <span className="block text-xl text-center text-white">{date}</span>

      {/* Day progress bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-6 relative">
          <div
            className="bg-blue-500 h-6 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${dayPercentage}%` }}
          ></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <span className="text-white font-base">{dayPercentage}%</span>
          </div>
        </div>
        <div className="text-xs text-white text-center mt-1">Day Progress</div>
      </div>
    </div>
  );
}
