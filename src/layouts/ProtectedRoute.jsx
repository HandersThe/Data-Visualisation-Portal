import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
    const { currentUser, userRole } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        // If user is logged in but doesn't have permission, redirect to their dashboard or home
        // For now, if admin is required but user is viewer, go to user dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
