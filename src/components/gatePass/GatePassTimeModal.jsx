import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import {
  createGatePassTiming,
  deleteGatePassTiming,
  getAllGatePassTimings,
  updateGatePassTiming,
} from "../../hooks/users/useUser";
import { useState } from "react";
import { useSelector } from "react-redux";

// 🔹 ADDED: New Component for Managing Timing Rules
const GatePassTimeModal = ({ visible, onClose, propertyId }) => {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const queryClient = useQueryClient();

  // Mutations
  const createMutation = useMutation({ mutationFn: createGatePassTiming });
  const updateMutation = useMutation({ mutationFn: updateGatePassTiming });
  const deleteMutation = useMutation({ mutationFn: deleteGatePassTiming });

  const { data: timingRules, isLoading } = useQuery({
    queryKey: ["gatePassTimings", propertyId],
    queryFn: () => getAllGatePassTimings({ propertyId }), // You'll need to add this hook
    enabled: !!visible,
  });

  // Fetch existing timing rules
  const handleFinish = async (values) => {
    const payload = { ...values };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
      message.success("Timing updated");
    } else {
      await createMutation.mutateAsync(payload);
      message.success("Timing created");
    }

    queryClient.invalidateQueries(["gatePassTimings"]);
    form.resetFields();
    setEditingId(null);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    form.setFieldsValue(record);
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
    message.success("Timing deleted");
    queryClient.invalidateQueries(["gatePassTimings"]);
  };

  const filterOption = (input, option) => {
    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const allProperties = useSelector(
    (state) => state.properties.properties || [],
  );
  const properties = allProperties.filter((property) => property._id !== null);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <strong>{text || "Untitled Rule"}</strong>,
    },
    { title: "Time", render: (_, r) => `${r.startTime} - ${r.endTime}` },
    {
      title: "Days",
      dataIndex: "applicableDays",
      render: (days) => days.join(", "),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this rule?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="Gate Pass Timing Rules"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={8} lg={8}>
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="Enter a title" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Start Time"
              rules={[{ required: true }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="End Time"
              rules={[{ required: true }]}
            >
              <Input type="time" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="applicableDays"
              label="Days"
              rules={[{ required: true }]}
            >
              <Select mode="multiple" placeholder="Select Days">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              name="propertyId"
              label="Properties"
              rules={[
                {
                  required: true,
                  message: "Please select at least one property",
                },
              ]}
            >
              <Select
                placeholder="Select properties"
                allowClear
                showSearch
                filterOption={filterOption}
                optionFilterProp="children"
              >
                {properties.map((property) => (
                  <Option key={property._id} value={property._id}>
                    {property.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" block>
          {editingId ? "Update Rule" : "Add Rule"}
        </Button>
        {editingId && (
          <Button
            type="link"
            onClick={() => {
              setEditingId(null);
              form.resetFields();
            }}
          >
            Cancel Edit
          </Button>
        )}
      </Form>
      <Divider />
      <Table
        dataSource={timingRules}
        columns={columns}
        pagination={false}
        rowKey="_id"
      />
    </Modal>
  );
};

export default GatePassTimeModal;
