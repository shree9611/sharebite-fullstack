import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUserRole, getRoleHomePath } from "../lib/auth.js";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("sharebite.token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getCurrentUserRole();
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
    return <Navigate to={getRoleHomePath(userRole)} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
