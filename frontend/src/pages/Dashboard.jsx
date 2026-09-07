import React, { useEffect } from "react";
import {
    Users,
    UserCheck,
    Clock,
    UserX,
    IndianRupee,
    CalendarDays,
    ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import StatCard from "../components/StatCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios, { all } from "axios";
import { mountPlans } from "../store/Slice/Plans.Slice.js";
import { mountMembers } from "../store/Slice/Members.Slice.js";
import { mountPayments } from "../store/Slice/Payment.Slice.js";

const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n || 0);

const date = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "-";

export default function Dashboard() {
    // authentication
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const token = useSelector((state) => state.token.value) || localStorage.getItem(
        "fitIndiaFitness_token"
    );
    if (token === "") navigate("/login")

    //plans
    const plans = useSelector((state) => state.plans.value)
    // console.log(plans)

    // const allplans = async () => {
    //     const res = await axios.get("http://localhost:5000/api/plans", {
    //         headers: {
    //             authorization: `Bearer ${token}`
    //         }
    //     })
    //     // console.log(res.data.plans)

    //     dispatch(mountPlans(res.data.plans))

    // }


    //members
    const members = useSelector((state) => state.members.value)
    // console.log(members)

    // const allmembers = async () => {
    //     const res = await axios.get("http://localhost:5000/api/members", {
    //         headers: {
    //             authorization: `Bearer ${token}`
    //         }
    //     })
    //     // console.log(res.data.members)

    //     dispatch(mountMembers(res.data.members))

    // }

    //payements
    const payments = useSelector((state) => state.payments.value);
    // console.log(payments)

    // const allpayements = async () => {
    //     const res = await axios.get("http://localhost:5000/api/payments", {
    //         headers: {
    //             authorization: `Bearer ${token}`
    //         }
    //     })
    //     // console.log(res.data.payments)

    //     dispatch(mountPayments(res.data.payments))

    // }

    useEffect(() => {
        if (token === "") navigate("/login")
    }, [token])

    // useEffect(() => {
    //     allplans()
    //     allmembers()
    //     allpayements()
    // }, [])

    // Static dashboard data
    const data = {
        stats: {
            total: members.length,
            active: members.filter((member) => member.status === "Active").length,
            expiring: members.filter((member) => member.status === "Expiring").length,
            expired: members.filter((member) => member.status === "Expired").length,
            totalRevenue: payments.reduce((acc, payment) => acc + payment.amount, 0),
            monthlyRevenue: payments
                .filter((payment) => {
                    const paymentDate = new Date(payment.paymentDate);
                    const currentDate = new Date();

                    return (
                        paymentDate.getMonth() === currentDate.getMonth() &&
                        paymentDate.getFullYear() === currentDate.getFullYear()
                    );
                })
                .reduce((acc, payment) => acc + payment.amount, 0),
        },

        upcoming: members.filter((member) => member.status === "Expiring")
    };

    return (
        <div className="w-full">
            {/* ========================================
                PAGE HEADER
            ======================================== */}
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-[25px] font-bold tracking-[-0.7px] text-[#151515] sm:text-[27px]">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                        Here's what's happening in your gym today.
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
                        text-[13px]
                        font-semibold
                        text-[#111]
                        no-underline
                        transition
                        hover:bg-[#f5c800]
                        sm:w-auto
                    "
                >
                    <Users size={17} />
                    Add Member
                </Link>
            </div>

            {/* ========================================
                STATISTICS
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
                <StatCard
                    title="Total Members"
                    value={data.stats.total}
                    // change="8.3%"
                    icon={<Users />}
                />

                <StatCard
                    title="Active Members"
                    value={data.stats.active}
                    // change="5.7%"
                    icon={<UserCheck />}
                />

                <StatCard
                    title="Expiring Soon"
                    value={data.stats.expiring}
                    // change="Next 30 days"
                    icon={<Clock />}
                />

                <StatCard
                    title="Expired"
                    value={data.stats.expired}
                    icon={<UserX />}
                />
            </div>

            {/* ========================================
                REVENUE + UPCOMING RENEWALS
            ======================================== */}
            <div
                className="
                    mb-5
                    grid
                    grid-cols-1
                    gap-5
                    xl:grid-cols-[1.15fr_1fr]
                "
            >
                {/* Revenue Overview */}
                <section
                    className="
                        rounded-[9px]
                        border
                        border-[#e3e3e3]
                        bg-white
                        p-4
                        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                        sm:p-5
                    "
                >
                    {/* Header */}
                    <div className="mb-[18px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                                Revenue Overview
                            </h2>

                            <p className="mt-1 text-[11px] text-[#999]">
                                Total collected from recorded payments
                            </p>
                        </div>

                        <div className="text-lg font-bold text-[#151515] sm:text-xl">
                            {fmt(data.stats.totalRevenue)}
                        </div>
                    </div>

                    {/* Revenue Box */}
                    <div
                        className="
                            flex
                            min-h-[145px]
                            items-center
                            justify-center
                            gap-4
                            rounded-lg
                            border
                            border-[#ffed91]
                            bg-[#fff9db]
                            px-4
                            py-6
                            text-[#c2a200]
                        "
                    >
                        <IndianRupee
                            size={30}
                            className="shrink-0"
                        />

                        <div>
                            <b className="block text-2xl font-bold text-[#111] sm:text-[28px]">
                                {fmt(data.stats.monthlyRevenue)}
                            </b>

                            <span className="mt-1 block text-[11px] text-[#8b8b8b]">
                                This month
                            </span>
                        </div>
                    </div>
                </section>

                {/* Upcoming Renewals */}
                <section
                    className="
                        rounded-[9px]
                        border
                        border-[#e3e3e3]
                        bg-white
                        p-4
                        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                        sm:p-5
                    "
                >
                    {/* Header */}
                    <div className="mb-[18px] flex items-center justify-between gap-3">
                        <div>
                            <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                                Upcoming Renewals
                            </h2>

                            <p className="mt-1 text-[11px] text-[#999]">
                                Members closest to expiry
                            </p>
                        </div>

                        <Link
                            to="/renewals"
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1
                                text-[11px]
                                font-semibold
                                text-[#111]
                                no-underline
                                hover:underline
                            "
                        >
                            <span className="hidden sm:inline">
                                View all
                            </span>

                            <ArrowRight size={15} />
                        </Link>
                    </div>

                    {/* Renewal List */}
                    <div>
                        {data.upcoming.map((member) => (
                            <div
                                key={member._id}
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-2.5
                                    border-t
                                    border-[#eee]
                                    py-[11px]
                                "
                            >
                                {/* Avatar */}
                                <div
                                    className="
                                        flex
                                        h-[34px]
                                        w-[34px]
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
                                    {member.name.charAt(0)}
                                </div>

                                {/* Member Info */}
                                <div className="min-w-0 flex-1">
                                    <b className="block truncate text-xs font-semibold text-[#222]">
                                        {member.name}
                                    </b>

                                    <small className="mt-1 block truncate text-[10px] text-[#999]">
                                        {member.currentPlan?.name ||
                                            "No plan"}
                                    </small>
                                </div>

                                {/* Date */}
                                <div
                                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-1
                                        text-[10px]
                                        text-[#777]
                                        sm:text-[11px]
                                    "
                                >
                                    <CalendarDays
                                        size={14}
                                        className="shrink-0"
                                    />

                                    <span className="hidden sm:inline">
                                        {date(member.membershipEnd)}
                                    </span>

                                    <span className="sm:hidden">
                                        {new Date(
                                            member.membershipEnd
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                            }
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ========================================
                QUICK ACTIONS
            ======================================== */}
            <section
                className="
                    mb-5
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    p-4
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    sm:p-5
                "
            >
                {/* Header */}
                <div className="mb-[18px]">
                    <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-[11px] text-[#999]">
                        Common gym operations
                    </p>
                </div>

                {/* Actions */}
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >
                    <Link
                        to="/members/new"
                        className="
                            rounded-lg
                            border
                            border-[#e5e5e5]
                            bg-[#fcfcfc]
                            p-[17px]
                            text-xs
                            text-[#222]
                            no-underline
                            transition
                            hover:border-[#ffd21a]
                            hover:bg-[#fff8d6]
                        "
                    >
                        + Add Member
                    </Link>

                    <Link
                        to="/payments"
                        className="
                            rounded-lg
                            border
                            border-[#e5e5e5]
                            bg-[#fcfcfc]
                            p-[17px]
                            text-xs
                            text-[#222]
                            no-underline
                            transition
                            hover:border-[#ffd21a]
                            hover:bg-[#fff8d6]
                        "
                    >
                        Record Payment
                    </Link>

                    <Link
                        to="/renewals"
                        className="
                            rounded-lg
                            border
                            border-[#e5e5e5]
                            bg-[#fcfcfc]
                            p-[17px]
                            text-xs
                            text-[#222]
                            no-underline
                            transition
                            hover:border-[#ffd21a]
                            hover:bg-[#fff8d6]
                        "
                    >
                        Renew Membership
                    </Link>

                    <Link
                        to="/members"
                        className="
                            rounded-lg
                            border
                            border-[#e5e5e5]
                            bg-[#fcfcfc]
                            p-[17px]
                            text-xs
                            text-[#222]
                            no-underline
                            transition
                            hover:border-[#ffd21a]
                            hover:bg-[#fff8d6]
                        "
                    >
                        Find Member
                    </Link>
                </div>
            </section>
        </div>
    );
}