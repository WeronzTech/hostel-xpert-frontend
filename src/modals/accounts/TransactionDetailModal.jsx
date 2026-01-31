import {
  Modal,
  Descriptions,
  Tag,
  Spin,
  Typography,
  Divider,
  Image,
  Space,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import {EyeOutlined} from "@ant-design/icons";

const {Text, Title} = Typography;

const TransactionDetailModal = ({open, onClose, transaction, loading}) => {
  const transactionData = transaction?.data;
  const totals = transaction?.totals;

  const reference = transactionData?.referenceData || {};
  const purchaseDetails = reference.purchaseDetails || {};

  // Component for responsive field display
  const FieldRow = ({label, value, children}) => {
    if (!value && !children) return null;

    return (
      <Row gutter={[8, 8]} style={{marginBottom: 8}} wrap={false}>
        <Col flex="none">
          <Text
            type="secondary"
            style={{fontSize: "12px", whiteSpace: "nowrap"}}
          >
            {label}:
          </Text>
        </Col>
        <Col flex="auto">{children || <Text strong>{value}</Text>}</Col>
      </Row>
    );
  };

  return (
    <Modal
      title="Transaction Details"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{maxWidth: "95vw"}}
    >
      {loading ? (
        <div style={{textAlign: "center", padding: "50px"}}>
          <Spin size="large" />
        </div>
      ) : transactionData ? (
        <>
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{fontWeight: 500, width: "120px"}}
          >
            <Descriptions.Item label="Description">
              <Text strong>{transactionData.description}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Type">
              <Tag color="purple">
                {transactionData.referenceType === "deposits"
                  ? "Deposits"
                  : transactionData.referenceType}
              </Tag>
            </Descriptions.Item>

            {/* Enhanced Reference Details Section */}
            {(transactionData.referenceId || transactionData.referenceData) && (
              <Descriptions.Item label="Reference Details">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {/* Basic Information */}
                  {(reference.name ||
                    reference.paymentMethod ||
                    reference.transactionId) && (
                    <div>
                      <Text
                        strong
                        style={{
                          marginBottom: "12px",
                          display: "block",
                          fontSize: "14px",
                        }}
                      >
                        Basic Information
                      </Text>
                      <FieldRow label="Name" value={reference.name} />
                      <FieldRow
                        label="Payment Method"
                        value={reference.paymentMethod}
                      />
                      {(reference.paymentDate || reference.date) && (
                        <FieldRow
                          label="Payment Date"
                          value={dayjs(
                            reference.paymentDate || reference.date
                          ).format("DD/MM/YYYY")}
                        />
                      )}
                      <FieldRow
                        label="Transaction ID"
                        value={reference.transactionId}
                      />
                    </div>
                  )}

                  {/* Purchase Details */}
                  {(purchaseDetails.vendor ||
                    purchaseDetails.price ||
                    purchaseDetails.purchaseDate) && (
                    <div>
                      <Text
                        strong
                        style={{
                          marginBottom: "12px",
                          display: "block",
                          fontSize: "14px",
                        }}
                      >
                        Purchase Details
                      </Text>
                      <FieldRow label="Vendor" value={purchaseDetails.vendor} />
                      {purchaseDetails.price && (
                        <FieldRow
                          label="Price"
                          value={`₹${purchaseDetails.price.toLocaleString(
                            "en-IN"
                          )}`}
                        />
                      )}
                      {purchaseDetails.purchaseDate && (
                        <FieldRow
                          label="Purchase Date"
                          value={new Date(
                            purchaseDetails.purchaseDate
                          ).toLocaleString("en-IN")}
                        />
                      )}
                    </div>
                  )}

                  {/* Invoice Image */}
                  {purchaseDetails.invoiceUrl && (
                    <div>
                      <Text
                        strong
                        style={{
                          marginBottom: "12px",
                          display: "block",
                          fontSize: "14px",
                        }}
                      >
                        Invoice
                      </Text>
                      <Space direction="vertical" style={{width: "100%"}}>
                        <div style={{textAlign: "center"}}>
                          <Image
                            width={120}
                            height={120}
                            src={purchaseDetails.invoiceUrl}
                            placeholder={
                              <div
                                style={{
                                  width: 120,
                                  height: 120,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "#f5f5f5",
                                  border: "1px dashed #d9d9d9",
                                  borderRadius: "6px",
                                }}
                              >
                                <EyeOutlined />
                              </div>
                            }
                            preview={{
                              mask: <EyeOutlined />,
                            }}
                            style={{
                              objectFit: "cover",
                              borderRadius: "6px",
                              border: "1px solid #d9d9d9",
                            }}
                          />
                        </div>
                        <Text
                          type="secondary"
                          style={{fontSize: "12px", textAlign: "center"}}
                        >
                          Click to preview invoice
                        </Text>
                      </Space>
                    </div>
                  )}

                  {/* Status */}
                  {reference.status && (
                    <div>
                      <Text
                        strong
                        style={{
                          marginBottom: "8px",
                          display: "block",
                          fontSize: "14px",
                        }}
                      >
                        Status
                      </Text>
                      <Tag
                        color={
                          reference.status === "completed" ? "green" : "blue"
                        }
                      >
                        {reference.status}
                      </Tag>
                    </div>
                  )}

                  {/* Empty State */}
                  {!reference.name &&
                    !reference.paymentMethod &&
                    !purchaseDetails.vendor &&
                    !purchaseDetails.price &&
                    !purchaseDetails.invoiceUrl && (
                      <Text
                        type="secondary"
                        italic
                        style={{textAlign: "center"}}
                      >
                        No reference details available
                      </Text>
                    )}
                </div>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Created At">
              {new Date(transactionData.createdAt).toLocaleString("en-IN")}
            </Descriptions.Item>
          </Descriptions>

          <Divider>Account Flow</Divider>

          {/* Responsive Account Flow Section */}
          <Row gutter={[16, 16]} style={{marginBottom: 16}}>
            {/* Credit Accounts - Mobile: full width, Desktop: left */}
            <Col xs={24} md={10}>
              <div
                style={{
                  backgroundColor: "#f6ffed",
                  border: "2px solid #b7eb8f",
                  borderRadius: "8px",
                  padding: "16px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{marginBottom: "12px", textAlign: "center"}}>
                  <Tag
                    color="green"
                    style={{fontSize: "12px", padding: "6px 12px", margin: 0}}
                  >
                    FROM (Credit)
                  </Tag>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  {transactionData.transactions
                    ?.filter((t) => t.credit > 0)
                    .map((t, index) => (
                      <div
                        key={`credit-${index}`}
                        style={{
                          padding: "12px",
                          backgroundColor: "white",
                          borderRadius: "6px",
                          border: "1px solid #d9f7be",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                          }}
                        >
                          {t.accountId?.name}
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <Text type="secondary" style={{fontSize: "12px"}}>
                            {t.accountId?.accountType}
                          </Text>
                          <Text
                            strong
                            style={{color: "#52c41a", fontSize: "14px"}}
                          >
                            ₹{t.credit.toLocaleString("en-IN")}
                          </Text>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Col>

            {/* Arrow - Mobile: hidden, Desktop: visible */}
            <Col xs={0} md={4}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                  }}
                >
                  →
                </div>
                <Text
                  strong
                  style={{
                    fontSize: "11px",
                    marginTop: "8px",
                    textAlign: "center",
                    color: "#1890ff",
                  }}
                >
                  TRANSFER
                </Text>
              </div>
            </Col>

            {/* Mobile Arrow - Only visible on mobile */}
            <Col xs={24} md={0}>
              <div style={{textAlign: "center", padding: "8px 0"}}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#1890ff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "20px",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                  }}
                >
                  ↓
                </div>
                <Text
                  strong
                  style={{
                    fontSize: "11px",
                    marginTop: "4px",
                    textAlign: "center",
                    color: "#1890ff",
                    display: "block",
                  }}
                >
                  TRANSFER TO
                </Text>
              </div>
            </Col>

            {/* Debit Accounts - Mobile: full width, Desktop: right */}
            <Col xs={24} md={10}>
              <div
                style={{
                  backgroundColor: "#fff2f0",
                  border: "2px solid #ffccc7",
                  borderRadius: "8px",
                  padding: "16px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{marginBottom: "12px", textAlign: "center"}}>
                  <Tag
                    color="red"
                    style={{fontSize: "12px", padding: "6px 12px", margin: 0}}
                  >
                    TO (Debit)
                  </Tag>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    flex: 1,
                  }}
                >
                  {transactionData.transactions
                    ?.filter((t) => t.debit > 0)
                    .map((t, index) => (
                      <div
                        key={`debit-${index}`}
                        style={{
                          padding: "12px",
                          backgroundColor: "white",
                          borderRadius: "6px",
                          border: "1px solid #ffbb96",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            display: "block",
                            marginBottom: "6px",
                            fontSize: "14px",
                          }}
                        >
                          {t.accountId?.name}
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <Text type="secondary" style={{fontSize: "12px"}}>
                            {t.accountId?.accountType}
                          </Text>
                          <Text
                            strong
                            style={{color: "#ff4d4f", fontSize: "14px"}}
                          >
                            ₹{t.debit.toLocaleString("en-IN")}
                          </Text>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <div style={{textAlign: "center", padding: "20px"}}>
          <Text type="secondary">No transaction details available</Text>
        </div>
      )}
    </Modal>
  );
};

export default TransactionDetailModal;
