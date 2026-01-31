import {
  Modal,
  Input,
  Checkbox,
  DatePicker,
  Button,
  Form,
  message,
  List,
  Switch,
  Space,
} from "antd";
import moment from "moment";
import {useMutation, useQuery} from "@tanstack/react-query";
import {createNote, getUserNotes} from "../../../hooks/users/useUser";
import {useState} from "react";
import {useSelector} from "react-redux";

const {TextArea} = Input;

const NotesModal = ({name, userId, propertyId, isVisible, onClose}) => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const {user} = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [showHistory, setShowHistory] = useState(false);
  console.log(userId);
  // Fetch notes query
  const {
    data: notes,
    isLoading: isNotesLoading,
    refetch,
  } = useQuery({
    queryKey: ["userNotes", userId],
    queryFn: () => getUserNotes(userId),
    enabled: showHistory && isVisible,
  });
  console.log(notes);
  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      message.success("Note added successfully");
      form.resetFields();
      refetch();
      setShowHistory(true);
    },
    onError: (error) => {
      message.error(error.message || "Failed to add note");
    },
  });

  const handleAddNote = () => {
    form
      .validateFields()
      .then((values) => {
        createNoteMutation.mutate({
          name,
          userId,
          content: values.note,
          isReminder: values.isReminder || false,
          reminderDate: values.isReminder
            ? values.reminderDate.format("YYYY-MM-DD")
            : null,
          createdBy: user?.name,
          propertyId: selectedProperty?.id || propertyId,
        });
      })
      .catch(() => {});
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  return (
    <Modal
      centered
      className={showHistory ? "scrollbar-hide" : ""}
      title={
        <Space>
          <span>{showHistory ? "Note History" : "Add New Note"}</span>
          <Switch
            checkedChildren="History"
            unCheckedChildren="New Note"
            checked={showHistory}
            onChange={(checked) => setShowHistory(checked)}
          />
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        !showHistory && (
          <Button
            key="submit"
            type="primary"
            loading={createNoteMutation.isLoading}
            onClick={handleAddNote}
          >
            Add
          </Button>
        ),
      ]}
      width={500}
      bodyStyle={{
        maxHeight: "65vh",
        overflowY: "auto",
        paddingRight: showHistory ? 0 : 10,
        ...(showHistory && {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }),
      }}
      destroyOnClose
    >
      {showHistory ? (
        <div className="scrollbar-hide">
          {" "}
          {/* Additional wrapper for scrollbar hide */}
          <List
            loading={isNotesLoading}
            dataSource={notes?.data || []}
            renderItem={(note) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space direction="vertical" style={{width: "100%"}}>
                      {/* Main note content */}
                      <div>
                        <strong>{note.content}</strong>
                        {note.isReminder && (
                          <span
                            style={{
                              color:
                                note.reminderStatus === "completed"
                                  ? "green"
                                  : "#faad14",
                              fontSize: "0.85em",
                              marginLeft: 8,
                            }}
                          >
                            (
                            {note.reminderStatus === "completed"
                              ? "Completed"
                              : "Reminder"}
                            : {moment(note.reminderDate).format("YYYY-MM-DD")})
                          </span>
                        )}
                      </div>

                      {/* Created info */}
                      <div style={{fontSize: "0.8em", color: "#888"}}>
                        Created by <strong>{note.createdBy}</strong> on{" "}
                        {moment(note.createdAt).format("YYYY-MM-DD hh:mm A")}
                      </div>

                      {/* Follow-up actions */}
                      {note.followUpActions?.length > 0 && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "8px 12px",
                            background: "#fafafa",
                            borderRadius: 6,
                            borderLeft: "3px solid #1890ff",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 500,
                              marginBottom: 4,
                              color: "#555",
                            }}
                          >
                            Follow-up Actions:
                          </div>
                          {note.followUpActions.map((action, index) => (
                            <div
                              key={index}
                              style={{
                                fontSize: "0.85em",
                                color: "#555",
                                borderBottom:
                                  index < note.followUpActions.length - 1
                                    ? "1px dashed #ddd"
                                    : "none",
                                paddingBottom: 6,
                                marginBottom: 6,
                              }}
                            >
                              <div>
                                <strong style={{textTransform: "capitalize"}}>
                                  {action.action}
                                </strong>{" "}
                                by{" "}
                                <span style={{color: "#1677ff"}}>
                                  {action.takenBy || "Unknown"}
                                </span>{" "}
                                on{" "}
                                {moment(action.date).format(
                                  "YYYY-MM-DD hh:mm A"
                                )}
                              </div>
                              {action.notes && (
                                <div
                                  style={{
                                    fontStyle: "italic",
                                    color: "#777",
                                    marginTop: 2,
                                  }}
                                >
                                  “{action.notes}”
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
            locale={{emptyText: "No notes found"}}
          />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="Note"
            name="note"
            rules={[{required: true, message: "Please enter your note"}]}
          >
            <TextArea rows={4} placeholder="Enter your note here..." />
          </Form.Item>

          <Form.Item name="isReminder" valuePropName="checked">
            <Checkbox>Set as reminder</Checkbox>
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {({getFieldValue}) =>
              getFieldValue("isReminder") ? (
                <Form.Item
                  label="Reminder Date"
                  name="reminderDate"
                  rules={[
                    {required: true, message: "Please select a reminder date"},
                  ]}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    disabledDate={disabledDate}
                    className="w-full"
                    placeholder="Select reminder date"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default NotesModal;
