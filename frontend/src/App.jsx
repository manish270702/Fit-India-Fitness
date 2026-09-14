import {
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";

import Layout from "./components/Layout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Members from "./pages/Members.jsx";
import MemberForm from "./pages/MemberForm.jsx";
import MemberDetail from "./pages/MemberDetail.jsx";
import Renewals from "./pages/Renewals.jsx";
import Payments from "./pages/Payments.jsx";
import Dues from "./pages/Dues.jsx";
import Plans from "./pages/Plans.jsx";
import PersonalTrainingPlans from "./pages/PersonalTrainingPlans.jsx";
import Trainers from "./pages/Trainers.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import { useSelector } from "react-redux";


// ========================================
// Protected Route
// ========================================

function PrivateRoute() {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

function PublicRoute() {
    const token = useSelector((state) => state.token.value) || localStorage.getItem("token");
    
    if (token) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return <Outlet />;
}

function Router() {
    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route
                    path="/login"
                    element={<Login />}
                />
            </Route>
            <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                
                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    {/* Members */}
                    <Route
                        path="/members"
                        element={<Members />}
                    />

                    <Route
                        path="/members/new"
                        element={<MemberForm />}
                    />

                    <Route
                        path="/members/:id/edit"
                        element={<MemberForm />}
                    />

                    <Route
                        path="/members/:id"
                        element={<MemberDetail />}
                    />

                    {/* Renewals */}
                    <Route
                        path="/renewals"
                        element={<Renewals />}
                    />

                    {/* Payments */}
                    <Route
                        path="/payments"
                        element={<Payments />}
                    />

                    <Route
                        path="/dues"
                        element={<Dues />}
                    />

                    {/* Plans */}
                    <Route
                        path="/plans"
                        element={<Plans />}
                    />

                    <Route
                        path="/personal-training-plans"
                        element={<PersonalTrainingPlans />}
                    />

                    {/* Trainers */}
                    <Route
                        path="/trainers"
                        element={<Trainers />}
                    />

                    {/* Reports */}
                    <Route
                        path="/reports"
                        element={<Reports />}
                    />

                    {/* Settings */}
                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                </Route>

            </Route>

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default function App() {
    return <Router />;
}