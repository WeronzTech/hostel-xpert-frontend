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

/**
 * Route → Module map
 * Maps root routes to the corresponding client subscription module
 */
const ROUTE_MODULE_MAP = {
  "/property": "properties",
  "/floor": "properties",
  "/rooms": "properties",
  "/monthlyRent": "users",
  "/dailyRent": "users",
  "/food-only": "users",
  "/resident": "users",
  "/employees": "users",
  "/attendance": "timeOff",
  "/leave": "timeOff",
  "/mess": "kitchen",
  "/kitchen": "kitchen",
  "/stock-usage": "kitchen",
  "/inventory": "kitchen",
  "/menu": "kitchen",
  "/accounts": "accounts",
  "/accounting": "accounts",
};

function ProtectedRouteWithPermission({children}) {
  const location = useLocation();
  const user = useSelector((state) => state?.auth?.user);
  const roleId = user?.role?.id;
  const activeModules = user?.activeModules || [];

  const {data: role, isLoading} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
    enabled: !!roleId,
  });

  if (isLoading) return null;

  const permissions = role?.permissions || [];
  const pathname = location.pathname;

  // 🧱 Client Module Check
  let isModuleDeactivated = false;
  for (const [routePrefix, moduleName] of Object.entries(ROUTE_MODULE_MAP)) {
    if (pathname.startsWith(routePrefix) && !activeModules.includes(moduleName)) {
      isModuleDeactivated = true;
      break;
    }
  }

  if (isModuleDeactivated) {
    return <Navigate to="/unauthorized" replace />;
  }

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
