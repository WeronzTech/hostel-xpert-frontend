import React, { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Row, Col, Spin } from 'antd';
import { useSelector } from 'react-redux';
import { addFloor, updateFloor } from '../../hooks/property/useProperty.js';

const { Option } = Select;
const { TextArea } = Input;

const FloorModal = ({ 
  visible, 
  editingFloor, 
  selectedProperty, 
  onSuccess, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingFloor) {
        // Update existing floor - send floorId as separate parameter
        const updateData = {
          floorName: values.floorName,
          floorNo: values.floorNo,
          roomCapacity: values.roomCapacity,
          status: values.status,
          description: values.description || '',
          adminName: user.name,
          isHeavens: false // Set as default false for updates
        };
        
        console.log('Updating floor with ID:', editingFloor._id, 'Data:', updateData);
        
        const response = await updateFloor(updateData, editingFloor._id);
        
        if (response.success) {
          message.success('Floor updated successfully');
          onSuccess();
        } else {
          message.error(response.message || 'Failed to update floor');
        }
      } else {
        // Create new floor - set isHeavens to true for new floors
        const floorData = {
          floorName: values.floorName,
          floorNo: values.floorNo,
          roomCapacity: values.roomCapacity,
          status: values.status,
          description: values.description || '',
          isHeavens: true, // Set as true for new floor creation
          propertyId: selectedProperty.id,
          adminName: user.name,
        };
        
        console.log('Creating new floor:', floorData);

        const response = await addFloor(floorData);
        
        if (response.success) {
          message.success('Floor created successfully');
          onSuccess();
        } else {
          message.error(response.message || 'Failed to create floor');
        }
      }
      
    } catch (errorInfo) {
      console.log('Validation or API failed:', errorInfo);
      if (errorInfo.message) {
        message.error(errorInfo.message);
      } else {
        message.error('Failed to save floor data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const title = editingFloor 
    ? `Edit Floor - ${editingFloor.floorName}` 
    : `Add New Floor - ${selectedProperty?.name}`;

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={600}
      okText={editingFloor ? 'Update Floor' : 'Create Floor'}
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          name="floorForm"
          initialValues={
            editingFloor ? {
              floorName: editingFloor.floorName,
              floorNo: editingFloor.floorNo,
              roomCapacity: editingFloor.roomCapacity,
              description: editingFloor.description,
              status: editingFloor.status,
              // Remove isHeavens from initial values since it's handled in the backend
            } : {
              status: 'Active'
              // Remove isHeavens default since it's always true for new floors
            }
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="floorName"
                label="Floor Name"
                rules={[{ required: true, message: 'Please enter floor name' }]}
              >
                <Input placeholder="e.g., Ground Floor, First Floor, etc." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="floorNo"
                label="Floor Number"
                rules={[{ required: true, message: 'Please enter floor number' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="e.g., 0, 1, 2"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roomCapacity"
                label="Room Capacity"
                rules={[{ required: true, message: 'Please enter room capacity' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="e.g., 10, 20, 30"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select floor status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                  <Option value="Maintenance">Maintenance</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={3}
              placeholder="Enter floor description (optional)..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* No visible toggle - isHeavens is automatically true for new floors */}
        </Form>
      </Spin>
    </Modal>
  );
};

export default FloorModal;