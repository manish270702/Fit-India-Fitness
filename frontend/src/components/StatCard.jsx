import React from "react";

export default function StatCard({ title, value, change, icon }) {
  return (
    <div
      className="
        min-h-[138px]
        rounded-[9px]
        border border-[#e4e4e4]
        bg-white
        px-5 py-5
        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
        transition-shadow
        hover:shadow-md
        w-full
      "
    >
      {/* Top Section */}
      <div className="flex items-center justify-between gap-3 text-xs text-[#777]">
        <span className="truncate">
          {title}
        </span>

        <div
          className="
            flex h-[35px] w-[35px]
            shrink-0
            items-center justify-center
            rounded-lg
            bg-[#fff8d6]
            text-[#c5a400]
          "
        >
          <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">
            {icon}
          </span>
        </div>
      </div>

      {/* Value */}
      <div
        className="
          mt-3
          text-[29px]
          font-bold
          leading-tight
          tracking-[-0.8px]
          text-[#151515]
          sm:text-[30px]
        "
      >
        {value}
      </div>

      {/* Change */}
      {change && (
        <div className="mt-2 text-[11px] font-medium text-[#0fa982]">
          ↗ {change}
        </div>
      )}
    </div>
  );
}