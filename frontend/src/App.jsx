import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ItemsPage from "./pages/ItemsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      {/* Private */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ItemsPage />
          </ProtectedRoute>
        }
      />
      {/* Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
