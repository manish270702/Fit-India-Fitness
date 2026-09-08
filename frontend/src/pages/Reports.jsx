import { useSelector } from "react-redux";

const money = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n || 0);

export default function Reports() {
    
    const members = useSelector((state) => state.members.value);
    const payments = useSelector((state) => state.payments.value);

    const data = {
        stats: {
            total: members.length,
            active: members.filter((member) => member.status === "Active").length,
            expiring: members.filter((member) => member.status === "Expiring").length,
            expired: members.filter((member) => member.status === "Expired").length,
            totalRevenue: payments.reduce((acc, payment) => acc + payment.amount, 0),
        },
    };

    // ========================================
    // ACTIVE MEMBER RATIO
    // ========================================
    const activeRatio = data.stats.total
        ? Math.min(
              100,
              (data.stats.active /
                  data.stats.total) *
                  100
          )
        : 0;

    const reportCards = [
        {
            label: "Total Members",
            value: data.stats.total,
        },
        {
            label: "Active",
            value: data.stats.active,
        },
        {
            label: "Expiring",
            value: data.stats.expiring,
        },
        {
            label: "Expired",
            value: data.stats.expired,
        },
    ];

    return (
        <div className="w-full">
            {/* ========================================
                PAGE HEADER
            ======================================== */}
            <div className="mb-6">
                <h1
                    className="
                        text-[24px]
                        font-bold
                        tracking-[-0.6px]
                        text-[#151515]
                        sm:text-[27px]
                    "
                >
                    Reports
                </h1>

                <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                    High-level operational snapshot of your gym.
                </p>
            </div>

            {/* ========================================
                REPORT STATISTICS
            ======================================== */}
            <div
                className="
                    mb-5
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-4
                "
            >
                {reportCards.map((card) => (
                    <div
                        key={card.label}
                        className="
                            min-h-[125px]
                            rounded-[9px]
                            border
                            border-[#e4e4e4]
                            bg-white
                            px-5
                            py-5
                            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                            transition
                            hover:shadow-md
                        "
                    >
                        <span className="block text-[11px] font-medium text-[#888]">
                            {card.label}
                        </span>

                        <b
                            className="
                                mt-3
                                block
                                text-[28px]
                                font-bold
                                leading-none
                                tracking-[-0.8px]
                                text-[#151515]
                            "
                        >
                            {card.value}
                        </b>
                    </div>
                ))}
            </div>

            {/* ========================================
                REVENUE PANEL
            ======================================== */}
            <div
                className="
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    p-5
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    sm:p-6
                "
            >
                <h2
                    className="
                        text-[15px]
                        font-semibold
                        text-[#222]
                    "
                >
                    Revenue
                </h2>

                {/* Revenue Amount */}
                <div
                    className="
                        mt-4
                        text-[30px]
                        font-bold
                        leading-tight
                        tracking-[-1px]
                        text-[#151515]
                        sm:text-[34px]
                    "
                >
                    {money(data.stats.totalRevenue)}
                </div>

                <p
                    className="
                        mt-2
                        max-w-[600px]
                        text-xs
                        leading-5
                        text-[#888]
                    "
                >
                    Total recorded revenue from all payment
                    records.
                </p>

                {/* ========================================
                    ACTIVE MEMBER RATIO
                ======================================== */}
                <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-[11px] font-medium text-[#666]">
                            Active Member Ratio
                        </span>

                        <span className="text-[11px] font-semibold text-[#151515]">
                            {activeRatio.toFixed(1)}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="
                            h-2
                            w-full
                            overflow-hidden
                            rounded-full
                            bg-[#eeeeee]
                        "
                    >
                        <div
                            className="
                                h-full
                                rounded-full
                                bg-[#ffd21a]
                                transition-all
                                duration-500
                            "
                            style={{
                                width: `${activeRatio}%`,
                            }}
                        />
                    </div>

                    <p className="mt-3 text-xs text-[#888]">
                        Active member ratio:{" "}
                        <b className="font-semibold text-[#151515]">
                            {activeRatio.toFixed(1)}%
                        </b>
                    </p>
                </div>
            </div>
        </div>
    );
}