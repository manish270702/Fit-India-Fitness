import React, { useState } from "react";
import { CreditCard, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";

import Modal from "../components/Modal.jsx";
import { useSelector } from "react-redux";

const money = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n || 0);

const formatDate = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : "—";

export default function Payments() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    // ========================================
    // STATIC MEMBERS
    // ========================================
    // const members = [
    //     {
    //         id: "1",
    //         name: "Manish Yadav",
    //         phone: "9876543210",
    //     },
    //     {
    //         id: "2",
    //         name: "Rahul Sharma",
    //         phone: "9876543211",
    //     },
    //     {
    //         id: "3",
    //         name: "Priya Singh",
    //         phone: "9876543212",
    //     },
    //     {
    //         id: "4",
    //         name: "Amit Verma",
    //         phone: "9876543213",
    //     },
    //     {
    //         id: "5",
    //         name: "Neha Sharma",
    //         phone: "9876543214",
    //     },
    // ];

    const members = useSelector((state) => state.members.value);


    const payments = useSelector((state) => state.payments.value);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            member: "",
            amount: "",
            method: "Cash",
            transactionId: "",
            note: "",
        },
    });

    // ========================================
    // SEARCH
    // ========================================
    const filteredPayments = payments.filter((payment) => {
        const value = search.toLowerCase();

        return (
            payment.member?.name
                ?.toLowerCase()
                .includes(value) ||
            payment.member?.phone?.includes(value)
        );
    });

    // ========================================
    // TOTAL
    // ========================================
    const total = filteredPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
    );

    // ========================================
    // SAVE PAYMENT
    // ========================================
    const onSubmit = async (data) => {
        const selectedMember = members.find(
            (member) => member.id === data.member
        );

        const newPayment = {
            id: Date.now().toString(),

            paymentDate: new Date()
                .toISOString()
                .slice(0, 10),

            member: {
                name: selectedMember?.name || "Unknown",
                phone: selectedMember?.phone || "",
            },

            plan: {
                name: "Manual Payment",
            },

            method: data.method,

            transactionId: data.transactionId,

            amount: Number(data.amount),

            note: data.note,
        };

        await new Promise((resolve) =>
            setTimeout(resolve, 500)
        );

        setPayments((prev) => [
            newPayment,
            ...prev,
        ]);

        // console.log("Payment Data:", data);

        reset();
        setOpen(false);

        alert("Payment recorded successfully!");
    };

    return (
        <div className="w-full">
            {/* ========================================
                PAGE HEADER
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
                        Payments
                    </h1>

                    <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                        Track every cash, UPI, bank and card payment.
                    </p>
                </div>

                <button
                    onClick={() => setOpen(true)}
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
                        transition
                        hover:bg-[#f5c800]
                        sm:w-auto
                    "
                >
                    <Plus size={18} />
                    Record Payment
                </button>
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
                "
            >
                {/* Displayed Payments */}
                <div
                    className="
                        min-h-[115px]
                        rounded-[9px]
                        border
                        border-[#e4e4e4]
                        bg-white
                        p-5
                        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    "
                >
                    <span className="block text-[11px] text-[#888]">
                        Displayed Payments
                    </span>

                    <b className="mt-2 block text-[25px] font-bold text-[#151515]">
                        {filteredPayments.length}
                    </b>
                </div>

                {/* Displayed Total */}
                <div
                    className="
                        min-h-[115px]
                        rounded-[9px]
                        border
                        border-[#e4e4e4]
                        bg-white
                        p-5
                        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    "
                >
                    <span className="block text-[11px] text-[#888]">
                        Displayed Total
                    </span>

                    <b className="mt-2 block text-[25px] font-bold text-[#151515]">
                        {money(total)}
                    </b>
                </div>
            </div>

            {/* ========================================
                SEARCH
            ======================================== */}
            <div className="mb-[18px]">
                <div className="relative w-full max-w-[400px]">
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
                PAYMENT TABLE
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
                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    DATE
                                </th>

                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    MEMBER
                                </th>

                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    PLAN
                                </th>

                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    METHOD
                                </th>

                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    TRANSACTION
                                </th>

                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">
                                    AMOUNT
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="
                                        border-b
                                        border-[#eee]
                                        transition
                                        last:border-b-0
                                        hover:bg-[#fcfcfc]
                                    "
                                >
                                    {/* Date */}
                                    <td className="px-[18px] py-4 text-xs text-[#444]">
                                        {formatDate(
                                            payment.paymentDate
                                        )}
                                    </td>

                                    {/* Member */}
                                    <td className="px-[18px] py-4">
                                        <b className="block text-xs font-semibold text-[#222]">
                                            {payment.member?.name}
                                        </b>

                                        <small className="mt-1 block text-[10px] text-[#999]">
                                            {payment.member?.phone}
                                        </small>
                                    </td>

                                    {/* Plan */}
                                    <td className="px-[18px] py-4 text-xs text-[#444]">
                                        {payment.plan?.name || "—"}
                                    </td>

                                    {/* Method */}
                                    <td className="px-[18px] py-4">
                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                whitespace-nowrap
                                                text-xs
                                                text-[#555]
                                            "
                                        >
                                            <CreditCard
                                                size={14}
                                                className="text-[#888]"
                                            />

                                            {payment.method}
                                        </span>
                                    </td>

                                    {/* Transaction */}
                                    <td className="px-[18px] py-4 text-xs text-[#555]">
                                        {payment.transactionId || "—"}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-[18px] py-4 text-xs text-[#222]">
                                        <b className="font-semibold">
                                            {money(payment.amount)}
                                        </b>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty State */}
                            {!filteredPayments.length && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="
                                            h-[130px]
                                            px-4
                                            text-center
                                            text-xs
                                            text-[#999]
                                        "
                                    >
                                        No payments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Hint */}
            <p className="mt-2 text-center text-[10px] text-[#aaa] sm:hidden">
                Swipe left/right to view payment details
            </p>

            {/* ========================================
                RECORD PAYMENT MODAL
            ======================================== */}
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Record Payment"
            >
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-4"
                >
                    {/* Member */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Member
                        </label>

                        <select
                            {...register("member", {
                                required:
                                    "Please select a member",
                            })}
                            className={inputClass(
                                errors.member
                            )}
                        >
                            <option value="">
                                Select member
                            </option>

                            {members.map((member) => (
                                <option
                                    key={member.id}
                                    value={member.id}
                                >
                                    {member.name} — {member.phone}
                                </option>
                            ))}
                        </select>

                        {errors.member && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.member.message}
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Amount
                        </label>

                        <input
                            type="number"
                            min="1"
                            placeholder="Enter amount"
                            {...register("amount", {
                                required:
                                    "Amount is required",
                                min: {
                                    value: 1,
                                    message:
                                        "Amount must be greater than 0",
                                },
                            })}
                            className={inputClass(
                                errors.amount
                            )}
                        />

                        {errors.amount && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Payment Method
                        </label>

                        <select
                            {...register("method")}
                            className={inputClass()}
                        >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">
                                Bank Transfer
                            </option>
                            <option value="Card">Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Transaction ID */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Transaction ID
                        </label>

                        <input
                            type="text"
                            placeholder="Enter transaction ID"
                            {...register("transactionId")}
                            className={inputClass()}
                        />
                    </div>

                    {/* Note */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Note
                        </label>

                        <textarea
                            placeholder="Add payment note..."
                            {...register("note")}
                            className="
                                min-h-[85px]
                                w-full
                                resize-y
                                rounded-[7px]
                                border
                                border-[#ddd]
                                bg-white
                                p-3
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

                    {/* Buttons */}
                    <div
                        className="
                            mt-2
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-[#eee]
                            pt-4
                            sm:flex-row
                            sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="
                                inline-flex
                                h-10
                                w-full
                                items-center
                                justify-center
                                rounded-[7px]
                                border
                                border-[#dedede]
                                bg-white
                                px-[15px]
                                text-xs
                                text-[#555]
                                transition
                                hover:bg-[#f5f5f5]
                                sm:w-auto
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                inline-flex
                                h-10
                                w-full
                                items-center
                                justify-center
                                rounded-[7px]
                                border
                                border-[#ffd21a]
                                bg-[#ffd21a]
                                px-[15px]
                                text-xs
                                font-semibold
                                text-[#111]
                                transition
                                hover:bg-[#f5c800]
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                                sm:w-auto
                            "
                        >
                            {isSubmitting
                                ? "Saving..."
                                : "Save Payment"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/* ========================================
   INPUT CLASS
======================================== */

function inputClass(hasError = false) {
    return `
        h-10
        w-full
        rounded-[7px]
        border
        ${hasError ? "border-red-300" : "border-[#ddd]"}
        bg-white
        px-3
        text-xs
        text-[#444]
        outline-none
        transition
        placeholder:text-[#aaa]
        focus:border-[#c9aa00]
        focus:ring-2
        focus:ring-[#fff3a8]
    `;
}