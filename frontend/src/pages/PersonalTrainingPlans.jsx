import { useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Modal from "../components/Modal.jsx";
import {
    addPersonalTrainingPlan,
    removePersonalTrainingPlan,
    updatePersonalTrainingPlan,
} from "../store/Slice/PersonalTrainingPlan.Slice";

const emptyPlan = { name: "", durationMonths: 1, price: "", description: "", active: true };

export default function PersonalTrainingPlans() {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const plans = useSelector((state) => state.personalTrainingPlans.value);
    const token = useSelector((state) => state.token.value);
    const dispatch = useDispatch();
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: emptyPlan });

    const close = () => { setOpen(false); setEdit(null); reset(emptyPlan); };
    const save = async (data) => {
        const payload = { ...data, durationMonths: Number(data.durationMonths), price: Number(data.price) };
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = edit
                ? await axios.put(`http://localhost:5000/api/personal-training-plans/${edit._id}`, payload, config)
                : await axios.post("http://localhost:5000/api/personal-training-plans", payload, config);
            dispatch(edit ? updatePersonalTrainingPlan(response.data.plan) : addPersonalTrainingPlan(response.data.plan));
            close();
        } catch (error) { alert(error.response?.data?.message || "Failed to save personal training plan"); }
    };
    const remove = async (id) => {
        if (!window.confirm("Delete this personal training plan?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/personal-training-plans/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            dispatch(removePersonalTrainingPlan(id));
        } catch (error) { alert(error.response?.data?.message || "Failed to delete personal training plan"); }
    };

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-[24px] font-bold text-[#151515] sm:text-[27px]">Personal Training Plans</h1>
                    <p className="mt-1 text-xs text-[#888] sm:text-[13px]">Manage duration-specific personal training packages.</p>
                </div>
                <button type="button" onClick={() => { setEdit(null); reset(emptyPlan); setOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#ffd21a] bg-[#ffd21a] px-[15px] text-xs font-semibold text-[#111]">
                    <Plus size={17} /> Add PT Plan
                </button>
            </div>

            <div className="mb-5 flex w-full max-w-fit items-center gap-1 rounded-[8px] border border-[#e3e3e3] bg-white p-1">
                <Link
                    to="/plans"
                    className="rounded-[6px] px-3 py-2 text-[11px] font-medium text-[#777] no-underline transition hover:bg-[#f7f7f7] hover:text-[#222]"
                >
                    Gym Membership Plans
                </Link>
                <span className="rounded-[6px] bg-[#fff4b8] px-3 py-2 text-[11px] font-semibold text-[#806900]">
                    Personal Training Plans
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                    <div key={plan._id} className="rounded-[9px] border border-[#e3e3e3] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-[15px] font-semibold text-[#222]">{plan.name}</h2>
                                <p className="mt-1 text-[10px] text-[#999]">{plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""}</p>
                            </div>
                            <div className="flex gap-1">
                                <button type="button" onClick={() => { setEdit(plan); reset({ ...plan }); setOpen(true); }} className="flex h-8 w-8 items-center justify-center rounded-md text-[#777] hover:bg-[#fff8d6]" aria-label={`Edit ${plan.name}`}><Edit size={16} /></button>
                                <button type="button" onClick={() => remove(plan._id)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#d22d2d] hover:bg-[#ffecec]" aria-label={`Delete ${plan.name}`}><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <p className="mt-5 text-[27px] font-bold text-[#151515]">₹{Number(plan.price).toLocaleString("en-IN")}</p>
                        <p className="mt-3 text-xs text-[#777]">{plan.description || "No description"}</p>
                    </div>
                ))}
            </div>

            <Modal open={open} onClose={close} title={edit ? "Edit Personal Training Plan" : "Add Personal Training Plan"}>
                <form onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
                    <Field label="Name" error={errors.name?.message}><input {...register("name", { required: "Name is required" })} className={inputClass(errors.name)} placeholder="e.g. 3 Month Personal Training" /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Duration (months)" error={errors.durationMonths?.message}><input type="number" min="1" {...register("durationMonths", { required: "Duration is required", min: { value: 1, message: "At least 1 month" } })} className={inputClass(errors.durationMonths)} /></Field>
                        <Field label="Price (₹)" error={errors.price?.message}><input type="number" min="0" {...register("price", { required: "Price is required", min: { value: 0, message: "Cannot be negative" } })} className={inputClass(errors.price)} /></Field>
                    </div>
                    <Field label="Description"><textarea {...register("description")} className="min-h-[80px] w-full rounded-[7px] border border-[#ddd] p-3 text-xs" placeholder="Describe this PT package" /></Field>
                    <label className="flex items-center gap-2 text-xs text-[#555]"><input type="checkbox" {...register("active")} /> Active</label>
                    <div className="flex justify-end gap-2 border-t border-[#eee] pt-4"><button type="button" onClick={close} className="h-10 rounded-[7px] border border-[#dedede] px-[15px] text-xs">Cancel</button><button type="submit" className="h-10 rounded-[7px] bg-[#ffd21a] px-[15px] text-xs font-semibold">{edit ? "Update Plan" : "Save Plan"}</button></div>
                </form>
            </Modal>
        </div>
    );
}

function Field({ label, error, children }) { return <div><label className="mb-1.5 block text-[11px] font-medium text-[#666]">{label}</label>{children}{error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}</div>; }
function inputClass(error) { return `h-10 w-full rounded-[7px] border ${error ? "border-red-300" : "border-[#ddd]"} px-3 text-xs outline-none`; }
