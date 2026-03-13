import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useSelector((s) => s.auth);
  const location = useLocation();

  if (loading) return <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}><span>Loading...</span></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
