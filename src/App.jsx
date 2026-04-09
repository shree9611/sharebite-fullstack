import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

const Home = lazy(() => import("./pages/Home"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const AccountDetails = lazy(() => import("./pages/AccountDetails"));
const Login = lazy(() => import("./pages/Login"));
const RegisterAccess = lazy(() => import("./pages/RegisterAccess"));
const RegistrationStep2 = lazy(() => import("./pages/RegistrationStep2"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const FoodRequest = lazy(() => import("./pages/FoodRequest"));
const DonateFood = lazy(() => import("./pages/DonateFood"));
const RequestApproval = lazy(() => import("./pages/RequestApproval"));
const CommunityFeedback = lazy(() => import("./pages/CommunityFeedback"));
const VolunteerAcceptMission = lazy(() => import("./pages/VolunteerAcceptMission"));
const ReceiverFeedback = lazy(() => import("./pages/ReceiverFeedback"));
const Profile = lazy(() => import("./pages/Profile"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-transparent text-sm text-text-muted">
            Loading...
          </div>
        }
      >
        <div className="min-h-screen bg-transparent text-text-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/roles" element={<RoleSelection />} />
            <Route path="/account-details" element={<AccountDetails />} />
            <Route path="/registration-step-2" element={<RegistrationStep2 />} />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["Receiver"]}>
                  <UserDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <RoleProtectedRoute allowedRoles={["Receiver"]}>
                  <MyRequests />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/food-request"
              element={
                <RoleProtectedRoute allowedRoles={["Receiver"]}>
                  <FoodRequest />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/donor/donate"
              element={
                <RoleProtectedRoute allowedRoles={["Donor"]}>
                  <DonateFood />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/donor/approvals"
              element={
                <RoleProtectedRoute allowedRoles={["Donor"]}>
                  <RequestApproval />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/donor/feedback"
              element={
                <RoleProtectedRoute allowedRoles={["Donor"]}>
                  <CommunityFeedback />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/volunteer/acceptmission"
              element={
                <RoleProtectedRoute allowedRoles={["Volunteer"]}>
                  <VolunteerAcceptMission />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/receiver/feedback"
              element={
                <RoleProtectedRoute allowedRoles={["Receiver"]}>
                  <ReceiverFeedback />
                </RoleProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register-access" element={<RegisterAccess />} />
            <Route
              path="/profile"
              element={
                <RoleProtectedRoute allowedRoles={["Donor", "Receiver", "Volunteer"]}>
                  <Profile />
                </RoleProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Suspense>
    </BrowserRouter>
  );
}
