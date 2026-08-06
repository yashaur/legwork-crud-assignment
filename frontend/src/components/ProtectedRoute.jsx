import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ children }) {
  const access_token = useSelector((state) => state.auth.access);

  return access_token ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
