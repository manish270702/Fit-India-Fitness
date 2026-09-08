import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

export default function PasswordReset() {
    const token = useSelector((state) => state.token.value);
    const [message, setMessage] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async ({ currentPassword, newPassword }) => {
        setMessage(null);
        try {
            await axios.post(
                "http://localhost:5000/api/auth/change-password",
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            reset();
            setMessage({ type: "success", text: "Password changed successfully." });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Unable to change password.",
            });
        }
    };

    return (
        <section className="mt-8 border-t border-[#eee] pt-6">
            <h2 className="text-[15px] font-semibold text-[#222]">Change password</h2>
            <p className="mt-1 text-[11px] text-[#999]">Update your account password.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid max-w-[420px] gap-3">
                <PasswordField
                    label="Current password"
                    error={errors.currentPassword?.message}
                    {...register("currentPassword", { required: "Current password is required" })}
                />
                <PasswordField
                    label="New password"
                    error={errors.newPassword?.message}
                    {...register("newPassword", {
                        required: "New password is required",
                        minLength: { value: 6, message: "Use at least 6 characters" },
                    })}
                />
                <PasswordField
                    label="Confirm new password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword", {
                        required: "Please confirm your new password",
                        validate: (value) => value === watch("newPassword") || "Passwords do not match",
                    })}
                />

                {message && (
                    <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                        {message.text}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 w-fit rounded-[7px] bg-[#ffd21a] px-4 text-xs font-semibold text-[#111] hover:bg-[#f5c800] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Updating..." : "Update password"}
                </button>
            </form>
        </section>
    );
}

const PasswordField = ({ label, error, ...props }) => (
    <label className="grid gap-1 text-[11px] font-medium text-[#666]">
        {label}
        <input
            type="password"
            autoComplete="new-password"
            className="h-10 rounded-[7px] border border-[#ddd] bg-white px-3 text-xs text-[#444] outline-none focus:border-[#c9aa00] focus:ring-2 focus:ring-[#fff3a8]"
            {...props}
        />
        {error && <span className="font-normal text-red-500">{error}</span>}
    </label>
);