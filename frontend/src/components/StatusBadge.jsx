
export default function StatusBadge({ status }) {
  const statusStyles = {
    active: "bg-[#16b889] text-white border-[#16b889]",
    expiring: "bg-[#fff1bf] text-[#775c00] border-[#fff1bf]",
    expired: "bg-[#ffe0e0] text-[#d22d2d] border-[#ffe0e0]",
    inactive: "bg-[#eeeeee] text-[#777] border-[#eeeeee]",
  };

  const dotStyles = {
    active: "bg-white",
    expiring: "bg-[#775c00]",
    expired: "bg-[#d22d2d]",
    inactive: "bg-[#777]",
  };

  const key = status?.toLowerCase() || "inactive";

  const badgeStyle =
    statusStyles[key] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  const dotStyle =
    dotStyles[key] || "bg-slate-400";

  return (
    <span
      className={`
        inline-flex
        max-w-full
        items-center
        gap-1.5
        whitespace-nowrap
        rounded-full
        border
        px-2.5
        py-1.5
        text-[10px]
        font-semibold
        leading-none
        sm:px-2.5
        sm:py-1.5
        sm:text-[10px]
        ${badgeStyle}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          ${dotStyle}
        `}
      />

      <span className="truncate">
        {status || "Inactive"}
      </span>
    </span>
  );
}