import {useEffect, useState} from "react";
import {
  DatePicker,
  Modal,
  Input,
  Form,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import dayjs from "dayjs";
import {updateRentAndDates} from "../../hooks/users/useUser";
import useResponsiveObserver from "antd/es/_util/responsiveObserver";
import {InfoCircleOutlined} from "@ant-design/icons";

const {Text} = Typography;

export const RentUpdateModal = ({visible, onCancel, userData}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const {isMobile} = useResponsiveObserver();

  const rentType = userData?.rentType ?? userData?.type ?? "";

  const isDaily = rentType === "daily" || rentType === "dailyRent";
  const isMess = rentType === "mess";

  const stayDetails = userData?.stayDetails ?? {};
  const messDetails = userData?.messDetails ?? {};
  const financialDetails = userData?.financialDetails ?? {};

  const initialRent = isDaily
    ? (stayDetails?.dailyRent ?? userData?.rent ?? 0)
    : (messDetails?.rent ?? userData?.rent ?? 0);

  const initialNoOfDays =
    (isDaily ? stayDetails?.noOfDays : messDetails?.noOfDays) ??
    userData?.noOfDays ??
    0;

  const initialTotalAmount =
    financialDetails?.totalAmount ?? userData?.totalAmount ?? 0;

  const initialStartDate =
    (isDaily ? stayDetails?.checkInDate : messDetails?.checkInDate) ??
    userData?.checkInDate ??
    null;

  const initialEndDate =
    (isDaily ? stayDetails?.checkOutDate : messDetails?.checkOutDate) ??
    userData?.checkOutDate ??
    null;

  const [noOfDays, setNoOfDays] = useState(0);
  const [manualDaysMode, setManualDaysMode] = useState(false);
  const [rentValue, setRentValue] = useState(0);

  // Prefill form
  useEffect(() => {
    if (userData && visible) {
      form.setFieldsValue({
        rent: initialRent,
        startDate: initialStartDate ? dayjs(initialStartDate) : null,
        endDate: initialEndDate ? dayjs(initialEndDate) : null,
      });

      setNoOfDays(initialNoOfDays || 0);
      setRentValue(initialRent || 0);
      setManualDaysMode(false);
    }
  }, [userData, visible]);

  // Inclusive billing calculation
  const handleDateChange = () => {
    const values = form.getFieldsValue();

    if (values.startDate && values.endDate) {
      const diff = values.endDate.diff(values.startDate, "days");

      if (!manualDaysMode) {
        if (diff >= 0) {
          setNoOfDays(diff + 1); // inclusive
        } else {
          setNoOfDays(0);
        }
      }
    }
  };

  const {mutate, isPending} = useMutation({
    mutationFn: updateRentAndDates,
    onSuccess: (res) => {
      messageApi.success(res.message);
      queryClient.invalidateQueries(["user", userData._id]);
      onCancel();
    },
    onError: (error) => {
      messageApi.error(error.message || "Update failed");
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();

    if (!noOfDays || noOfDays <= 0) {
      return messageApi.error("Number of days must be greater than 0");
    }

    const payload = {
      userId: userData._id,
      noOfDays,
    };

    if (isDaily) {
      payload.dailyRent = rentValue;
      payload.checkInDate = values.startDate.format("YYYY-MM-DD");
      payload.checkOutDate = values.endDate.format("YYYY-MM-DD");
    }

    if (isMess) {
      payload.rent = rentValue;
      payload.messStartDate = values.startDate.format("YYYY-MM-DD");
      payload.messEndDate = values.endDate.format("YYYY-MM-DD");
    }

    mutate(payload);
  };

  const newTotal = (noOfDays || 0) * (rentValue || 0);
  const difference = newTotal - initialTotalAmount;

  return (
    <>
      {contextHolder}
      <Modal
        title="Update Rent & Dates"
        open={visible}
        onOk={handleSubmit}
        onCancel={onCancel}
        confirmLoading={isPending}
        okText="Update"
        width={450}
      >
        <Form form={form} layout="vertical">
          {/* Rent */}
          <Form.Item
            label="Rent per Day"
            name="rent"
            rules={[{required: true, message: "Please enter rent"}]}
          >
            <Input
              prefix="₹"
              type="number"
              value={rentValue}
              onChange={(e) => {
                const value = Number(e.target.value);
                setRentValue(value);
                form.setFieldValue("rent", value);
              }}
            />
          </Form.Item>

          {/* Start Date */}
          <Form.Item
            label={isDaily ? "Check-in Date" : "Mess Start Date"}
            name="startDate"
            rules={[{required: true, message: "Select start date"}]}
          >
            <DatePicker style={{width: "100%"}} onChange={handleDateChange} />
          </Form.Item>

          {/* End Date */}
          <Form.Item
            label={isDaily ? "Check-out Date" : "Mess End Date"}
            name="endDate"
            rules={[{required: true, message: "Select end date"}]}
          >
            <DatePicker
              style={{width: "100%"}}
              onChange={handleDateChange}
              disabledDate={(current) => {
                const start = form.getFieldValue("startDate");
                return start && current < start.startOf("day");
              }}
            />
          </Form.Item>

          {/* Manual Days */}
          <Form.Item label="Total Days">
            <Input
              type="number"
              min={1}
              value={noOfDays}
              onChange={(e) => {
                setManualDaysMode(true);
                setNoOfDays(Number(e.target.value));
              }}
            />
          </Form.Item>

          {/* Summary */}
          <div
            style={{
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 6,
              marginTop: 10,
            }}
          >
            <Text strong>
              {noOfDays} day{noOfDays !== 1 ? "s" : ""}
            </Text>
            <br />

            <Text>
              Current Total: ₹{initialTotalAmount.toLocaleString("en-IN")}
            </Text>
            <br />

            <Text>New Total: ₹{newTotal.toLocaleString("en-IN")}</Text>
            <br />

            <Text type={difference >= 0 ? "success" : "danger"}>
              Difference: {difference >= 0 ? "+" : "-"}₹
              {Math.abs(difference).toLocaleString("en-IN")}
            </Text>
          </div>
          <Row style={{marginTop: isMobile ? 8 : 12}}>
            <Col span={24}>
              <Text
                type="warning"
                style={{fontSize: isMobile ? "11px" : "12px"}}
              >
                <InfoCircleOutlined
                  style={{
                    fontSize: isMobile ? "11px" : "12px",
                    marginRight: 4,
                  }}
                />
                Total Days are calculated based on the selected date range. You
                can edit the total days manually if needed
              </Text>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};
