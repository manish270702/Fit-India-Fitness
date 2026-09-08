import { X } from "lucide-react";

export default function Modal({
    open,
    onClose,
    title,
    children,
    wide = false,
}) {
    if (!open) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/40
                p-3
                sm:p-5
            "
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`
                    relative
                    max-h-[90vh]
                    w-full
                    overflow-y-auto
                    rounded-[10px]
                    border
                    border-[#e3e3e3]
                    bg-white
                    shadow-[0_15px_50px_rgba(0,0,0,0.18)]
                    ${
                        wide
                            ? "max-w-[850px]"
                            : "max-w-[520px]"
                    }
                `}
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
            >
                {/* ========================================
                    MODAL HEADER
                ======================================== */}
                <div
                    className="
                        sticky
                        top-0
                        z-10
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-[#eee]
                        bg-white
                        px-5
                        py-4
                        sm:px-6
                    "
                >
                    <h2
                        className="
                            min-w-0
                            truncate
                            text-[16px]
                            font-semibold
                            text-[#222]
                            sm:text-[17px]
                        "
                    >
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
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
                            hover:bg-[#f5f5f5]
                            hover:text-[#222]
                        "
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ========================================
                    MODAL CONTENT
                ======================================== */}
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}