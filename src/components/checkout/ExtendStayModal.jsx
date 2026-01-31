import {useState} from "react";
import {DatePicker, Modal, Input, Form, Typography, Card, message} from "antd";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import dayjs from "dayjs";
import {extendUserDays} from "../../hooks/users/useUser";
import {useSelector} from "react-redux";

const {Text} = Typography;

export const ExtendStayModal = ({
  visible,
  onCancel,
  userId,
  currentCheckOutDate,
  currentRent,
  userType,
  extendDate,
}) => {
  const {user} = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [extensionDays, setExtensionDays] = useState(0);
  const [newRent, setNewRent] = useState(currentRent);

  const [messageApi, contextHolder] = message.useMessage();

  const {mutate: extendStay, isPending} = useMutation({
    mutationFn: (extendData) => extendUserDays(userId, extendData),
    onSuccess: () => {
      messageApi.success({
        content: `Stay extended successfully`,
        duration: 3,
      });
      queryClient.invalidateQueries(["todayCheckouts"]);
      queryClient.invalidateQueries({queryKey: ["dailyRentUsers"]});
      queryClient.invalidateQueries({queryKey: ["user", userId]});

      onCancel();
    },
    onError: (error) => {
      messageApi.error({
        content: error.message || "Failed to extend stay. Please try again.",
        duration: 3,
      });
    },
  });

  const handleDateChange = (date) => {
    if (!date) {
      setExtensionDays(0);
      return;
    }

    // Determine which date to use as the base
    const baseDate = extendDate
      ? dayjs(extendDate)
      : dayjs(currentCheckOutDate);

    // Calculate difference in days
    let days = date.diff(baseDate, "days");

    // Add +1 only if base date exists and is today
    const today = dayjs();
    if (
      (extendDate && baseDate.isSame(today, "day")) ||
      (!extendDate && baseDate.isSame(today, "day"))
    ) {
      days += 1;
    }

    setExtensionDays(days);
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      extendStay({
        extendDate: form.getFieldValue("extendDate").format("YYYY-MM-DD"),
        additionalDays: extensionDays,
        newRentAmount: newRent,
        adminName: user.name,
      });
    });
  };

  const disabledDate = (current) => {
    return (
      current &&
      current <= dayjs(extendDate || currentCheckOutDate).endOf("day")
    );
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Extend Stay"
        open={visible}
        centered
        onOk={handleSubmit}
        onCancel={onCancel}
        confirmLoading={isPending}
        okText={`Extend by ${extensionDays} day${
          extensionDays !== 1 ? "s" : ""
        }`}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Card size="small" style={{marginBottom: 10, background: "#f9f9f9"}}>
            <div style={{marginBottom: 2}}>
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "12px 16px",
                  borderRadius: 8,
                  borderLeft: "4px solid #1890ff",
                }}
              >
                <Text strong style={{display: "block", marginBottom: 0}}>
                  {userType === "messOnly"
                    ? "Your Current Mess Plan"
                    : "Your Current Stay"}
                </Text>

                <div style={{display: "flex", gap: 24}}>
                  <div>
                    <Text type="secondary" style={{fontSize: 12}}>
                      {userType === "messOnly"
                        ? "Valid until"
                        : "Checking out on"}
                    </Text>
                    <div style={{fontWeight: 500, marginTop: 4}}>
                      {dayjs(extendDate || currentCheckOutDate).format(
                        "ddd, D MMM YYYY"
                      )}
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" style={{fontSize: 12}}>
                      {userType === "messOnly" ? "Daily rate" : "Daily rent"}
                    </Text>
                    <div style={{fontWeight: 500, marginTop: 4}}>
                      ₹{currentRent?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Form.Item
            label={
              userType === "messOnly"
                ? "Select new date"
                : "Select new checkout date"
            }
            name="extendDate"
            rules={[{required: true}]}
          >
            <DatePicker
              style={{width: "100%"}}
              disabledDate={disabledDate}
              onChange={handleDateChange}
            />
          </Form.Item>

          {extensionDays > 0 && (
            <>
              <Form.Item
                label={
                  userType === "messOnly"
                    ? "New rate per day"
                    : "New rent per day"
                }
              >
                <Input
                  prefix="₹"
                  value={newRent}
                  onChange={(e) => setNewRent(e.target.value)}
                />
              </Form.Item>

              <div
                style={{
                  background: "#f0f7ff",
                  padding: 12,
                  borderRadius: 4,
                  marginTop: 16,
                }}
              >
                <Text strong>Extension Summary</Text>
                <div style={{marginTop: 8}}>
                  <Text>
                    {extensionDays} day{extensionDays !== 1 ? "s" : ""} × ₹
                    {newRent} ={" "}
                  </Text>
                  <Text strong>₹{(extensionDays * newRent).toFixed(2)}</Text>
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};
