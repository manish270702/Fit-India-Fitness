import {
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import {
    LayoutDashboard,
    Users,
    RefreshCcw,
    CreditCard,
    FileBarChart,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unMountToken } from "../store/Slice/Token.Slice";
import { unMountUser } from "../store/Slice/User.Slice";

// import { useAuth } from "../context/AuthContext.jsx";

const links = [
    ["/", "Dashboard", LayoutDashboard],
    ["/members", "Members", Users],
    ["/renewals", "Renewals", RefreshCcw],
    ["/payments", "Payments", CreditCard],
    // ["/trainers", "Trainers", Dumbbell],
    ["/plans", "Membership Plans", FileBarChart],
    ["/reports", "Reports", FileBarChart],
    ["/settings", "Settings", Settings],
];

export default function Layout() {
    // const { user, logout } = useAuth();
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("fitgym_user");
        dispatch(unMountToken());
        dispatch(unMountUser());
    }
    const nav = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.value);

    return (
        <div
            className="
                flex
                min-h-screen
                w-full
                bg-[#f8f8f7]
                text-[#151515]
            "
        >
            {/* ========================================
                SIDEBAR
            ======================================== */}
            <aside
                className="
                    fixed
                    inset-y-0
                    left-0
                    z-40
                    hidden
                    w-[235px]
                    flex-col
                    border-r
                    border-[#e8e8e8]
                    bg-white
                    lg:flex
                "
            >
                {/* Brand */}
                <div
                    className="
                        flex
                        h-[72px]
                        items-center
                        gap-3
                        border-b
                        border-[#eee]
                        px-5
                    "
                >
                    <div
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#ffd21a]
                            text-[18px]
                            font-bold
                            text-[#151515]
                        "
                    >
                        F
                    </div>

                    <div className="flex flex-col">
                        <b className="text-[15px] leading-tight text-[#151515]">
                            FitGym
                        </b>

                        <small className="mt-0.5 text-[9px] text-[#999]">
                            Management
                        </small>
                    </div>
                </div>

                {/* Menu Label */}
                <div className="px-5 pb-2 pt-6">
                    <span
                        className="
                            text-[9px]
                            font-semibold
                            tracking-[0.8px]
                            text-[#aaa]
                        "
                    >
                        MAIN MENU
                    </span>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col gap-1 px-3">
                    {links.map(([to, label, Icon]) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            className={({ isActive }) =>
                                `
                                group
                                flex
                                h-10
                                items-center
                                gap-3
                                rounded-[7px]
                                px-3
                                text-xs
                                font-medium
                                transition
                                ${
                                    isActive
                                        ? "bg-[#fff4b8] text-[#806900]"
                                        : "text-[#666] hover:bg-[#f7f7f7] hover:text-[#222]"
                                }
                                `
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon
                                        size={18}
                                        strokeWidth={
                                            isActive ? 2.2 : 1.8
                                        }
                                        className="shrink-0"
                                    />

                                    <span className="truncate">
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom / Logout */}
                <div className="border-t border-[#eee] p-3">
                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            nav("/login");
                        }}
                        className="
                            flex
                            h-10
                            w-full
                            items-center
                            gap-3
                            rounded-[7px]
                            px-3
                            text-xs
                            font-medium
                            text-[#777]
                            transition
                            hover:bg-[#fff0f0]
                            hover:text-[#d22d2d]
                        "
                    >
                        <LogOut
                            size={18}
                            className="shrink-0"
                        />

                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ========================================
                MOBILE HEADER
            ======================================== */}
            <header
                className="
                    fixed
                    left-0
                    right-0
                    top-0
                    z-30
                    flex
                    h-[62px]
                    items-center
                    justify-between
                    border-b
                    border-[#e8e8e8]
                    bg-white
                    px-4
                    lg:hidden
                "
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-[7px]
                            bg-[#ffd21a]
                            text-[16px]
                            font-bold
                        "
                    >
                        F
                    </div>

                    <b className="text-[15px]">
                        FitGym
                    </b>
                </div>

                <div className="flex items-center gap-2">
                            <Notifications />

                    <span className="max-w-[90px] truncate text-[11px] font-medium text-[#555]">
                        {user?.name || "Admin"}
                    </span>

                    {/* Avatar */}
                    <div
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-[#fff4b8]
                            text-xs
                            font-semibold
                            text-[#806900]
                        "
                    >
                        {user?.name?.[0]?.toUpperCase() || "A"}
                    </div>

                    <nav className="absolute left-0 right-0 top-[62px] flex h-12 items-center gap-1 overflow-x-auto border-b border-[#e8e8e8] bg-white px-3 lg:hidden">
                        {links.map(([to, label, Icon]) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) => `flex shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 py-2 text-[10px] font-medium ${isActive ? "bg-[#fff4b8] text-[#806900]" : "text-[#666]"}`}
                            >
                                <Icon size={14} />
                                {label === "Membership Plans" ? "Plans" : label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            {/* ========================================
                MAIN CONTENT AREA
            ======================================== */}
            <div
                className="
                    flex
                    min-h-screen
                    w-full
                    flex-col
                    lg:ml-[235px]
                    lg:w-[calc(100%-235px)]
                "
            >
                {/* ========================================
                    DESKTOP TOPBAR
                ======================================== */}
                <header
                    className="
                        hidden
                        h-[62px]
                        items-center
                        justify-end
                        gap-4
                        border-b
                        border-[#e8e8e8]
                        bg-white
                        px-6
                        lg:flex
                    "
                >
                    <Notifications />

                    {/* User Box */}
                    <div
                        className="
                            flex
                            items-center
                            gap-2.5
                            rounded-[8px]
                            px-2
                            py-1.5
                        "
                    >
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
                                text-[#806900]
                            "
                        >
                            {user?.name?.[0]?.toUpperCase() || "A"}
                        </div>

                        {/* User Details */}
                        <div className="flex min-w-0 flex-col">
                            <b className="max-w-[160px] truncate text-xs font-semibold text-[#333]">
                                {user?.name || "Admin"}
                            </b>

                            <small className="mt-0.5 text-[10px] text-[#999]">
                                {user?.role || "owner"}
                            </small>
                        </div>

                        <ChevronDown
                            size={15}
                            className="shrink-0 text-[#999]"
                        />
                    </div>
                </header>

                {/* ========================================
                    PAGE CONTENT
                ======================================== */}
                <main
    className="
        min-h-[calc(100vh-62px)]
        w-full
        px-4
        pb-8
        pt-[122px]
        sm:px-5
        md:px-6
        lg:px-7
        lg:pt-6
    "
>
    <Outlet />
</main>
            </div>
        </div>
    );
}

function Notifications() {
    const [open, setOpen] = useState(false);
    const members = useSelector((state) => state.members.value);
    const payments = useSelector((state) => state.payments.value);
    const expiring = members.filter((member) => member.status === "Expiring").length;
    const expired = members.filter((member) => member.status === "Expired").length;
    const notifications = [
        ...(expired ? [{ text: `${expired} membership${expired > 1 ? "s" : ""} expired`, to: "/renewals" }] : []),
        ...(expiring ? [{ text: `${expiring} membership${expiring > 1 ? "s" : ""} expiring soon`, to: "/renewals" }] : []),
        ...(payments.length ? [{ text: "Payment activity has been recorded", to: "/payments" }] : []),
    ];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition hover:bg-[#f5f5f5]"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute right-[5px] top-[4px] flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d22d2d] px-1 text-[9px] font-semibold text-white">
                        {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 z-50 w-[260px] rounded-[8px] border border-[#e3e3e3] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                    <div className="border-b border-[#eee] px-2 pb-2 text-xs font-semibold text-[#222]">
                        Notifications
                    </div>
                    {notifications.length ? notifications.map((notification) => (
                        <NavLink
                            key={notification.text}
                            to={notification.to}
                            onClick={() => setOpen(false)}
                            className="block border-b border-[#f1f1f1] px-2 py-2.5 text-[11px] text-[#555] last:border-b-0 hover:bg-[#fff9db]"
                        >
                            {notification.text}
                        </NavLink>
                    )) : (
                        <p className="px-2 py-3 text-[11px] text-[#888]">No new notifications.</p>
                    )}
                </div>
            )}
        </div>
    );
}