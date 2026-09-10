import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Addmember, UpdateMember } from "../store/Slice/Members.Slice";
import { AddPayment } from "../store/Slice/Payment.Slice";

export default function MemberForm() {

    const dispatch = useDispatch()
    const { id } = useParams();
    const edit = !!id;
    const nav = useNavigate();
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const today = new Date().toISOString().slice(0, 10);

    // Static plans
    // const plans = [
    //     {
    //         id: "1",
    //         name: "Monthly",
    //         price: 1500,
    //         active: true,
    //     },
    //     {
    //         id: "2",
    //         name: "Quarterly",
    //         price: 4000,
    //         active: true,
    //     },
    //     {
    //         id: "3",
    //         name: "Half Yearly",
    //         price: 7000,
    //         active: true,
    //     },
    //     {
    //         id: "4",
    //         name: "Yearly",
    //         price: 12000,
    //         active: true,
    //     },
    // ];

    const plans = useSelector((state) => state.plans.value);
    const trainers = useSelector((state) => state.trainers.value);
    const personalTrainingPlans = useSelector((state) => state.personalTrainingPlans.value);

    // Static trainers
    // const trainers = [
    //     {
    //         id: "1",
    //         name: "Rahul Sharma",
    //         specialization: "Weight Training",
    //     },
    //     {
    //         id: "2",
    //         name: "Amit Verma",
    //         specialization: "Cardio & Fitness",
    //     },
    //     {
    //         id: "3",
    //         name: "Priya Singh",
    //         specialization: "Yoga & Flexibility",
    //     },
    //     {
    //         id: "4",
    //         name: "Vikas Meena",
    //         specialization: "Strength Training",
    //     },
    // ];

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            gender: "Male",
            address: "",
            joiningDate: today,
            membershipStart: today,
            timeSlot: "Morning",
            trainer: "",
            personalTraining: false,
            planId: "",
            paymentAmount: "",
            paymentMethod: "Cash",
            transactionId: "",
            notes: "",
            photo: "",
        },
    });

    const members = useSelector((state) => state.members.value);
    const member = members.find((m) => m._id === id);
    // console.log(member)


    // Static edit data
    useEffect(() => {
        if (member) {
            reset({
                ...member,

                joiningDate: member.joiningDate?.split("T")[0] || "",

                membershipStart:
                    member.membershipStart?.split("T")[0] || "",

                membershipEnd:
                    member.membershipEnd?.split("T")[0] || "",

                planId: member.currentPlan?._id || "",
                trainer: member.trainer?._id || "",
                personalTraining: member.personalTraining || false,
                personalTrainingPlanId: member.personalTrainingPlan?._id || "",
            });
        }
    }, [member, reset]);

    useEffect(() => () => {
        if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    }, [photoPreview]);

    const displayedPhoto = photoPreview || member?.photo || "";
    const selectedPlan = plans.find((plan) => plan._id === watch("planId"));

    // Static submit
    const token = useSelector((state) => state.token.value)
    const onSubmit = async (data) => {
        try {
            let photo = data.photo || "";
            if (photoFile) {
                const optimizedPhoto = await optimizePhoto(photoFile);
                const auth = await axios.get(
                    "http://localhost:5000/api/uploads/imagekit/auth",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const uploadData = new FormData();
                uploadData.append("file", optimizedPhoto, "member-photo.webp");
                uploadData.append("fileName", "member-photo.webp");
                uploadData.append("useUniqueFileName", "true");
                uploadData.append("publicKey", auth.data.publicKey);
                uploadData.append("signature", auth.data.signature);
                uploadData.append("expire", auth.data.expire);
                uploadData.append("token", auth.data.token);
                uploadData.append("folder", "/fit-india-fitness/members");

                const upload = await axios.post(
                    "https://upload.imagekit.io/api/v1/files/upload",
                    uploadData
                );
                photo = upload.data.url;
            }

            const payload = { ...data, photo, trainer: data.trainer || null };
            const res = edit
                ? await axios.put(`http://localhost:5000/api/members/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                : await axios.post("http://localhost:5000/api/members", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });

            edit ? dispatch(UpdateMember(res.data.member)) : dispatch(Addmember(res.data.member));
            if (!edit && res.data.payment) dispatch(AddPayment(res.data.payment));
            nav("/members");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save member");
        }
    };

    const onPhotoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Photo must be smaller than 5 MB");
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    return (
        <div className="w-full">
            {/* ========================================
                BACK BUTTON
            ======================================== */}
            <button
                onClick={() => nav(-1)}
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
                Back
            </button>

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
                    {edit ? "Edit Member" : "Add New Member"}
                </h1>

                <p className="mt-1 text-xs text-[#888] sm:text-[13px]">
                    {edit
                        ? "Update member information."
                        : "Create a member and their first membership."}
                </p>
            </div>

            {/* ========================================
                FORM
            ======================================== */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="
                    w-full
                    max-w-[950px]
                    rounded-[9px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    p-4
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    sm:p-5
                    lg:p-6
                "
            >
                <h2 className="text-[15px] font-semibold text-[#151515]">
                    Personal Information
                </h2>

                <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e9edf0] text-[#777]">
                        {displayedPhoto ? (
                            <img src={displayedPhoto} alt="Member preview" className="h-full w-full object-cover" />
                        ) : (
                            <Camera size={24} />
                        )}
                    </div>
                    <div>
                        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[7px] border border-[#dedede] bg-white px-3 text-xs text-[#555] transition hover:bg-[#f5f5f5]">
                            <Camera size={15} />
                            {displayedPhoto ? "Change photo" : "Upload photo"}
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotoChange} className="sr-only" />
                        </label>
                        <p className="mt-1.5 text-[10px] text-[#999]">JPG, PNG or WebP up to 5 MB</p>
                    </div>
                </div>

                <div
                    className="
                        mt-5
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                    "
                >
                    {/* Full Name */}
                    <FormField
                        label="Full Name *"
                        error={errors.name?.message}
                    >
                        <input
                            {...register("name", {
                                required:
                                    "Full name is required",
                                minLength: {
                                    value: 2,
                                    message:
                                        "Name must contain at least 2 characters",
                                },
                            })}
                            placeholder="Enter full name"
                            className={inputClass(
                                errors.name
                            )}
                        />
                    </FormField>

                    {/* Phone */}
                    <FormField
                        label="Phone Number *"
                        error={errors.phone?.message}
                    >
                        <input
                            type="tel"
                            {...register("phone", {
                                required:
                                    "Phone number is required",
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message:
                                        "Enter a valid 10 digit phone number",
                                },
                            })}
                            placeholder="Enter phone number"
                            className={inputClass(
                                errors.phone
                            )}
                        />
                    </FormField>

                    {/* Gender */}
                    <FormField label="Gender">
                        <select
                            {...register("gender")}
                            className={inputClass()}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">
                                Female
                            </option>
                            <option value="Other">Other</option>
                        </select>
                    </FormField>

                    {/* Time Slot */}
                    <FormField label="Time Slot">
                        <select
                            {...register("timeSlot")}
                            className={inputClass()}
                        >
                            <option value="Morning">
                                Morning
                            </option>
                            <option value="Afternoon">
                                Afternoon
                            </option>
                            <option value="Evening">
                                Evening
                            </option>
                        </select>
                    </FormField>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <FormField label="Address">
                            <textarea
                                {...register("address")}
                                placeholder="Enter member address"
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
                        </FormField>
                    </div>

                    {/* Joining Date */}
                    <FormField label="Joining Date">
                        <input
                            type="date"
                            {...register("joiningDate")}
                            className={inputClass()}
                        />
                    </FormField>

                    {/* Membership Start */}
                    <FormField label="Membership Start">
                        <input
                            type="date"
                            {...register("membershipStart")}
                            className={inputClass()}
                        />
                    </FormField>

                    {/* Trainer */}
                    <FormField label="Personal Trainer (Optional)">
                        <select
                            {...register("trainer")}
                            className={inputClass()}
                        >
                            <option value="">
                                No trainer
                            </option>

                            {trainers
                                .filter((trainer) => trainer.status === "Active")
                                .map((trainer) => (
                                <option
                                    key={trainer._id}
                                    value={trainer._id}
                                >
                                    {trainer.name}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {/* Membership Plan */}
                    <FormField label="Membership Plan">
                        <select
                            {...register("planId")}
                            className={inputClass()}
                        >
                            <option value="">
                                No plan
                            </option>

                            {plans
                                .filter(
                                    (plan) => plan.active
                                )
                                .map((plan) => (
                                    <option
                                        key={plan._id}
                                        value={plan._id}
                                    >
                                        {plan.name} — ₹{plan.price}
                                        {plan.personalTrainingPrice > 0
                                            ? ` (+₹${plan.personalTrainingPrice} PT)`
                                            : ""}
                                    </option>
                                ))}
                        </select>
                    </FormField>

                    <label className="flex items-center gap-2 text-xs text-[#555]">
                        <input type="checkbox" {...register("personalTraining")} />
                        Add personal training
                        {selectedPlan && (
                            <span className="text-[10px] text-[#888]">
                                (+₹{selectedPlan.personalTrainingPrice || 0} for {selectedPlan.durationMonths} month{selectedPlan.durationMonths > 1 ? "s" : ""})
                            </span>
                        )}
                    </label>

                    {selectedPlan && (
                        <FormField label="Personal Training Plan (Optional)">
                            <select
                                {...register("personalTrainingPlanId")}
                                className={inputClass()}
                            >
                                <option value="">No personal training plan</option>
                                {personalTrainingPlans
                                    .filter((plan) => plan.active && plan.durationMonths === selectedPlan.durationMonths)
                                    .map((plan) => (
                                        <option key={plan._id} value={plan._id}>
                                            {plan.name} — ₹{plan.price}
                                        </option>
                                    ))}
                            </select>
                        </FormField>
                    )}

                    {/* Payment Fields */}
                    {!edit && (
                        <>
                            {/* Amount */}
                            <FormField
                                label="Amount Paid"
                                error={
                                    errors.paymentAmount
                                        ?.message
                                }
                            >
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter amount"
                                    {...register(
                                        "paymentAmount",
                                        {
                                            min: {
                                                value: 0,
                                                message:
                                                    "Amount cannot be negative",
                                            },
                                        }
                                    )}
                                    className={inputClass(
                                        errors.paymentAmount
                                    )}
                                />
                            </FormField>

                            {/* Payment Method */}
                            <FormField label="Payment Method">
                                <select
                                    {...register(
                                        "paymentMethod"
                                    )}
                                    className={inputClass()}
                                >
                                    <option value="Cash">
                                        Cash
                                    </option>
                                    <option value="UPI">
                                        UPI
                                    </option>
                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>
                                    <option value="Card">
                                        Card
                                    </option>
                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </FormField>

                            {/* Transaction ID */}
                            <FormField label="Transaction ID">
                                <input
                                    {...register(
                                        "transactionId"
                                    )}
                                    placeholder="Enter transaction ID"
                                    className={inputClass()}
                                />
                            </FormField>
                        </>
                    )}

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <FormField label="Notes">
                            <textarea
                                {...register("notes")}
                                placeholder="Add any additional notes"
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
                        </FormField>
                    </div>
                </div>

                {/* ========================================
                    ACTIONS
                ======================================== */}
                <div
                    className="
                        mt-6
                        flex
                        flex-col-reverse
                        gap-2
                        border-t
                        border-[#eee]
                        pt-5
                        sm:flex-row
                        sm:justify-end
                    "
                >
                    <button
                        type="button"
                        onClick={() => nav(-1)}
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
                            : edit
                                ? "Save Changes"
                                : "Create Member"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ========================================
   FORM FIELD
======================================== */

function FormField({ label, error, children }) {
    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-medium text-[#666]">
                {label}
            </label>

            {children}

            {error && (
                <p className="mt-1 text-[10px] text-red-500">
                    {error}
                </p>
            )}
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

async function optimizePhoto(file) {
    const image = await createImageBitmap(file);
    const maxDimension = 1200;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (result) => result ? resolve(result) : reject(new Error("Photo compression failed")),
            "image/webp",
            0.82
        );
    });

    return blob;
}