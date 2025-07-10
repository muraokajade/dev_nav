import { ReactElement, ReactNode } from "react";
import { useAuth } from "../context/useAuthContext";
import { Navigate } from "react-router-dom";

export const AdminRoute = ({ children }: { children: ReactElement }) => {
  const { isAdmin, loading } = useAuth();

  if (loading || isAdmin === null) return <p>Loading...</p>;

  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};
