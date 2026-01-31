import {useState, useEffect} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useSelector} from "react-redux";
import {FiUserCheck, FiUsers, FiUserX, FiPlus} from "react-icons/fi";
import {Input, Select, DatePicker, Space, Button, message} from "antd";

import PageHeader from "../../components/common/PageHeader";
import StatsGrid from "../../components/common/StatsGrid";
import StaffTable from "../../components/employee/StaffTable";
import AddStaffModal from "../../modals/employee/staff/AddStaffModal";
import AddManagerModal from "../../modals/employee/staff/AddManagerModal";
import {
  getKitchensForDropDown,
  getStaffAccordingToKitchenId,
} from "../../hooks/inventory/useInventory";
import {
  changeManagerStatus,
  changeStaffStatus,
  deleteManager,
  deleteStaff,
} from "../../hooks/employee/useEmployee";
import EditStaffModal from "../../modals/employee/staff/EditStaffModal";
import EditManagerModal from "../../modals/employee/staff/EditManagerModal";
import DeleteEmployeeModal from "../../modals/employee/staff/DeleteEmployeeModal";

const {Search} = Input;
const {Option} = Select;

const EmployeeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [joinDateFilter, setJoinDateFilter] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filter, setFilter] = useState({manager: "true"});
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);
  const [isEditManagerModalOpen, setIsEditManagerModalOpen] = useState(false);
  const [isDeleteEmployeeModalOpen, setIsDeleteEmployeeModalOpen] =
    useState(false);

  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const [stats, setStats] = useState([
    {
      title: "Total Employees",
      value: 0,
      icon: <FiUsers className="text-xl" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Active Employees",
      value: 0,
      icon: <FiUserCheck className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Inactive Employees",
      value: 0,
      icon: <FiUserX className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
  ]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const newFilter = {manager: "true"};

    if (selectedPropertyId) newFilter.propertyId = selectedPropertyId;
    if (debouncedSearchTerm) newFilter.name = debouncedSearchTerm;
    if (statusFilter) newFilter.status = statusFilter;
    if (joinDateFilter)
      newFilter.joinDate = joinDateFilter.format("YYYY-MM-DD");

    setFilter(newFilter);
  }, [debouncedSearchTerm, statusFilter, joinDateFilter, selectedPropertyId]);

  const {data: staffData, isLoading} = useQuery({
    queryKey: ["staff-list", filter],
    queryFn: () => getStaffAccordingToKitchenId(filter),
  });

  const {data: kitchens} = useQuery({
    queryKey: ["kitchens"],
    queryFn: getKitchensForDropDown,
  });

  const handleChangeManagerStatus = useMutation({
    mutationFn: (managerId) => changeManagerStatus(managerId),
    onSuccess: () => {
      messageApi.success("Manager status changed successfully!");
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to change manager status."
      );
    },
  });

  const handleChangeStaffStatus = useMutation({
    mutationFn: (staffId) => changeStaffStatus(staffId),
    onSuccess: () => {
      messageApi.success("Staff status changed successfully!");
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to change staff status."
      );
    },
  });

  const handleDeleteStaff = useMutation({
    mutationFn: (staffId) => deleteStaff(staffId),
    onSuccess: () => {
      messageApi.success("Staff deleted successfully!");
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to delete staff."
      );
    },
  });

  const handleDeleteManager = useMutation({
    mutationFn: (staffId) => deleteManager(staffId),
    onSuccess: () => {
      messageApi.success("Manager deleted successfully!");
      queryClient.invalidateQueries({queryKey: ["staff-list"]});
    },
    onError: (error) => {
      messageApi.error(
        error.response?.data?.message || "Failed to delete manager."
      );
    },
  });

  useEffect(() => {
    if (staffData?.staff) {
      const staffList = staffData.staff;
      const activeCount = staffList.filter((s) => s.status === "Active").length;
      const inactiveCount = staffList.length - activeCount;

      setStats([
        {
          title: "Total Employees",
          value: staffData.count || 0,
          icon: <FiUsers className="text-xl" />,
          color: "bg-indigo-100 text-indigo-600",
        },
        {
          title: "Active Employees",
          value: activeCount,
          icon: <FiUserCheck className="text-xl" />,
          color: "bg-green-100 text-green-600",
        },
        {
          title: "Inactive Employees",
          value: inactiveCount,
          icon: <FiUserX className="text-xl" />,
          color: "bg-red-100 text-red-600",
        },
      ]);
    }
  }, [staffData]);

  const handleEdit = (record) => {
    setSelectedData(record);
    if (record.managerId) {
      setIsEditManagerModalOpen(true);
    }
    if (record.staffId) {
      setIsEditStaffModalOpen(true);
    }
  };

  const handleDelete = (record) => {
    setSelectedData(record);
    setIsDeleteEmployeeModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedData) return;

    if (selectedData.managerId) {
      handleDeleteManager.mutate(selectedData._id);
    } else {
      handleDeleteStaff.mutate(selectedData._id);
    }
    setIsDeleteEmployeeModalOpen(false);
  };
  const handleStatusChange = (record) => {
    if (record.managerId) {
      handleChangeManagerStatus.mutate(record._id);
    }
    if (record.staffId) {
      handleChangeStaffStatus.mutate(record._id);
    }
  };

  return (
    <>
      {contextHolder}
      <div>
        <PageHeader
          title="Employee Overview"
          subtitle="Manage employee records and payment details"
        />
        <StatsGrid stats={stats} />

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex justify-between items-center">
          {/* Filters on the left */}
          <Space wrap>
            <Search
              placeholder="Search by employee name..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: 250}}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              onChange={(value) => setStatusFilter(value)}
              style={{width: 200}}
              allowClear
            >
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
            <DatePicker
              placeholder="Filter by join date"
              onChange={(date) => setJoinDateFilter(date)}
              style={{width: 200}}
            />
          </Space>

          {/* Action Buttons on the right */}
          <Space>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsAddStaffModalOpen(true)}
            >
              Add Employee
            </Button>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => setIsAddManagerModalOpen(true)}
            >
              Add Manager
            </Button>
          </Space>
        </div>

        <StaffTable
          staffList={staffData?.staff}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
        <AddStaffModal
          kitchens={kitchens}
          open={isAddStaffModalOpen}
          onClose={() => setIsAddStaffModalOpen(false)}
        />
        <AddManagerModal
          open={isAddManagerModalOpen}
          onClose={() => setIsAddManagerModalOpen(false)}
        />
        <EditStaffModal
          open={isEditStaffModalOpen}
          onClose={() => setIsEditStaffModalOpen(false)}
          staff={selectedData}
        />
        <EditManagerModal
          open={isEditManagerModalOpen}
          onClose={() => setIsEditManagerModalOpen(false)}
          manager={selectedData}
        />
        <DeleteEmployeeModal
          open={isDeleteEmployeeModalOpen}
          onClose={() => setIsDeleteEmployeeModalOpen(false)}
          onConfirm={handleConfirmDelete}
          loading={handleDeleteStaff.isPending || handleDeleteManager.isPending}
        />
      </div>
    </>
  );
};

export default EmployeeDashboard;
