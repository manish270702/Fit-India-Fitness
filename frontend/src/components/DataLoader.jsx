import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { mountPlans } from "../store/Slice/Plans.Slice";
import { mountMembers } from "../store/Slice/Members.Slice";
import { mountPayments } from "../store/Slice/Payment.Slice";
import { mountToken } from "../store/Slice/Token.Slice";
import { mountUser } from "../store/Slice/User.Slice";
import { mountTrainers } from "../store/Slice/Trainer.Slice";
import { mountPersonalTrainingPlans } from "../store/Slice/PersonalTrainingPlan.Slice";

export default function DataLoader({ children }) {
    const dispatch = useDispatch();

    const reduxToken = useSelector((state) => state.token.value);
    // const reduxUser = useSelector((state) => state.user.value);

    const token =
        reduxToken || localStorage.getItem("token");

    const storedUser = localStorage.getItem("fitgym_user");
    // reduxUser ||

    // Set token and user in Redux
    useEffect(() => {
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (token) {
            dispatch(mountToken(token));
        }

        if (user) {
            dispatch(mountUser(user));
        }
    }, [token, storedUser, dispatch]);

    // Load application data
    useEffect(() => {
        if (!token) return;

        const loadData = async () => {
            try {
                const [plansRes, membersRes, paymentsRes, trainersRes, personalTrainingPlansRes] =
                    await Promise.all([
                        axios.get(
                            "http://localhost:5000/api/plans",
                            {
                                headers: {
                                    authorization: `Bearer ${token}`,
                                },
                            }
                        ),

                        axios.get(
                            "http://localhost:5000/api/members",
                            {
                                headers: {
                                    authorization: `Bearer ${token}`,
                                },
                            }
                        ),

                        axios.get(
                            "http://localhost:5000/api/payments",
                            {
                                headers: {
                                    authorization: `Bearer ${token}`,
                                },
                            }
                        ),
                        axios.get(
                            "http://localhost:5000/api/trainers",
                            { headers: { authorization: `Bearer ${token}` } }
                        ),
                        axios.get(
                            "http://localhost:5000/api/personal-training-plans",
                            { headers: { authorization: `Bearer ${token}` } }
                        ),
                    ]);

                dispatch(mountPlans(plansRes.data.plans));
                dispatch(mountMembers(membersRes.data.members));
                dispatch(mountPayments(paymentsRes.data.payments));
                dispatch(mountTrainers(trainersRes.data.trainers));
                dispatch(mountPersonalTrainingPlans(personalTrainingPlansRes.data.plans));
            } catch (error) {
                console.error(
                    "Failed to load application data:",
                    error
                );
            }
        };

        loadData();
    }, [token, dispatch]);

    return children;
}