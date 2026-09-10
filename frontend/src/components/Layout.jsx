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
    Dumbbell,
    FileBarChart,
    Settings,
    LogOut,
    ChevronDown,
    Menu,
    X,
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
    ["/trainers", "Trainers", Dumbbell],
    ["/plans", "Membership Plans", FileBarChart],
    ["/personal-training-plans", "Personal Training Plans", Dumbbell],
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
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
                            Fit India Fitness
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

                </div>

                <div className="flex items-center gap-2">
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

                    <button
                        type="button"
                        onClick={() => {
                            logout();
                            nav("/login");
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition hover:bg-[#fff0f0] hover:text-[#d22d2d]"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileNavOpen((open) => !open)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#666] transition hover:bg-[#f5f5f5]"
                        aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileNavOpen}
                        aria-controls="mobile-navigation"
                    >
                        {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav
                    id="mobile-navigation"
                    aria-label="Quick links"
                    aria-hidden={!mobileNavOpen}
                    className={`absolute left-0 right-0 top-[62px] flex flex-col gap-1 border-b border-[#e8e8e8] bg-white p-2 shadow-[0_8px_16px_rgba(0,0,0,0.08)] transition-[max-height,opacity] duration-300 ease-out lg:hidden ${mobileNavOpen ? "max-h-[calc(100vh-62px)] overflow-y-auto opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0"}`}
                >
                    {links.map(([to, label, Icon]) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/"}
                            tabIndex={mobileNavOpen ? 0 : -1}
                            onClick={() => setMobileNavOpen(false)}
                            className={({ isActive }) => `flex min-h-9 w-full shrink-0 items-center gap-2 rounded-[6px] px-3 py-2 text-[11px] font-medium ${isActive ? "bg-[#fff4b8] text-[#806900]" : "text-[#666] hover:bg-[#f7f7f7]"}`}
                        >
                            <Icon size={14} />
                            {label === "Membership Plans" ? "Plans" : label}
                        </NavLink>
                    ))}
                </nav>
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
                    {/* User Box */}
                    <div
                        className="
                            hidden
                            flex
                            items-center
                            gap-2.5
                            rounded-[8px]
                            px-2
                            py-1.5
                            lg:flex
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
    className={`
        min-h-[calc(100vh-62px)]
        w-full
        px-4
        pb-8
        pt-[62px]
        sm:px-5
        md:px-6
        lg:px-7
        lg:pt-6
    `}
>
    <Outlet />
</main>
            </div>
        </div>
    );
}