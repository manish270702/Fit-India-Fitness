import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import Modal from "../components/Modal.jsx";
import { addTrainer, removeTrainer, updateTrainer } from "../store/Slice/Trainer.Slice";

export default function Trainers() {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const dispatch = useDispatch();
    const items = useSelector((state) => state.trainers.value);
    const token = useSelector((state) => state.token.value);

    // ========================================
    // REACT HOOK FORM
    // ========================================
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            specialization: "",
            salary: "",
            status: "Active",
        },
    });

    // ========================================
    // OPEN ADD MODAL
    // ========================================
    const openAddModal = () => {
        setEdit(null);

        reset({
            name: "",
            phone: "",
            specialization: "",
            salary: "",
            status: "Active",
        });

        setOpen(true);
    };

    // ========================================
    // OPEN EDIT MODAL
    // ========================================
    const startEdit = (trainer) => {
        setEdit(trainer);

        reset({
            name: trainer.name,
            phone: trainer.phone,
            specialization: trainer.specialization,
            salary: trainer.salary,
            status: trainer.status,
        });

        setOpen(true);
    };

    // ========================================
    // SAVE TRAINER
    // ========================================
    const save = async (data) => {
        const trainerData = {
            ...data,
            salary: Number(data.salary) || 0,
        };

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = edit
                ? await axios.put(`http://localhost:5000/api/trainers/${edit._id}`, trainerData, config)
                : await axios.post("http://localhost:5000/api/trainers", trainerData, config);

            if (edit) dispatch(updateTrainer(response.data.trainer));
            else dispatch(addTrainer(response.data.trainer));
            setOpen(false);
            setEdit(null);
            reset();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save trainer");
        }
    };

    // ========================================
    // DELETE TRAINER
    // ========================================
    const remove = async (id) => {
        const confirmed = window.confirm(
            "Delete trainer?"
        );

        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/trainers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(removeTrainer(id));
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete trainer");
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
                        Trainers
                    </h1>

                    <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                        Manage your gym's trainers and specialties.
                    </p>
                </div>

                <button
                    type="button"
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
                    Add Trainer
                </button>
            </div>

            {/* ========================================
                TRAINERS TABLE
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
                                    TRAINER
                                </th>

                                <th className={thClass}>
                                    PHONE
                                </th>

                                <th className={thClass}>
                                    SPECIALIZATION
                                </th>

                                <th className={thClass}>
                                    SALARY
                                </th>

                                <th className={thClass}>
                                    STATUS
                                </th>

                                <th className={thClass}>
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((trainer) => (
                                <tr
                                    key={trainer._id}
                                    className="
                                        border-b
                                        border-[#eee]
                                        transition
                                        last:border-b-0
                                        hover:bg-[#fcfcfc]
                                    "
                                >
                                    {/* Trainer */}
                                    <td className="px-[18px] py-4">
                                        <div className="flex items-center gap-3">
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
                                                {trainer.name.charAt(0)}
                                            </div>

                                            <b className="truncate text-xs font-semibold text-[#222]">
                                                {trainer.name}
                                            </b>
                                        </div>
                                    </td>

                                    {/* Phone */}
                                    <td className="px-[18px] py-4 text-xs text-[#555]">
                                        {trainer.phone || "—"}
                                    </td>

                                    {/* Specialization */}
                                    <td className="px-[18px] py-4 text-xs text-[#555]">
                                        {trainer.specialization || "—"}
                                    </td>

                                    {/* Salary */}
                                    <td className="px-[18px] py-4">
                                        <b className="text-xs font-semibold text-[#222]">
                                            ₹
                                            {Number(
                                                trainer.salary
                                            ).toLocaleString("en-IN")}
                                        </b>
                                    </td>

                                    {/* Status */}
                                    <td className="px-[18px] py-4">
                                        <span
                                            className={`
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                text-[11px]
                                                font-medium
                                                ${
                                                    trainer.status ===
                                                    "Active"
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
                                                        trainer.status ===
                                                        "Active"
                                                            ? "bg-[#0fa982]"
                                                            : "bg-[#aaa]"
                                                    }
                                                `}
                                            />

                                            {trainer.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-[18px] py-4">
                                        <div className="flex items-center gap-1">
                                            {/* Edit */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startEdit(trainer)
                                                }
                                                className="
                                                    flex
                                                    h-8
                                                    w-8
                                                    items-center
                                                    justify-center
                                                    rounded-md
                                                    text-[#777]
                                                    transition
                                                    hover:bg-[#fff8d6]
                                                    hover:text-[#222]
                                                "
                                                aria-label={`Edit ${trainer.name}`}
                                            >
                                                <Edit size={16} />
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    remove(trainer._id)
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
                                                aria-label={`Delete ${trainer.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty State */}
                            {!items.length && (
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
                                        No trainers added.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Hint */}
            <p className="mt-2 text-center text-[10px] text-[#aaa] sm:hidden">
                Swipe left/right to view trainer details
            </p>

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
                        ? "Edit Trainer"
                        : "Add Trainer"
                }
            >
                <form
                    onSubmit={handleSubmit(save)}
                    className="flex flex-col gap-4"
                >
                    {/* Name */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Name
                        </label>

                        <input
                            type="text"
                            placeholder="Enter trainer name"
                            {...register("name", {
                                required:
                                    "Trainer name is required",
                                minLength: {
                                    value: 2,
                                    message:
                                        "Name must be at least 2 characters",
                                },
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

                    {/* Phone */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Phone
                        </label>

                        <input
                            type="tel"
                            placeholder="Enter phone number"
                            {...register("phone", {
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message:
                                        "Enter a valid 10 digit phone number",
                                },
                            })}
                            className={inputClass(
                                errors.phone
                            )}
                        />

                        {errors.phone && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Specialization */}
                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                            Specialization
                        </label>

                        <input
                            type="text"
                            placeholder="e.g. Weight Training"
                            {...register(
                                "specialization"
                            )}
                            className={inputClass()}
                        />
                    </div>

                    {/* Salary + Status */}
                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        "
                    >
                        {/* Salary */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                                Salary
                            </label>

                            <input
                                type="number"
                                min="0"
                                placeholder="Enter salary"
                                {...register("salary", {
                                    min: {
                                        value: 0,
                                        message:
                                            "Salary cannot be negative",
                                    },
                                })}
                                className={inputClass(
                                    errors.salary
                                )}
                            />

                            {errors.salary && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {errors.salary.message}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                                Status
                            </label>

                            <select
                                {...register("status")}
                                className={inputClass()}
                            >
                                <option value="Active">
                                    Active
                                </option>

                                <option value="Inactive">
                                    Inactive
                                </option>
                            </select>
                        </div>
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
                            {edit
                                ? "Update Trainer"
                                : "Save Trainer"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

/* ========================================
   TABLE HEADER
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