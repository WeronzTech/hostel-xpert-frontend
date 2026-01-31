import { Modal, Form, Input, Select, message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRoles, getAllRoles } from "../../../hooks/employee/useEmployee";

const { Option } = Select;

const routePermissions = [
  { label: "Dashboard", value: "/" },
  { label: "Onboarding Approval", value: "/onboarding/:id" },
  { label: "Rejoin Onboarding", value: "/onboarding/rejoin/:id" },
  { label: "Accounts Dashboard", value: "/accounts" },
  { label: "Monthly Rent Management", value: "/monthlyRent" },
  { label: "Resident", value: "/resident" },
  { label: "Resident Details", value: "/resident/:id" },
  { label: "Edit Resident", value: "/resident/:id/edit" },
  { label: "Daily Rent Management", value: "/dailyRent" },
  { label: "Mess-Only Rent Management", value: "/food-only" },
  { label: "Property Dashboard", value: "/property" },
  { label: "Room Allocation", value: "/rooms" },
  { label: "Maintenance Dashboard", value: "/maintenance" },
  { label: "Employee Management", value: "/employees" },
  { label: "Employee Details", value: "/employees/:id" },
  { label: "Add Property", value: "/add-property" },
  { label: "Edit Property", value: "/property/edit/:id" },
  { label: "Property Details", value: "/property/:id" },
  { label: "Mess Orders", value: "/mess" },
  { label: "Mess Menu Page", value: "/mess/create" },
  { label: "Add Mess Menu", value: "/mess/create/menu" },
  { label: "Edit Mess Menu", value: "/mess/edit" },
  { label: "Addon Orders", value: "/addons" },
  { label: "Create Addon", value: "/addons/create" },
  { label: "Inventory Details", value: "/inventory" },
  { label: "Kitchen Management", value: "/kitchen" },
  { label: "Kitchen Details", value: "/kitchen/:kitchenId" },
  { label: "Dead Stock Log", value: "/kitchen/dead-stock" },
  { label: "Recipe Management", value: "/kitchen/recipe/:recipeCategoryId" },
  { label: "Push Notifications", value: "/notification/push-notification" },
  { label: "Alert Notifications", value: "/notification/alert-notification" },
  { label: "Notification Logs", value: "/notification/notification-logs" },
  { label: "Offboarding Management", value: "/offboarding" },
  { label: "Activity Logs", value: "/activity-logs" },
  { label: "Onboarding Management", value: "/onboarding" },
  { label: "Today's Checkouts", value: "/todays-checkout" },
  { label: "ACCOUNTS_VIEW", value: "ACCOUNTS_VIEW" },
  { label: "ACCOUNTS_MANAGE", value: "ACCOUNTS_MANAGE" },
  { label: "ACCOUNTS_DASHBOARD_VIEW", value: "ACCOUNTS_DASHBOARD_VIEW" },
  { label: "COMMISSION_VIEW", value: "COMMISSION_VIEW" },
  { label: "COMMISSION_MANAGE", value: "COMMISSION_MANAGE" },
  { label: "DEPOSIT_VIEW", value: "DEPOSIT_VIEW" },
  { label: "DEPOSIT_MANAGE", value: "DEPOSIT_MANAGE" },
  { label: "EXPENSE_VIEW", value: "EXPENSE_VIEW" },
  { label: "EXPENSE_MANAGE", value: "EXPENSE_MANAGE" },
  { label: "FEE_PAYMENT_VIEW", value: "FEE_PAYMENT_VIEW" },
  { label: "FEE_PAYMENT_MANAGE", value: "FEE_PAYMENT_MANAGE" },
  { label: "SALARY_VIEW", value: "SALARY_VIEW" },
  { label: "SALARY_MANAGE", value: "SALARY_MANAGE" },
  { label: "VOUCHER_VIEW", value: "VOUCHER_VIEW" },
  { label: "VOUCHER_MANAGE", value: "VOUCHER_MANAGE" },
  { label: "LOGS_ACCOUNTS_VIEW", value: "LOGS_ACCOUNTS_VIEW" },
  { label: "ROLES_VIEW", value: "ROLES_VIEW" },
  { label: "ROLES_MANAGE", value: "ROLES_MANAGE" },
  { label: "CLIENT_MANAGE", value: "CLIENT_MANAGE" },
  { label: "AGENCY_VIEW", value: "AGENCY_VIEW" },
  { label: "AGENCY_MANAGE", value: "AGENCY_MANAGE" },
  { label: "MANAGER_VIEW", value: "MANAGER_VIEW" },
  { label: "MANAGER_MANAGE", value: "MANAGER_MANAGE" },
  { label: "PETTY_CASH_VIEW", value: "PETTY_CASH_VIEW" },
  { label: "PETTY_CASH_MANAGE", value: "PETTY_CASH_MANAGE" },
  { label: "INVENTORY_VIEW", value: "INVENTORY_VIEW" },
  { label: "INVENTORY_MANAGE", value: "INVENTORY_MANAGE" },
  { label: "ADDON_VIEW", value: "ADDON_VIEW" },
  { label: "ADDON_MANAGE", value: "ADDON_MANAGE" },
  { label: "CATEGORY_VIEW", value: "CATEGORY_VIEW" },
  { label: "CATEGORY_MANAGE", value: "CATEGORY_MANAGE" },
  { label: "KITCHEN_VIEW", value: "KITCHEN_VIEW" },
  { label: "KITCHEN_MANAGE", value: "KITCHEN_MANAGE" },
  { label: "MENU_VIEW", value: "MENU_VIEW" },
  { label: "MENU_MANAGE", value: "MENU_MANAGE" },
  { label: "BOOKING_VIEW", value: "BOOKING_VIEW" },
  { label: "BOOKING_MANAGE", value: "BOOKING_MANAGE" },
  { label: "LOGS_INVENTORY_VIEW", value: "LOGS_INVENTORY_VIEW" },
  { label: "NOTIFICATION_VIEW", value: "NOTIFICATION_VIEW" },
  { label: "NOTIFICATION_MANAGE", value: "NOTIFICATION_MANAGE" },
  { label: "PROPERTY_VIEW", value: "PROPERTY_VIEW" },
  { label: "PROPERTY_MANAGE", value: "PROPERTY_MANAGE" },
  { label: "ATTENDANCE_VIEW", value: "ATTENDANCE_VIEW" },
  { label: "ATTENDANCE_MANAGE", value: "ATTENDANCE_MANAGE" },
  { label: "CAROUSEL_VIEW", value: "CAROUSEL_VIEW" },
  { label: "CAROUSEL_MANAGE", value: "CAROUSEL_MANAGE" },
  { label: "MAINTENANCE_VIEW", value: "MAINTENANCE_VIEW" },
  { label: "MAINTENANCE_MANAGE", value: "MAINTENANCE_MANAGE" },
  { label: "ROOM_VIEW", value: "ROOM_VIEW" },
  { label: "ROOM_MANAGE", value: "ROOM_MANAGE" },
  { label: "STAFF_VIEW", value: "STAFF_VIEW" },
  { label: "STAFF_MANAGE", value: "STAFF_MANAGE" },
  { label: "LOGS_PROPERTY_VIEW", value: "LOGS_PROPERTY_VIEW" },
  { label: "PROPERTY_DASHBOARD_VIEW", value: "PROPERTY_DASHBOARD_VIEW" },
  { label: "USER_VIEW", value: "USER_VIEW" },
  { label: "USER_MANAGE", value: "USER_MANAGE" },
  { label: "USER_APPROVAL", value: "USER_APPROVAL" },
  { label: "USER_STATUS_MANAGE", value: "USER_STATUS_MANAGE" },
  { label: "REFERRAL_VIEW", value: "REFERRAL_VIEW" },
  { label: "REFERRAL_MANAGE", value: "REFERRAL_MANAGE" },
  { label: "REMINDER_VIEW", value: "REMINDER_VIEW" },
  { label: "REMINDER_MANAGE", value: "REMINDER_MANAGE" },
  { label: "LOGS_USER_VIEW", value: "LOGS_USER_VIEW" },
  { label: "SOCKET_MANAGE", value: "SOCKET_MANAGE" },
  { label: "ALL_PRIVILEGES", value: "ALL_PRIVILEGES" },
  { label: "GAMING_ITEM_MANAGE", value: "GAMING_ITEM_MANAGE" },
  { label: "GAMING_ITEM_VIEW", value: "GAMING_ITEM_VIEW" },
  { label: "GAMING_ORDER_MANAGE", value: "GAMING_ORDER_MANAGE" },
  { label: "GAMING_ORDER_VIEW", value: "GAMING_ORDER_VIEW" },
];

const AddRoleModal = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getAllRoles(),
  });

  const handleAddRole = useMutation({
    mutationFn: (data) => addRoles(data),
    onSuccess: () => {
      messageApi.success("Role added successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onClose();
      form.resetFields();
    },
    onError: (error) => {
      messageApi.error(error.response?.data?.message || "Failed to add role.");
    },
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      handleAddRole.mutate(values);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Add New Role"
        open={open}
        onOk={handleOk}
        onCancel={onClose}
        confirmLoading={handleAddRole.isPending}
        okText="Save Role"
      >
        <Form form={form} layout="vertical" name="addRoleForm">
          <Form.Item
            name="roleName"
            label="Role Name"
            rules={[{ required: true, message: "Please enter the role name." }]}
          >
            <Input placeholder="e.g., Property Manager" />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[
              {
                required: true,
                message: "Please add at least one permission.",
              },
            ]}
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Select permissions for this role"
              options={routePermissions}
            />
          </Form.Item>
          <Form.Item name="reportTo" label="Reports To (Optional)">
            <Select
              placeholder="Select a role they report to"
              loading={rolesLoading}
              allowClear
            >
              {rolesData?.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.roleName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddRoleModal;
