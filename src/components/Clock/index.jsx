import React from "react";
import { useDateTime } from "../../hooks/useDateTime";

export function Clock() {
  const { date, time } = useDateTime();

  return (
    <div className="mt-10 mb-5">
      <span className="block font-bold text-7xl text-center text-white">
        {time}
      </span>
      <span className="block text-xl text-center text-white">
        {date}
      </span>
    </div>
  );
}
