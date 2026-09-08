import { useMemo, useState } from "react";
import {
    Plus,
    Search,
    Download,
} from "lucide-react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import StatusBadge from "../components/StatusBadge.jsx";
import { useDispatch, useSelector } from "react-redux";
import { RemoveMember } from "../store/Slice/Members.Slice.js";
import axios from 'axios';


// ========================================
// Helper Functions
// ========================================

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


function Members() {
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const members = useSelector((state) => state.members.value);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const token = useSelector((state) => state.token.value)


    // ========================================
    // Filter Members
    // ========================================

    const filteredMembers = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return members.filter((member) => {
            const matchesSearch =
                !searchValue ||
                member.name
                    .toLowerCase()
                    .includes(searchValue) ||
                member.phone
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                status === "All" ||
                member.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [members, search, status]);


    // ========================================
    // Delete Member
    // ========================================

    const deleteMember = async (id) => {
    const member = members.find((m) => m._id === id);

    if (!member) return;

    const confirmed = window.confirm(
        `Are you sure you want to delete ${member.name}?`
    );

    if (!confirmed) return;

    try {
        await axios.delete(
            `http://localhost:5000/api/members/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        dispatch(RemoveMember(id));

    } catch (error) {
        console.error(
            "Delete failed:",
            error.response?.data || error.message
        );

        alert(
            error.response?.data?.message ||
            "Failed to delete member"
        );
    }
};


    // ========================================
    // Export Members
    // ========================================

    const exportMembers = () => {
        if (filteredMembers.length === 0) {
            alert("There are no members to export.");
            return;
        }

        const headers = [
            "Name",
            "Phone",
            "Gender",
            "Time Slot",
            "Plan",
            // "Start Date",
            "Expiry Date",
            "Status",
        ];

        const rows = filteredMembers.map((member) => [
            member.name,
            member.phone,
            member.gender,
            member.timeSlot,
            member.currentPlan?.name || "",
            // member.membershipStart,
            member.membershipEnd,
            member.status,
        ]);

        const csv = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(
                            /"/g,
                            '""'
                        )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "gym-members.csv";

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    // ========================================
    // JSX
    // ========================================

    return (
        <div className="w-full">

            {/* ========================================
                HEADER
            ======================================== */}

            <div
                className="
                    mb-6
                    flex
                    flex-col
                    items-start
                    justify-between
                    gap-4
                    sm:flex-row
                    sm:items-center
                "
            >
                <div>
                    <h1
                        className="
                            text-[24px]
                            font-bold
                            tracking-[-0.6px]
                            text-[#151515]
                            sm:text-[27px]
                        "
                    >
                        Members
                    </h1>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-[#888]
                            sm:text-[13px]
                        "
                    >
                        Manage gym members, plans and
                        membership status.
                    </p>
                </div>

                <Link
                    to="/members/new"
                    className="
                        inline-flex
                        h-10
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-[7px]
                        border
                        border-[#ffd21a]
                        bg-[#ffd21a]
                        px-[15px]
                        text-xs
                        font-semibold
                        text-[#111]
                        no-underline
                        transition
                        hover:bg-[#f5c800]
                        sm:w-auto
                    "
                >
                    <Plus size={17} />

                    Add Member
                </Link>
            </div>


            {/* ========================================
                TOOLBAR
            ======================================== */}

            <div
                className="
                    mb-[18px]
                    flex
                    flex-col
                    gap-2.5
                    rounded-[9px]
                    border
                    border-[#e4e4e4]
                    bg-white
                    p-3
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    sm:flex-row
                    sm:items-center
                    sm:p-4
                "
            >

                {/* Search */}

                <div className="relative min-w-0 flex-1">
                    <Search
                        size={16}
                        className="
                            absolute
                            left-3
                            top-1/2
                            -translate-y-1/2
                            text-[#999]
                        "
                    />

                    <input
                        type="text"
                        placeholder="Search by name or phone..."
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


                {/* Status Filter */}

                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                    className="
                        h-10
                        w-full
                        rounded-[7px]
                        border
                        border-[#ddd]
                        bg-white
                        px-3
                        text-xs
                        text-[#444]
                        outline-none
                        transition
                        focus:border-[#c9aa00]
                        focus:ring-2
                        focus:ring-[#fff3a8]
                        sm:w-auto
                        sm:min-w-[130px]
                    "
                >
                    <option value="All">
                        All
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Expiring">
                        Expiring
                    </option>

                    <option value="Expired">
                        Expired
                    </option>

                    <option value="Inactive">
                        Inactive
                    </option>
                </select>


                {/* Export */}

                <button
                    type="button"
                    onClick={exportMembers}
                    className="
                        inline-flex
                        h-10
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-[7px]
                        border
                        border-[#dedede]
                        bg-white
                        px-[15px]
                        text-xs
                        font-medium
                        text-[#555]
                        transition
                        hover:bg-[#f5f5f5]
                        sm:w-auto
                    "
                >
                    <Download size={16} />

                    Export
                </button>
            </div>


            {/* ========================================
                RESULT COUNT
            ======================================== */}

            <div
                className="
                    mb-2
                    flex
                    items-center
                    justify-between
                    px-1
                "
            >
                <span className="text-[11px] text-[#999]">
                    Showing {filteredMembers.length} of{" "}
                    {members.length} members
                </span>
            </div>


            {/* ========================================
                TABLE
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

                    <table
                        className="
                            w-full
                            min-w-[850px]
                            border-collapse
                            text-left
                        "
                    >

                        {/* Table Header */}

                        <thead>
                            <tr
                                className="
                                    border-b
                                    border-[#ddd]
                                    bg-[#f8f8f8]
                                "
                            >
                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    MEMBER
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    PHONE
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    PLAN
                                </th>

                                {/* <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    START
                                </th> */}

                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    EXPIRY
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    STATUS
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>


                        {/* Table Body */}

                        <tbody>
                            {filteredMembers.map(
                                (member) => (
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

                                        <td
                                            className="
                                                px-[18px]
                                                py-3.5
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2.5
                                                "
                                            >
                                                <div
                                                    className="
                                                        flex
                                                        h-[38px]
                                                        w-[38px]
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-full
                                                        bg-[#e9edf0]
                                                        text-xs
                                                        font-bold
                                                        text-[#555]
                                                    "
                                                >
                                                    {member.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p
                                                        className="
                                                            truncate
                                                            text-xs
                                                            font-semibold
                                                            text-[#222]
                                                        "
                                                    >
                                                        {member.name}
                                                    </p>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-[10px]
                                                            text-[#999]
                                                        "
                                                    >
                                                        {member.gender}{" "}
                                                        ·{" "}
                                                        {member.timeSlot}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>


                                        {/* Phone */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-[18px]
                                                py-3.5
                                                text-xs
                                                text-[#444]
                                            "
                                        >
                                            {member.phone}
                                        </td>


                                        {/* Plan */}

                                        <td
                                            className="
                                                px-[18px]
                                                py-3.5
                                            "
                                        >
                                            <span
                                                className="
                                                    inline-flex
                                                    whitespace-nowrap
                                                    rounded-full
                                                    bg-[#f3f3f3]
                                                    px-2.5
                                                    py-1.5
                                                    text-[10px]
                                                    font-medium
                                                    text-[#333]
                                                "
                                            >
                                                {member.currentPlan
                                                    ?.name || "—"}
                                            </span>
                                        </td>


                                        {/* Start */}

                                        {/* <td
                                            className="
                                                whitespace-nowrap
                                                px-[18px]
                                                py-3.5
                                                text-xs
                                                text-[#444]
                                            "
                                        >
                                            {formatDate(
                                                member.membershipStart
                                            )}
                                        </td> */}


                                        {/* Expiry */}

                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-[18px]
                                                py-3.5
                                                text-xs
                                                text-[#444]
                                            "
                                        >
                                            {formatDate(
                                                member.membershipEnd
                                            )}
                                        </td>


                                        {/* Status */}

                                        <td
                                            className="
                                                px-[18px]
                                                py-3.5
                                            "
                                        >
                                            <StatusBadge
                                                status={
                                                    member.status
                                                }
                                            />
                                        </td>


                                        {/* Actions */}

                                        <td
                                            className="
                                                px-[18px]
                                                py-3.5
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1
                                                "
                                            >

                                                {/* View */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/members/${member._id}`
                                                        )
                                                    }
                                                    className="
                                                        rounded-md
                                                        border-0
                                                        bg-transparent
                                                        px-2
                                                        py-1.5
                                                        text-xs
                                                        text-[#777]
                                                        transition
                                                        hover:bg-[#f4f4f4]
                                                        hover:text-[#111]
                                                    "
                                                >
                                                    View
                                                </button>


                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/members/${member._id}/edit`
                                                        )
                                                    }
                                                    className="
                                                        rounded-md
                                                        border-0
                                                        bg-transparent
                                                        px-2
                                                        py-1.5
                                                        text-xs
                                                        text-[#777]
                                                        transition
                                                        hover:bg-[#f4f4f4]
                                                        hover:text-[#111]
                                                    "
                                                >
                                                    Edit
                                                </button>


                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteMember(
                                                            member._id
                                                        )
                                                    }
                                                    className="
                                                        rounded-md
                                                        border-0
                                                        bg-transparent
                                                        px-2
                                                        py-1.5
                                                        text-xs
                                                        text-[#df3838]
                                                        transition
                                                        hover:bg-[#fff0f0]
                                                    "
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                )
                            )}


                            {/* Empty State */}

                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="
                                            h-[140px]
                                            px-4
                                            text-center
                                            text-xs
                                            text-[#999]
                                        "
                                    >
                                        No members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>


            {/* ========================================
                MOBILE TABLE HINT
            ======================================== */}

            <p
                className="
                    mt-2
                    text-center
                    text-[10px]
                    text-[#aaa]
                    sm:hidden
                "
            >
                Swipe left/right to view all member details
            </p>

        </div>
    );
}

export default Members;