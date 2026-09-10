const paymentMemberId = (payment) =>
    payment.member?._id?.toString() || payment.member?.toString();

const paymentPeriodKey = (payment) => {
    if (payment.membershipPeriodStart) {
        return `period:${new Date(payment.membershipPeriodStart).getTime()}`;
    }
    return `legacy:${payment.plan?._id?.toString() || payment.plan?.toString() || payment.plan?.name || "unknown"}`;
};

export function getMemberBalance(member, payments) {
    const memberPayments = payments.filter(
        (payment) => paymentMemberId(payment) === member?._id?.toString()
    );
    const currentPeriodStart = member?.membershipStart
        ? new Date(member.membershipStart).getTime()
        : null;
    const countedPeriods = new Set();
    const currentTrainingFee = member?.personalTraining
        ? Number(member.personalTrainingPlan?.price || member.currentPlan?.personalTrainingPrice || 0)
        : 0;
    let totalFees = Number(member?.currentPlan?.price || 0) + currentTrainingFee;

    memberPayments.forEach((payment) => {
        const paymentPeriod = payment.membershipPeriodStart
            ? new Date(payment.membershipPeriodStart).getTime()
            : null;
        const isCurrentPeriod = currentPeriodStart !== null && (
            paymentPeriod === currentPeriodStart ||
            (!paymentPeriod && new Date(payment.paymentDate) >= new Date(member.membershipStart))
        );
        if (isCurrentPeriod) return;

        const periodKey = paymentPeriodKey(payment);
        if (countedPeriods.has(periodKey)) return;
        countedPeriods.add(periodKey);
        totalFees += Number(payment.membershipPeriodFee || payment.plan?.price || 0);
    });

    const totalPaid = memberPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );
    const balance = totalFees - totalPaid;

    return {
        totalFees,
        totalPaid,
        due: Math.max(balance, 0),
        advance: Math.max(-balance, 0),
    };
}
