import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCcw } from "lucide-react";

import StatusBadge from "../components/StatusBadge.jsx";
import { useSelector } from "react-redux";

export default function Renewals() {
    const [tab, setTab] = useState("Expiring");
    const [search, setSearch] = useState("");

    // ========================================
    // STATIC MEMBERS
    // ========================================
    // const members = [
    //     {
    //         id: "1",
    //         name: "Rahul Sharma",
    //         phone: "9876543211",
    //         currentPlan: {
    //             name: "Monthly",
    //         },
    //         membershipEnd: "2026-09-05",
    //         status: "Expiring",
    //     },
    //     {
    //         id: "2",
    //         name: "Priya Singh",
    //         phone: "9876543212",
    //         currentPlan: {
    //             name: "Quarterly",
    //         },
    //         membershipEnd: "2026-09-08",
    //         status: "Expiring",
    //     },
    //     {
    //         id: "3",
    //         name: "Amit Verma",
    //         phone: "9876543213",
    //         currentPlan: {
    //             name: "Monthly",
    //         },
    //         membershipEnd: "2026-09-12",
    //         status: "Expiring",
    //     },
    //     {
    //         id: "4",
    //         name: "Neha Sharma",
    //         phone: "9876543214",
    //         currentPlan: {
    //             name: "Half Yearly",
    //         },
    //         membershipEnd: "2026-08-20",
    //         status: "Expired",
    //     },
    //     {
    //         id: "5",
    //         name: "Rohit Meena",
    //         phone: "9876543215",
    //         currentPlan: {
    //             name: "Monthly",
    //         },
    //         membershipEnd: "2026-08-15",
    //         status: "Expired",
    //     },
    //     {
    //         id: "6",
    //         name: "Anjali Gupta",
    //         phone: "9876543216",
    //         currentPlan: {
    //             name: "Yearly",
    //         },
    //         membershipEnd: "2026-08-25",
    //         status: "Expired",
    //     },
    // ];

    const members = useSelector((state) => state.members.value);
    // ========================================
    // FILTER MEMBERS
    // ========================================
    const filtered = members
        .filter((member) => member.status === tab)
        .filter((member) =>
            (
                member.name +
                " " +
                member.phone
            )
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    // ========================================
    // CALCULATE REMAINING DAYS
    // ========================================
    const days = (member) => {
        const today = new Date();

        const expiry = new Date(
            member.membershipEnd
        );

        return Math.ceil(
            (expiry - today) / 86400000
        );
    };

    // ========================================
    // FORMAT DATE
    // ========================================
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

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
                    Membership Renewals
                </h1>

                <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                    Keep track of upcoming and expired memberships.
                </p>
            </div>

            {/* ========================================
                TOOLBAR
            ======================================== */}
            <div
                className="
                    mb-[18px]
                    flex
                    flex-col
                    gap-3
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                "
            >
                {/* Tabs */}
                <div
                    className="
                        flex
                        w-full
                        rounded-[7px]
                        border
                        border-[#e0e0e0]
                        bg-white
                        p-1
                        sm:w-fit
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            setTab("Expiring")
                        }
                        className={`
                            flex-1
                            rounded-[5px]
                            px-4
                            py-2
                            text-[11px]
                            font-medium
                            transition
                            sm:flex-none
                            ${
                                tab === "Expiring"
                                    ? "bg-[#ffd21a] text-[#151515] shadow-sm"
                                    : "text-[#777] hover:bg-[#f5f5f5]"
                            }
                        `}
                    >
                        Expiring Soon
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setTab("Expired")
                        }
                        className={`
                            flex-1
                            rounded-[5px]
                            px-4
                            py-2
                            text-[11px]
                            font-medium
                            transition
                            sm:flex-none
                            ${
                                tab === "Expired"
                                    ? "bg-[#ffd21a] text-[#151515] shadow-sm"
                                    : "text-[#777] hover:bg-[#f5f5f5]"
                            }
                        `}
                    >
                        Expired
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full lg:max-w-[330px]">
                    <Search
                        size={17}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-[#999]
                        "
                    />

                    <input
                        placeholder="Search member..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        className="
                            h-10
                            w-full
                            rounded-[7px]
                            border
                            border-[#ddd]
                            bg-white
                            py-2.5
                            pl-10
                            pr-3
                            text-xs
                            text-[#444]
                            outline-none
                            transition
                            placeholder:text-[#aaa]
                            focus:border-[#c9aa00]
                            focus:ring-2
                            focus:ring-[#fff3a8]
                        "
                    />
                </div>
            </div>

            {/* ========================================
                RENEWALS TABLE
            ======================================== */}
            <div
                className="
                    overflow-hidden
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                "
            >
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse">
                        <thead>
                            <tr className="border-b border-[#ddd] bg-[#f8f8f8]">
                                <th className={thClass}>
                                    MEMBER
                                </th>

                                <th className={thClass}>
                                    PLAN
                                </th>

                                <th className={thClass}>
                                    EXPIRY
                                </th>

                                <th className={thClass}>
                                    DAYS
                                </th>

                                <th className={thClass}>
                                    STATUS
                                </th>

                                <th className={thClass}>
                                    ACTION
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((member) => {
                                const remainingDays =
                                    days(member);

                                return (
                                    <tr
                                        key={member._id}
                                        className="
                                            border-b
                                            border-[#eee]
                                            transition
                                            last:border-b-0
                                            hover:bg-[#fcfcfc]
                                        "
                                    >
                                        {/* Member */}
                                        <td className="px-[18px] py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div
                                                    className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-[#fff4b8]
                                                        text-xs
                                                        font-semibold
                                                        text-[#9b8200]
                                                    "
                                                >
                                                    {member.name.charAt(
                                                        0
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <b className="block truncate text-xs font-semibold text-[#222]">
                                                        {member.name}
                                                    </b>

                                                    <small className="mt-1 block text-[10px] text-[#999]">
                                                        {member.phone}
                                                    </small>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Plan */}
                                        <td className="px-[18px] py-4">
                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    rounded-full
                                                    border
                                                    border-[#e6e6e6]
                                                    bg-[#f7f7f7]
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-medium
                                                    text-[#555]
                                                "
                                            >
                                                {member.currentPlan
                                                    ?.name || "—"}
                                            </span>
                                        </td>

                                        {/* Expiry */}
                                        <td className="px-[18px] py-4 text-xs text-[#444]">
                                            {formatDate(
                                                member.membershipEnd
                                            )}
                                        </td>

                                        {/* Days */}
                                        <td className="px-[18px] py-4">
                                            <b
                                                className={`
                                                    text-xs
                                                    font-semibold
                                                    ${
                                                        remainingDays < 0
                                                            ? "text-[#d22d2d]"
                                                            : "text-[#c08f00]"
                                                    }
                                                `}
                                            >
                                                {remainingDays}
                                            </b>
                                        </td>

                                        {/* Status */}
                                        <td className="px-[18px] py-4">
                                            <StatusBadge
                                                status={
                                                    member.status
                                                }
                                            />
                                        </td>

                                        {/* Action */}
                                        <td className="px-[18px] py-4">
                                            <Link
                                                to={`/members/${member._id}`}
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    whitespace-nowrap
                                                    rounded-[6px]
                                                    px-2.5
                                                    py-2
                                                    text-[11px]
                                                    font-medium
                                                    text-[#8a7200]
                                                    transition
                                                    hover:bg-[#fff8d6]
                                                    hover:text-[#5f5000]
                                                "
                                            >
                                                <RefreshCcw
                                                    size={15}
                                                />

                                                Renew
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Empty State */}
                            {!filtered.length && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="
                                            h-[140px]
                                            px-4
                                            text-center
                                            text-xs
                                            text-[#999]
                                        "
                                    >
                                        No members in this category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Hint */}
            <p className="mt-2 text-center text-[10px] text-[#aaa] sm:hidden">
                Swipe left/right to view renewal details
            </p>
        </div>
    );
}

/* ========================================
   TABLE HEADER CLASS
======================================== */

const thClass = `
    h-[46px]
    px-[18px]
    text-left
    text-[10px]
    font-semibold
    tracking-[0.4px]
    text-[#777]
`;