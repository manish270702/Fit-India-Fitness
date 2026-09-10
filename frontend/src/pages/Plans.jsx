import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";

import Modal from "../components/Modal.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { AddPlan, RemovePlan, UpdatePlan } from "../store/Slice/Plans.Slice.js";

const money = (n) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(n || 0);

export default  function Plans() {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const plans = useSelector((state) => state.plans.value);
    const token = useSelector((state) => state.token.value);
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            durationMonths: 1,
            price: "",
            personalTrainingPrice: "",
            description: "",
            active: true,
        },
    });

    // ========================================
    // OPEN ADD MODAL
    // ========================================
    const openAddModal = () => {
        setEdit(null);

        reset({
            name: "",
            durationMonths: 1,
            price: "",
            personalTrainingPrice: "",
            description: "",
            active: true,
        });

        setOpen(true);
    };

    // ========================================
    // OPEN EDIT MODAL
    // ========================================
    const startEdit = (plan) => {
        setEdit(plan);

        reset({
            name: plan.name,
            durationMonths: plan.durationMonths,
            price: plan.price,
            personalTrainingPrice: plan.personalTrainingPrice || 0,
            description: plan.description || "",
            active: plan.active,
        });

        setOpen(true);
    };

    // ========================================
    // SAVE / UPDATE PLAN
    // ========================================
    const save = async (data) => {
        const planData = {
            ...data,
            durationMonths: Number(data.durationMonths),
            price: Number(data.price),
            personalTrainingPrice: Number(data.personalTrainingPrice) || 0,
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = edit
                ? await axios.put(`http://localhost:5000/api/plans/${edit._id}`, planData, config)
                : await axios.post("http://localhost:5000/api/plans", planData, config);

            if (edit) dispatch(UpdatePlan(response.data.plan));
            else dispatch(AddPlan(response.data.plan));

            setOpen(false);
            setEdit(null);
            reset();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save plan");
        }
    };

    // ========================================
    // DELETE PLAN
    // ========================================
    const remove = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this plan?"
        );

        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(RemovePlan(id));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete plan");
        }
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
                        Membership Plans
                    </h1>

                    <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                        Configure the packages your gym sells.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
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
                    Add Plan
                </button>
            </div>

            <div className="mb-5 flex w-full max-w-fit items-center gap-1 rounded-[8px] border border-[#e3e3e3] bg-white p-1">
                <span className="rounded-[6px] bg-[#fff4b8] px-3 py-2 text-[11px] font-semibold text-[#806900]">
                    Gym Membership Plans
                </span>
                <Link
                    to="/personal-training-plans"
                    className="rounded-[6px] px-3 py-2 text-[11px] font-medium text-[#777] no-underline transition hover:bg-[#f7f7f7] hover:text-[#222]"
                >
                    Personal Training Plans
                </Link>
            </div>

            {/* ========================================
                PLANS GRID
            ======================================== */}
            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                "
            >
                {plans.map((plan) => (
                    <div
                        key={plan._id}
                        className="
                            flex
                            min-h-[260px]
                            flex-col
                            rounded-[9px]
                            border
                            border-[#e3e3e3]
                            bg-white
                            p-5
                            shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                            transition
                            hover:-translate-y-0.5
                            hover:shadow-md
                        "
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between gap-3">
                            <span
                                className="
                                    truncate
                                    text-[15px]
                                    font-semibold
                                    text-[#222]
                                "
                            >
                                {plan.name}
                            </span>

                            <button
                                type="button"
                                onClick={() => startEdit(plan)}
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-md
                                    text-[#777]
                                    transition
                                    hover:bg-[#fff8d6]
                                    hover:text-[#151515]
                                "
                                aria-label={`Edit ${plan.name}`}
                            >
                                <Edit size={16} />
                            </button>
                        </div>

                        {/* Price */}
                        <div className="mt-5 flex items-baseline gap-1">
                            <span
                                className="
                                    text-[27px]
                                    font-bold
                                    tracking-[-0.7px]
                                    text-[#151515]
                                "
                            >
                                {money(plan.price)}
                            </span>

                            <small className="text-[10px] text-[#999]">
                                / {plan.durationMonths} month
                                {plan.durationMonths > 1 ? "s" : ""}
                            </small>
                        </div>

                        <p className="mt-2 text-[11px] text-[#777]">
                            Personal training: {money(plan.personalTrainingPrice)} for this plan period
                        </p>

                        {/* Description */}
                        <p
                            className="
                                mt-4
                                flex-1
                                text-xs
                                leading-5
                                text-[#777]
                            "
                        >
                            {plan.description ||
                                "Gym membership plan"}
                        </p>

                        {/* Divider */}
                        <div className="my-4 border-t border-[#eee]" />

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3">
                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    text-[11px]
                                    font-medium
                                    ${
                                        plan.active
                                            ? "text-[#0fa982]"
                                            : "text-[#999]"
                                    }
                                `}
                            >
                                <span
                                    className={`
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        ${
                                            plan.active
                                                ? "bg-[#0fa982]"
                                                : "bg-[#aaa]"
                                        }
                                    `}
                                />

                                {plan.active
                                    ? "Active"
                                    : "Inactive"}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    remove(plan.id)
                                }
                                className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-md
                                    text-[#d22d2d]
                                    transition
                                    hover:bg-[#ffecec]
                                "
                                aria-label={`Delete ${plan.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {!plans.length && (
                <div
                    className="
                        rounded-[9px]
                        border
                        border-[#e3e3e3]
                        bg-white
                        px-5
                        py-16
                        text-center
                    "
                >
                    <p className="text-sm font-medium text-[#555]">
                        No membership plans available.
                    </p>

                    <p className="mt-1 text-xs text-[#999]">
                        Add a plan to get started.
                    </p>
                </div>
            )}

            {/* ========================================
                ADD / EDIT MODAL
            ======================================== */}
            <Modal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setEdit(null);
                    reset();
                }}
                title={
                    edit
                        ? "Edit Plan"
                        : "Add Membership Plan"
                }
            >
                <form
                    onSubmit={handleSubmit(save)}
                    className="flex flex-col gap-4"
                >
                    {/* Plan Name */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Plan Name
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Monthly"
                            {...register("name", {
                                required:
                                    "Plan name is required",
                            })}
                            className={inputClass(
                                errors.name
                            )}
                        />

                        {errors.name && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Duration + Price */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        "
                    >
                        {/* Duration */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                                Duration (months)
                            </label>

                            <input
                                type="number"
                                min="1"
                                {...register(
                                    "durationMonths",
                                    {
                                        required:
                                            "Duration is required",
                                        min: {
                                            value: 1,
                                            message:
                                                "Duration must be at least 1 month",
                                        },
                                    }
                                )}
                                className={inputClass(
                                    errors.durationMonths
                                )}
                            />

                            {errors.durationMonths && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {
                                        errors
                                            .durationMonths
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                                Price (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="Enter price"
                                {...register("price", {
                                    required:
                                        "Price is required",
                                    min: {
                                        value: 0,
                                        message:
                                            "Price cannot be negative",
                                    },
                                })}
                                className={inputClass(
                                    errors.price
                                )}
                            />

                            {errors.price && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>
                    </div>

                        {/* Personal Training Add-on */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                                Personal Training Add-on (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="Optional add-on price"
                                {...register("personalTrainingPrice", {
                                    min: {
                                        value: 0,
                                        message: "Price cannot be negative",
                                    },
                                })}
                                className={inputClass(errors.personalTrainingPrice)}
                            />

                            {errors.personalTrainingPrice && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {errors.personalTrainingPrice.message}
                                </p>
                            )}
                        </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Description
                        </label>

                        <textarea
                            placeholder="Describe this membership plan..."
                            {...register("description")}
                            className="
                                min-h-[90px]
                                w-full
                                resize-y
                                rounded-[7px]
                                border
                                border-[#ddd]
                                bg-white
                                p-3
                                text-xs
                                leading-5
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

                    {/* Active */}
                    <label
                        className="
                            flex
                            cursor-pointer
                            items-center
                            gap-3
                            rounded-[7px]
                            border
                            border-[#eee]
                            bg-[#fafafa]
                            px-3
                            py-3
                            text-xs
                            text-[#555]
                        "
                    >
                        <input
                            type="checkbox"
                            {...register("active")}
                            className="
                                h-4
                                w-4
                                cursor-pointer
                                accent-[#ffd21a]
                            "
                        />

                        <span className="font-medium">
                            Active
                        </span>
                    </label>

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
                            onClick={() => {
                                setOpen(false);
                                setEdit(null);
                                reset();
                            }}
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
                                sm:w-auto
                            "
                        >
                            {edit ? "Update Plan" : "Save Plan"}
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