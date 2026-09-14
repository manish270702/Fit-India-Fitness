import axios from "axios";
import { useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import Modal from "../components/Modal.jsx";
import { AddPayment } from "../store/Slice/Payment.Slice";
import { getMemberBalance } from "../utils/memberBalance.js";

const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount || 0);

const inputClass = "h-10 w-full rounded-[7px] border border-[#ddd] bg-white px-3 text-xs text-[#444] outline-none transition placeholder:text-[#aaa] focus:border-[#c9aa00] focus:ring-2 focus:ring-[#fff3a8]";

export default function Dues() {
    const [search, setSearch] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [method, setMethod] = useState("Cash");
    const [transactionId, setTransactionId] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const members = useSelector((state) => state.members.value);
    const payments = useSelector((state) => state.payments.value);
    const token = useSelector((state) => state.token.value);

    const membersWithDues = useMemo(() => members
        .map((member) => ({
            ...member,
            balance: getMemberBalance(member, payments),
        }))
        .filter((member) => member.balance.due > 0)
        .filter((member) => `${member.name} ${member.phone}`.toLowerCase().includes(search.toLowerCase())), [members, payments, search]);

    const totalDue = membersWithDues.reduce((sum, member) => sum + member.balance.due, 0);

    const clearDues = async (event) => {
        event.preventDefault();
        if (!selectedMember) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                "http://localhost:5000/api/payments",
                {
                    member: selectedMember._id,
                    amount: selectedMember.balance.due,
                    method,
                    transactionId,
                    note: note || "Dues cleared",
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            dispatch(AddPayment(response.data.payment));
            setSelectedMember(null);
            setMethod("Cash");
            setTransactionId("");
            setNote("");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to record payment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-[24px] font-bold tracking-[-0.6px] text-[#151515] sm:text-[27px]">Dues</h1>
                <p className="mt-1 text-xs text-[#888] sm:text-[13px]">See outstanding member balances and clear them when payment is received.</p>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-h-[115px] rounded-[9px] border border-[#e4e4e4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="block text-[11px] text-[#888]">Members with dues</span>
                    <b className="mt-2 block text-[25px] font-bold text-[#151515]">{membersWithDues.length}</b>
                </div>
                <div className="min-h-[115px] rounded-[9px] border border-[#e4e4e4] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="block text-[11px] text-[#888]">Total outstanding</span>
                    <b className="mt-2 block text-[25px] font-bold text-[#b42318]">{money(totalDue)}</b>
                </div>
            </div>

            <div className="mb-[18px]">
                <div className="relative w-full max-w-[400px]">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                        placeholder="Search member..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="h-10 w-full rounded-[7px] border border-[#ddd] bg-white py-2.5 pl-10 pr-3 text-xs text-[#444] outline-none transition placeholder:text-[#aaa] focus:border-[#c9aa00] focus:ring-2 focus:ring-[#fff3a8]"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-[9px] border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                        <thead>
                            <tr className="border-b border-[#ddd] bg-[#f8f8f8]">
                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">MEMBER</th>
                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">PLAN</th>
                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">TOTAL FEE</th>
                                <th className="h-[46px] px-[18px] text-left text-[10px] font-semibold tracking-[0.4px] text-[#777]">DUE</th>
                                <th className="h-[46px] px-[18px] text-right text-[10px] font-semibold tracking-[0.4px] text-[#777]">ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membersWithDues.map((member) => (
                                <tr key={member._id} className="border-b border-[#eee] last:border-b-0 hover:bg-[#fcfcfc]">
                                    <td className="px-[18px] py-4">
                                        <b className="block text-xs font-semibold text-[#222]">{member.name}</b>
                                        <small className="mt-1 block text-[10px] text-[#999]">{member.phone}</small>
                                    </td>
                                    <td className="px-[18px] py-4 text-xs text-[#444]">{member.currentPlan?.name || "—"}</td>
                                    <td className="px-[18px] py-4 text-xs text-[#555]">{money(member.balance.totalFees)}</td>
                                    <td className="px-[18px] py-4 text-xs font-semibold text-[#b42318]">{money(member.balance.due)}</td>
                                    <td className="px-[18px] py-4 text-right">
                                        <button type="button" onClick={() => setSelectedMember(member)} className="inline-flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#ffd21a] px-3 text-[11px] font-semibold text-[#151515] transition hover:bg-[#f5c800]">
                                            <CheckCircle2 size={15} />
                                            Clear dues
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!membersWithDues.length && (
                                <tr>
                                    <td colSpan="5" className="h-[150px] px-4 text-center text-xs text-[#999]">No outstanding dues found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={Boolean(selectedMember)} onClose={() => setSelectedMember(null)} title="Clear member dues">
                {selectedMember && (
                    <form onSubmit={clearDues} className="flex flex-col gap-4">
                        <div className="rounded-[7px] border border-[#f0df82] bg-[#fffbea] p-3">
                            <p className="text-xs font-semibold text-[#333]">{selectedMember.name}</p>
                            <p className="mt-1 text-[11px] text-[#777]">Amount received: <b className="text-[#b42318]">{money(selectedMember.balance.due)}</b></p>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]" htmlFor="dues-method">Payment method</label>
                            <select id="dues-method" value={method} onChange={(event) => setMethod(event.target.value)} className={inputClass}>
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Card">Card</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]" htmlFor="dues-transaction">Transaction ID</label>
                            <input id="dues-transaction" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Optional" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-[#666]" htmlFor="dues-note">Note</label>
                            <textarea id="dues-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" className="min-h-[75px] w-full resize-y rounded-[7px] border border-[#ddd] bg-white p-3 text-xs text-[#444] outline-none transition placeholder:text-[#aaa] focus:border-[#c9aa00] focus:ring-2 focus:ring-[#fff3a8]" />
                        </div>
                        <div className="mt-2 flex flex-col-reverse gap-2 border-t border-[#eee] pt-4 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => setSelectedMember(null)} className="h-10 rounded-[7px] border border-[#dedede] bg-white px-[15px] text-xs font-medium text-[#666] hover:bg-[#f7f7f7]">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#ffd21a] px-[15px] text-xs font-semibold text-[#151515] hover:bg-[#f5c800] disabled:cursor-not-allowed disabled:opacity-60">
                                <CreditCard size={15} />
                                {isSubmitting ? "Saving..." : "Confirm payment"}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}