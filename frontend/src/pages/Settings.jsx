import React from "react";
import { useSelector } from "react-redux";

export default function Settings() {
    // ========================================
    // STATIC ACCOUNT DATA
    // ========================================
    // const user = {
    //     name: "Manish Yadav",
    //     email: "manish@gmail.com",
    //     role: "Gym Owner",
    // };

    const user = useSelector((state) => state.user.value);

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
                    Settings
                </h1>

                <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                    Basic account and application settings.
                </p>
            </div>

            {/* ========================================
                SETTINGS PANEL
            ======================================== */}
            <div
                className="
                    w-full
                    max-w-[850px]
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    p-5
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    sm:p-6
                "
            >
                {/* ========================================
                    ACCOUNT
                ======================================== */}
                <h2
                    className="
                        mb-2
                        text-[15px]
                        font-semibold
                        text-[#222]
                    "
                >
                    Account
                </h2>

                {/* Owner Name */}
                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        border-b
                        border-[#eee]
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-6
                    "
                >
                    <span className="text-xs text-[#888]">
                        Owner name
                    </span>

                    <b
                        className="
                            break-all
                            text-xs
                            font-semibold
                            text-[#333]
                            sm:text-right
                        "
                    >
                        {user.name}
                    </b>
                </div>

                {/* Email */}
                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        border-b
                        border-[#eee]
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-6
                    "
                >
                    <span className="text-xs text-[#888]">
                        Email
                    </span>

                    <b
                        className="
                            break-all
                            text-xs
                            font-semibold
                            text-[#333]
                            sm:text-right
                        "
                    >
                        {user.email}
                    </b>
                </div>

                {/* Role */}
                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        border-b
                        border-[#eee]
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-6
                    "
                >
                    <span className="text-xs text-[#888]">
                        Role
                    </span>

                    <b
                        className="
                            text-xs
                            font-semibold
                            text-[#333]
                            sm:text-right
                        "
                    >
                        {user.role}
                    </b>
                </div>

                {/* ========================================
                    GYM SETUP
                ======================================== */}
                <h2
                    className="
                        mb-2
                        mt-8
                        text-[15px]
                        font-semibold
                        text-[#222]
                    "
                >
                    Gym setup
                </h2>

                {/* Currency */}
                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        border-b
                        border-[#eee]
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-6
                    "
                >
                    <span className="text-xs text-[#888]">
                        Currency
                    </span>

                    <b
                        className="
                            text-xs
                            font-semibold
                            text-[#333]
                            sm:text-right
                        "
                    >
                        Indian Rupee (₹)
                    </b>
                </div>

                {/* Membership Reminders */}
                <div
                    className="
                        flex
                        flex-col
                        gap-1
                        py-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:gap-6
                    "
                >
                    <span className="text-xs text-[#888]">
                        Membership reminders
                    </span>

                    <b
                        className="
                            text-xs
                            font-semibold
                            text-[#333]
                            sm:text-right
                        "
                    >
                        Expiring within 30 days
                    </b>
                </div>
            </div>
        </div>
    );
}