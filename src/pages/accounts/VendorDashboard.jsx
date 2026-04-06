import React, { useState } from "react";
import { Table, Button, Tag, Space, Typography, Popconfirm, Input } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getAllVendors } from "../../hooks/accounts/useAccounts";
import { PageHeader } from "../../components";
import AddVendorModal from "../../modals/accounts/AddVendorModal";
import EditVendorModal from "../../modals/accounts/EditVendorModal";
import VendorSummaryModal from "../../modals/accounts/VendorSummaryModal";

const { Title } = Typography;
const { Search } = Input;

const VendorDashboard = () => {
  const { selectedProperty } = useSelector((state) => state.properties);
  const { user } = useSelector((state) => state.auth);
  // Derive clientId robustly based on your app's structure
  const clientId = selectedProperty?.client || selectedProperty?.clientId || user?.clientId || user?.client; 
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSummaryModalVisible, setIsSummaryModalVisible] = useState(false);
  
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { data: vendors, isLoading, refetch } = useQuery({
    queryKey: ["vendors", clientId],
    queryFn: () => getAllVendors({ clientId }),
    enabled: !!clientId,
  });

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setIsEditModalVisible(true);
  };

  const handleViewSummary = (vendor) => {
    setSelectedVendor(vendor);
    setIsSummaryModalVisible(true);
  };

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "vendorName",
      key: "vendorName",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => 
        String(record.vendorName).toLowerCase().includes(String(value).toLowerCase()) ||
        String(record.mobileNumber).includes(value),
    },
    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "Type",
      dataIndex: "vendorType",
      key: "vendorType",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            className="text-blue-500" 
            onClick={() => handleViewSummary(record)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="text-orange-500" 
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <PageHeader
        title="Vendor Management"
        subtitle="Manage vendors and view their expenses"
      />
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Search
            placeholder="Search vendor name or mobile..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Vendor
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={vendors?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <AddVendorModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={refetch}
        clientId={clientId}
      />

      <EditVendorModal
        visible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedVendor(null);
        }}
        onSuccess={refetch}
        vendor={selectedVendor}
      />

      <VendorSummaryModal
        visible={isSummaryModalVisible}
        onClose={() => {
          setIsSummaryModalVisible(false);
          setSelectedVendor(null);
        }}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default VendorDashboard;
