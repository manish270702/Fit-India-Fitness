import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from 'axios';
import { useDispatch } from "react-redux";
import { mountToken } from "../store/Slice/Token.Slice";
import { mountUser } from "../store/Slice/User.Slice";

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const submit = async (data) => {
        setError("");


        try {
            setLoading(true);

            const res = await axios.post(
                `http://localhost:5000/api/auth/${isRegister ? "register" : "login"}`,
                data
            );

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("fitgym_user", JSON.stringify(res.data.user));

            dispatch(mountToken(res.data.token))
            dispatch(mountUser(res.data.user))

            setLoading(false)
            // console.log("Navigating to home...");
            navigate("/");
        } catch (err) {
            setLoading(false)
            setError("Something went wrong");
            console.log(err)
        }
    };

    const toggleMode = () => {
        setIsRegister(!isRegister);
        setError("");

        reset({
            name: "",
            email: "",
            password: "",
        });
    };

    if (loading) return <div>
        loading
    </div>

    return (
        <div
            className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-[#f7f7f5]
                px-4
                py-6
                sm:px-6
                sm:py-8
            "
        >
            {/* Login Card */}
            <div
                className="
                    w-full
                    max-w-[390px]
                    rounded-xl
                    border
                    border-[#e2e2e2]
                    bg-white
                    p-6
                    shadow-[0_12px_40px_rgba(0,0,0,0.05)]
                    sm:p-8
                "
            >
                {/* Brand */}
                <div className="mb-7 flex items-center gap-3 sm:mb-8">
                    <div
                        className="
                            flex
                            h-[42px]
                            w-[42px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-[10px]
                            bg-[#ffd21a]
                            text-[#111]
                        "
                    >
                        <Dumbbell size={21} />
                    </div>

                    <div className="min-w-0">
                        <b className="block truncate text-[16px] font-bold text-[#151515]">
                            Fit India Fitness
                        </b>

                        <span className="mt-0.5 block text-[10px] text-[#8b8b8b]">
                            Gym Management
                        </span>
                    </div>
                </div>

                {/* Heading */}
                <div className="mb-6">
                    <h1
                        className="
                            text-[23px]
                            font-bold
                            leading-tight
                            tracking-[-0.5px]
                            text-[#151515]
                            sm:text-[25px]
                        "
                    >
                        {isRegister
                            ? "Create owner account"
                            : "Welcome back"}
                    </h1>

                    <p className="mt-1.5 text-[12px] text-[#888]">
                        {isRegister
                            ? "Set up your gym management account."
                            : "Sign in to manage your gym."}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="
                            mb-4
                            rounded-[7px]
                            border
                            border-[#ffd0d0]
                            bg-[#fff0f0]
                            px-3
                            py-2.5
                            text-xs
                            text-[#c33]
                        "
                    >
                        {error}
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit(submit)}
                    className="flex flex-col gap-4"
                >
                    {/* Name */}
                    {isRegister && (
                        <div>
                            <label className="mb-1.5 block text-[11px] text-[#666]">
                                Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: {
                                        value: 2,
                                        message:
                                            "Name must be at least 2 characters",
                                    },
                                })}
                                className="
                                    h-[42px]
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
                                    placeholder:text-[#aaa]
                                    focus:border-[#c9aa00]
                                    focus:ring-2
                                    focus:ring-[#fff3a8]
                                "
                            />

                            {errors.name && (
                                <p className="mt-1 text-[10px] text-red-500">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message:
                                        "Enter a valid email address",
                                },
                            })}
                            className="
                                h-[42px]
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
                                placeholder:text-[#aaa]
                                focus:border-[#c9aa00]
                                focus:ring-2
                                focus:ring-[#fff3a8]
                            "
                        />

                        {errors.email && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1.5 block text-[11px] text-[#666]">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message:
                                        "Password must be at least 6 characters",
                                },
                            })}
                            className="
                                h-[42px]
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
                                placeholder:text-[#aaa]
                                focus:border-[#c9aa00]
                                focus:ring-2
                                focus:ring-[#fff3a8]
                            "
                        />

                        {errors.password && (
                            <p className="mt-1 text-[10px] text-red-500">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                            mt-1
                            flex
                            h-10
                            w-full
                            items-center
                            justify-center
                            rounded-[7px]
                            border
                            border-[#ffd21a]
                            bg-[#ffd21a]
                            px-4
                            text-[13px]
                            font-semibold
                            text-[#111]
                            transition
                            hover:bg-[#f5c800]
                            active:bg-[#eabd00]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {isSubmitting
                            ? "Please wait..."
                            : isRegister
                                ? "Create Account"
                                : "Sign In"}
                    </button>
                </form>

                {/* Toggle */}
                <button
                    type="button"
                    onClick={toggleMode}
                    className="
                        mt-5
                        w-full
                        border-0
                        bg-transparent
                        text-center
                        text-[11px]
                        text-[#555]
                        underline
                        underline-offset-2
                        transition
                        hover:text-[#111]
                    "
                >
                    {isRegister
                        ? "Already have an account? Sign in"
                        : "New gym? Create owner account"}
                </button>
            </div>
        </div>
    );
}