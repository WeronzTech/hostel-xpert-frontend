import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {getRoleById} from "../hooks/employee/useEmployee";

export const useHasPermission = (requiredPermission) => {
  const roleId = useSelector((state) => state?.auth?.user?.role?.id);

  const {data: role} = useQuery({
    queryKey: ["get-role", roleId],
    queryFn: () => getRoleById(roleId),
    enabled: !!roleId,
  });

  const permissions = role?.permissions || [];

  if (permissions.includes("ALL_PRIVILEGES")) return true;

  return permissions.includes(requiredPermission);
};
