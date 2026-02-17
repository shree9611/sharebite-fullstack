import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Disclaimer from "./pages/Disclaimer";
import RoleSelection from "./pages/RoleSelection";
import AccountDetails from "./pages/AccountDetails";
import Login from "./pages/Login";
import RegisterAccess from "./pages/RegisterAccess";
import RegistrationStep2 from "./pages/RegistrationStep2";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import UserDashboard from "./pages/UserDashboard";
import MyRequests from "./pages/MyRequests";
import FoodRequest from "./pages/FoodRequest";
import DonateFood from "./pages/DonateFood";
import RequestApproval from "./pages/RequestApproval";
import CommunityFeedback from "./pages/CommunityFeedback";
import VolunteerAcceptMission from "./pages/VolunteerAcceptMission";
import ReceiverFeedback from "./pages/ReceiverFeedback";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";

export default function App() {
  return (
    <BrowserRouter>
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



      </Routes>
    </BrowserRouter>
  );
}
