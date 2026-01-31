import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getRoleById } from "../hooks/employee/useEmployee";
import { Navigate } from "react-router-dom";

function ProtectedRouteWithPermission({ children, path }) {
  const roleId = useSelector((state) => state?.auth?.user?.role?.id) || [];

  const { data: role, isLoading } = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
  });

  const hasAccess = (routePath) => {
    // Always allow access to the dashboard and the unauthorized page
    if (!routePath || routePath === "/" || routePath === "unauthorized")
      return true;

    // Check for permission. For routes like 'resident/:id', it checks for '/resident'.
    const baseRoute = `/${routePath.split("/")[0]}`;
    return role?.permissions?.includes(baseRoute);
  };
  if (hasAccess(path)) {
    return children;
  }

  if (!isLoading) {
    return <Navigate to="/unauthorized" replace />;
  }
  // If no access, redirect to an "unauthorized" page
}

export default ProtectedRouteWithPermission;
