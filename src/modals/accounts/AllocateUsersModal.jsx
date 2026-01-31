import {Modal, Form, Select, Button, Space, message} from "antd";
import {useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getAllAgencies} from "../../hooks/client/useClient";
import {useSelector} from "react-redux";
import {allocateUsersToAgent, getUsers} from "../../hooks/users/useUser";
import {FaDoorOpen} from "react-icons/fa";
import {BsTelephoneFill} from "react-icons/bs";

const {Option} = Select;

const AllocateUsersModal = ({visible, onCancel, onSuccess}) => {
  const [form] = Form.useForm();
  const {properties} = useSelector((state) => state.properties);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();

  // Fetch agents using TanStack Query with hasAgency: false filter
  const {data: agents = [], isLoading: agentsLoading} = useQuery({
    queryKey: ["agents", "no-agency"],
    queryFn: async () => {
      const response = await getAllAgencies();
      const agencies = response.data || [];
      // agencies.filter((agent) => agent.hasAgency === false);
      return agencies;
    },
    enabled: visible,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch users when property is selected
  const {data: usersData, isLoading: usersLoading} = useQuery({
    queryKey: ["users", selectedProperty, true],
    queryFn: () => getUsers({propertyId: selectedProperty, all: true}),
    enabled: !!selectedProperty, // Only fetch when property is selected
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const users = usersData?.data || [];

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    form.setFieldsValue({property: undefined, users: []});
    setSelectedProperty(null);
    setSelectedUsers([]);
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    form.setFieldsValue({users: []});
    setSelectedUsers([]);
  };

  const handleUsersChange = (value) => {
    setSelectedUsers(value);
  };

  const allocateUsersMutation = useMutation({
    mutationFn: ({agentId, userIds}) => allocateUsersToAgent(agentId, userIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      messageApi.success({
        content: `${data.message}`,
        duration: 3,
      });
      form.resetFields();
      setSelectedAgent(null);
      setSelectedProperty(null);
      setSelectedUsers([]);
      onSuccess?.();
      onCancel();
    },
    onError: (error) => {
      messageApi.error({
        content: `${error.message}`,
        duration: 3,
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedAgent || !selectedProperty || selectedUsers.length === 0) {
      message.error("Please select agent, property, and at least one user");
      return;
    }

    allocateUsersMutation.mutate({
      agentId: selectedAgent,
      userIds: selectedUsers,
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedAgent(null);
    setSelectedProperty(null);
    setSelectedUsers([]);
    onCancel();
  };

  // Custom filter function for agents search
  const filterAgentOption = (input, option) => {
    const agent = agents.find((a) => a._id === option.value);
    if (!agent) return false;

    const searchText = input.toLowerCase();
    return (
      agent.agentName?.toLowerCase().includes(searchText) ||
      agent.agencyName?.toLowerCase().includes(searchText) ||
      agent.contactNumber?.includes(searchText)
    );
  };

  // Custom filter function for users search
  const filterUserOption = (input, option) => {
    const user = users.find((u) => u._id === option.value);
    if (!user) return false;

    const searchText = input.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.contactNumber?.includes(searchText) ||
      user.roomNo?.toLowerCase().includes(searchText)
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Allocate Users to Agent"
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          {/* Select Agent */}
          <Form.Item
            label="Select Agent"
            name="agent"
            rules={[{required: true, message: "Please select an agent"}]}
          >
            <Select
              placeholder="Select an agent"
              showSearch
              optionFilterProp="children"
              onChange={handleAgentChange}
              loading={agentsLoading}
              filterOption={filterAgentOption} // Use custom filter
            >
              {agents.map((agent) => {
                // Create display text for search functionality
                const displayText = `${agent.agentName} ${
                  agent.hasAgency
                    ? `(${agent.agencyName || "No agency name"})`
                    : `(${agent.contactNumber || "No contact"})`
                }`;

                return (
                  <Option key={agent._id} value={agent._id}>
                    {displayText}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Select Property - Show only after agent is selected */}
          {selectedAgent && (
            <Form.Item
              label="Select Property"
              name="property"
              rules={[{required: true, message: "Please select a property"}]}
            >
              <Select
                placeholder="Select a property"
                onChange={handlePropertyChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {properties
                  .filter((property) => property._id) // ✅ exclude null or undefined IDs
                  .map((property) => (
                    <Option key={property._id} value={property._id}>
                      {property.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          {/* Select Users - Show only after property is selected */}
          {selectedProperty && (
            <Form.Item
              label={`Select Users (${selectedUsers.length} / ${users.length})`}
              name="users"
              rules={[
                {required: true, message: "Please select at least one user"},
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select users"
                value={selectedUsers}
                onChange={handleUsersChange}
                loading={usersLoading}
                showSearch
                filterOption={filterUserOption}
                optionLabelProp="label"
              >
                {users.map((user) => {
                  return (
                    <Option
                      key={user._id}
                      value={user._id}
                      label={user.name} // Shows only name after selection
                    >
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <BsTelephoneFill size={12} />
                            {user.contactNumber || user.contact || "No contact"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaDoorOpen size={13} />
                            Room {user.roomNo || user.roomNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}

          {/* Buttons */}
          <Form.Item style={{textAlign: "right", marginBottom: 0}}>
            <Space>
              <Button
                onClick={handleCancel}
                disabled={allocateUsersMutation.isLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={allocateUsersMutation.isLoading}
                disabled={
                  !selectedAgent ||
                  !selectedProperty ||
                  selectedUsers.length === 0
                }
              >
                Allocate Users
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AllocateUsersModal;
