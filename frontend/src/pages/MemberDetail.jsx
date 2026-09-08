import axios from "axios";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    Phone,
    MapPin,
    CalendarDays,
    RefreshCcw,
} from "lucide-react";
import { useForm } from "react-hook-form";

import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import { useDispatch, useSelector } from "react-redux";
import { AddPayment } from "../store/Slice/Payment.Slice";
import { UpdateMember } from "../store/Slice/Members.Slice";

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

export default function MemberDetail() {
    const { id } = useParams();
    const nav = useNavigate();

    const [renew, setRenew] = useState(false);

    // Static member data
    const members = useSelector((state) => state.members.value)
    const member = members.find((m) => m._id === id)
    // Static payment history
    const allPayments = useSelector((state) => state.payments.value);

    const payments = allPayments.filter(
        (p) => p.member?._id?.toString() === id
    );


    const plans = useSelector((state) => state.plans.value);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            planId: "",
            amount: "",
            method: "Cash",
            transactionId: "",
        },
    });

    // Renew form submit
    const token = useSelector((state) => state.token.value);
    const dispatch = useDispatch();

    if (!member) {
        return (
            <div className="flex min-h-[240px] items-center justify-center text-sm text-[#777]">
                Loading member details...
            </div>
        );
    }

    const onRenew = async (data) => {
        try {
            const res = await axios.post(
                `http://localhost:5000/api/members/${id}/renew`,
                {
                    planId: data.planId,
                    amount: Number(data.amount),
                    method: data.method,
                    transactionId: data.transactionId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Renewal successful:", res.data);

            // Update Redux member
            dispatch(UpdateMember(res.data.member));
            if (res.data.payment) {
                dispatch(AddPayment(res.data.payment));
            }

            // Close modal
            setRenew(false);

            // Reset form
            reset();

            alert("Membership renewed successfully");

        } catch (error) {
            console.error(
                "Renewal error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to renew membership"
            );
        }
    };

    return (
        <div className="w-full">
            {/* ========================================
                BACK BUTTON
            ======================================== */}
            <button
                onClick={() => nav("/members")}
                className="
                    mb-4
                    flex
                    items-center
                    gap-1.5
                    border-0
                    bg-transparent
                    p-0
                    text-xs
                    text-[#777]
                    transition
                    hover:text-[#111]
                "
            >
                <ArrowLeft size={16} />
                Members
            </button>

            {/* ========================================
                MEMBER HEADER
            ======================================== */}
            <div
                className="
                    mb-5
                    flex
                    flex-col
                    items-start
                    justify-between
                    gap-4
                    lg:flex-row
                    lg:items-center
                "
            >
                {/* Member */}
                <div className="flex min-w-0 items-center gap-3.5">
                    <div
                        className="
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#e9edf0]
                            text-xl
                            font-bold
                            text-[#555]
                            sm:h-[55px]
                            sm:w-[55px]
                        "
                    >
                        {member.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                        <h1
                            className="
                                truncate
                                text-[22px]
                                font-bold
                                tracking-[-0.5px]
                                text-[#151515]
                                sm:text-2xl
                            "
                        >
                            {member.name}
                        </h1>

                        <p className="mt-1 text-xs text-[#888]">
                            {member.phone} · {member.gender}
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex w-full gap-2 sm:w-auto">
                    <button
                        onClick={() =>
                            nav(`/members/${member._id}/edit`)
                        }
                        className="
                            inline-flex
                            h-10
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-[7px]
                            border
                            border-[#dedede]
                            bg-white
                            px-[15px]
                            text-xs
                            text-[#555]
                            transition
                            hover:bg-[#f5f5f5]
                            sm:flex-none
                        "
                    >
                        <Edit size={16} />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            reset({
                                planId: member.currentPlan?._id || "",
                                amount: member.currentPlan?.price || "",
                                method: "Cash",
                                transactionId: "",
                            });

                            setRenew(true);
                        }}
                        className="
                            inline-flex
                            h-10
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
    "
                    >
                        <RefreshCcw size={16} />
                        Renew
                    </button>
                </div>
            </div>

            {/* ========================================
                MEMBERSHIP + MEMBER DETAILS
            ======================================== */}
            <div
                className="
                    mb-5
                    grid
                    grid-cols-1
                    gap-5
                    xl:grid-cols-[1.2fr_1fr]
                "
            >
                {/* Current Membership */}
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
                    <div
                        className="
                            mb-[18px]
                            flex
                            flex-col
                            items-start
                            justify-between
                            gap-3
                            sm:flex-row
                            sm:items-center
                        "
                    >
                        <div>
                            <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                                Current Membership
                            </h2>

                            <p className="mt-1 text-[11px] text-[#999]">
                                Plan and validity information
                            </p>
                        </div>

                        <StatusBadge status={member.status} />
                    </div>

                    {/* Information Grid */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >
                        <Info
                            label="Plan"
                            value={
                                member.currentPlan?.name ||
                                "No plan"
                            }
                        />

                        <Info
                            label="Price"
                            value={money(
                                member.currentPlan?.price
                            )}
                        />

                        <Info
                            label="Start Date"
                            value={formatDate(
                                member.membershipStart
                            )}
                        />

                        <Info
                            label="Expiry Date"
                            value={formatDate(
                                member.membershipEnd
                            )}
                        />
                    </div>
                </section>

                {/* Member Details */}
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
                    <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                        Member Details
                    </h2>

                    <div className="mt-4">
                        <p className="flex items-start gap-2 text-xs text-[#555]">
                            <Phone
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <span>{member.phone}</span>
                        </p>

                        <p className="mt-4 flex items-start gap-2 text-xs text-[#555]">
                            <MapPin
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <span>
                                {member.address ||
                                    "Address not added"}
                            </span>
                        </p>

                        <p className="mt-4 flex items-start gap-2 text-xs text-[#555]">
                            <CalendarDays
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <span>
                                Joined{" "}
                                {formatDate(member.joiningDate)}
                            </span>
                        </p>
                    </div>
                </section>
            </div>

            {/* ========================================
                PAYMENT HISTORY
            ======================================== */}
            <section
                className="
                    mb-5
                    overflow-hidden
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                "
            >
                {/* Header */}
                <div className="p-4 sm:p-5">
                    <h2 className="m-0 text-[15px] font-semibold text-[#151515]">
                        Payment History
                    </h2>

                    <p className="mt-1 text-[11px] text-[#999]">
                        All payments for this member
                    </p>
                </div>

                {/* Responsive Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse">
                        <thead>
                            <tr>
                                <th
                                    className="
                                        h-[46px]
                                        border-b
                                        border-[#ddd]
                                        bg-[#f8f8f8]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    DATE
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        border-b
                                        border-[#ddd]
                                        bg-[#f8f8f8]
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

                                <th
                                    className="
                                        h-[46px]
                                        border-b
                                        border-[#ddd]
                                        bg-[#f8f8f8]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    METHOD
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        border-b
                                        border-[#ddd]
                                        bg-[#f8f8f8]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    TRANSACTION
                                </th>

                                <th
                                    className="
                                        h-[46px]
                                        border-b
                                        border-[#ddd]
                                        bg-[#f8f8f8]
                                        px-[18px]
                                        text-left
                                        text-[10px]
                                        font-semibold
                                        tracking-[0.4px]
                                        text-[#777]
                                    "
                                >
                                    AMOUNT
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((payment) => (
                                <tr
                                    key={payment._id}
                                    className="transition hover:bg-[#fcfcfc]"
                                >
                                    <td className="h-[62px] border-b border-[#eee] px-[18px] text-xs text-[#444]">
                                        {formatDate(
                                            payment.paymentDate
                                        )}
                                    </td>

                                    <td className="h-[62px] border-b border-[#eee] px-[18px] text-xs text-[#444]">
                                        {payment.plan?.name || "—"}
                                    </td>

                                    <td className="h-[62px] border-b border-[#eee] px-[18px] text-xs text-[#444]">
                                        {payment.method}
                                    </td>

                                    <td className="h-[62px] border-b border-[#eee] px-[18px] text-xs text-[#444]">
                                        {payment.transactionId ||
                                            "—"}
                                    </td>

                                    <td className="h-[62px] border-b border-[#eee] px-[18px] text-xs text-[#444]">
                                        <b className="font-semibold text-[#222]">
                                            {money(payment.amount)}
                                        </b>
                                    </td>
                                </tr>
                            ))}

                            {!payments.length && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="
                                            h-[120px]
                                            text-center
                                            text-xs
                                            text-[#999]
                                        "
                                    >
                                        No payments recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ========================================
                RENEW MODAL
            ======================================== */}
            <Modal
                open={renew}
                onClose={() => setRenew(false)}
                title="Renew Membership"
            >
                <form
                    onSubmit={handleSubmit(onRenew)}
                    className="flex flex-col gap-4"
                >
                    {/* Plan */}
                    <div>
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Plan
                        </label>

                        <select
                            {...register("planId", {
                                required:
                                    "Please select a plan",
                            })}
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
                            "
                        >
                            <option value="">
                                Select plan
                            </option>

                            {plans.map((plan) => (
                                <option
                                    key={plan._id}
                                    value={plan._id}
                                >
                                    {plan.name} — ₹{plan.price}
                                </option>
                            ))}
                        </select>

                        {errors.planId && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.planId.message}
                            </p>
                        )}
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Amount
                        </label>

                        <input
                            type="number"
                            min="0"
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
                            "
                        />

                        {errors.amount && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.amount.message}
                            </p>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Payment Method
                        </label>

                        <select
                            {...register("method")}
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
                            "
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
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Transaction ID
                        </label>

                        <input
                            type="text"
                            placeholder="Enter transaction ID"
                            {...register("transactionId")}
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
                            sm:flex-row
                            sm:justify-end
                        "
                    >
                        <button
                            type="button"
                            onClick={() => setRenew(false)}
                            className="
                                inline-flex
                                h-10
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
                            "
                        >
                            {isSubmitting
                                ? "Processing..."
                                : "Renew & Record Payment"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}


function Info({ label, value }) {
    return (
        <div
            className="
                rounded-[7px]
                border
                border-[#eee]
                p-3.5
            "
        >
            <span className="mb-1.5 block text-[10px] text-[#999]">
                {label}
            </span>

            <b className="block break-words text-[13px] font-semibold text-[#222]">
                {value}
            </b>
        </div>
    );
}