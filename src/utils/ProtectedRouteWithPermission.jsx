import {useLocation, Navigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {getRoleById} from "../hooks/employee/useEmployee";

/**
 * Route → Permission inheritance map
 * Child routes can be accessed if user has ANY of the listed permissions
 */
const ROUTE_PERMISSION_MAP = {
  "/resident": ["/monthlyRent", "/dailyRent", "/food-only"],
};

function ProtectedRouteWithPermission({children}) {
  const location = useLocation();
  const roleId = useSelector((state) => state?.auth?.user?.role?.id);

  const {data: role, isLoading} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
    enabled: !!roleId,
  });

  if (isLoading) return null;

  const permissions = role?.permissions || [];
  const pathname = location.pathname;

  // 🔓 Super Admin
  if (permissions.includes("ALL_PRIVILEGES")) {
    return children;
  }

  // 🚫 Always allow unauthorized page
  if (pathname === "/unauthorized") {
    return children;
  }

  // 🏠 Dashboard logic
  if (pathname === "/") {
    if (permissions.includes("/")) {
      return children;
    }

    // Redirect to first allowed page
    const firstRoute = permissions[0];
    return firstRoute ? (
      <Navigate to={firstRoute} replace />
    ) : (
      <Navigate to="/unauthorized" replace />
    );
  }

  // ✅ Direct permission match
  const directAccess = permissions.some((perm) => pathname.startsWith(perm));

  // 🔁 Inherited permission match (dynamic routes)
  const inheritedAccess = Object.entries(ROUTE_PERMISSION_MAP).some(
    ([route, allowedPerms]) =>
      pathname.startsWith(route) &&
      allowedPerms.some((p) => permissions.includes(p)),
  );

  if (directAccess || inheritedAccess) {
    return children;
  }

  // ❌ No access
  return <Navigate to="/unauthorized" replace />;
}

export default ProtectedRouteWithPermission;
