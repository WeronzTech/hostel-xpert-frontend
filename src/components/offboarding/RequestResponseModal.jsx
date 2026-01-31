// import {Modal, Input, Typography, Space, Button, message} from "antd";
// import {useState, useEffect} from "react";

// const {TextArea} = Input;
// const {Text} = Typography;

// const RequestResponseModal = ({open, onClose, onSubmit, action, request}) => {
//   const [comment, setComment] = useState("");

//   useEffect(() => {
//     if (!open) setComment(""); // Reset comment when modal closes
//   }, [open]);

//   // 🔹 Extract request fields
//   const requestType = request?.request?.type;
//   const isInstantCheckout = request?.request?.isInstantCheckout;
//   const isRefundEligible = request?.request?.isRefundEligible;

//   // 🔹 Determine scheduled checkout state
//   const isScheduledCheckout =
//     action === "approved" &&
//     requestType === "checked_out" &&
//     !isInstantCheckout;

//   const effectiveDate = request?.request?.effectiveDate
//     ? new Date(request.request.effectiveDate)
//     : null;

//   const now = new Date();
//   const todayUTC = new Date(
//     Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
//   );
//   const effectiveUTC = effectiveDate
//     ? new Date(
//         Date.UTC(
//           effectiveDate.getFullYear(),
//           effectiveDate.getMonth(),
//           effectiveDate.getDate()
//         )
//       )
//     : null;

//   const isEffectiveTodayOrPast = effectiveUTC
//     ? effectiveUTC.getTime() <= todayUTC.getTime()
//     : true;

//   // 🔹 Submit handlers
//   const handleSubmit = () => {
//     if (isScheduledCheckout && !isEffectiveTodayOrPast) {
//       message.warning(
//         "This is a scheduled checkout in the future. Please use 'Force Vacate' to submit early."
//       );
//       return;
//     }
//     onSubmit({status: action, comment});
//   };

//   const handleForceVacate = () => {
//     onSubmit({status: action, comment, forceVacate: true});
//   };

//   const handleDepositRefund = () => {
//     onSubmit({status: action, comment, refundDeposit: true});
//   };

//   // 🔹 Determine button text
//   const getButtonText = () => {
//     if (action === "rejected") return "Reject Request";
//     if (requestType === "checked_in") return "Accept Check-In";
//     if (requestType === "on_leave") return "Accept Leave";
//     if (requestType === "checked_out") {
//       if (!isInstantCheckout && !isEffectiveTodayOrPast)
//         return "Force Vacate & Submit";
//       return "Accept Check-Out";
//     }
//     return "Submit";
//   };

//   // 🔹 Determine button color
//   const getButtonProps = () => {
//     if (action === "rejected") return {type: "primary", danger: true};
//     if (isScheduledCheckout && !isEffectiveTodayOrPast)
//       return {type: "primary", danger: true};
//     return {type: "primary"};
//   };

//   // 🔹 Footer button rendering logic
//   const renderFooterButtons = () => {
//     // If reject → just one red button
//     if (action === "rejected") {
//       return [
//         <Button key="reject" {...getButtonProps()} onClick={handleSubmit}>
//           {getButtonText()}
//         </Button>,
//       ];
//     }

//     // If refund eligible (non-instant checkout) → show two buttons
//     if (
//       requestType === "checked_out" &&
//       !isInstantCheckout &&
//       isRefundEligible
//     ) {
//       return [
//         <Button key="refund" danger onClick={handleDepositRefund}>
//           Deposit Refund
//         </Button>,
//         <Button
//           key="approve"
//           {...getButtonProps()}
//           onClick={
//             isScheduledCheckout && !isEffectiveTodayOrPast
//               ? handleForceVacate
//               : handleSubmit
//           }
//         >
//           {getButtonText()}
//         </Button>,
//       ];
//     }

//     // Default → single button
//     return [
//       <Button
//         key="submit"
//         {...getButtonProps()}
//         onClick={
//           isScheduledCheckout && !isEffectiveTodayOrPast
//             ? handleForceVacate
//             : handleSubmit
//         }
//       >
//         {getButtonText()}
//       </Button>,
//     ];
//   };

//   return (
//     <Modal
//       title={`${action === "approved" ? "Accept" : "Reject"} Request`}
//       open={open}
//       onCancel={onClose}
//       centered
//       footer={renderFooterButtons()}
//     >
//       <Space direction="vertical" className="w-full">
//         <Text>Do you want to add remarks before submitting?</Text>
//         <TextArea
//           rows={3}
//           placeholder="Add remarks (optional)"
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//         />

//         {/* Show scheduled checkout warning */}
//         {action === "approved" &&
//           isScheduledCheckout &&
//           !isEffectiveTodayOrPast && (
//             <Text type="warning">
//               Scheduled checkout date is in the future (
//               {effectiveDate?.toLocaleDateString()}). You can force vacate if
//               needed.
//             </Text>
//           )}
//       </Space>
//     </Modal>
//   );
// };

// export default RequestResponseModal;
import {Modal, Input, Typography, Space, Button, message} from "antd";
import {useState, useEffect} from "react";
import RefundInitiateModal from "../../modals/accounts/RefundInitiateModal";

const {TextArea} = Input;
const {Text} = Typography;

const RequestResponseModal = ({open, onClose, onSubmit, action, request}) => {
  const [comment, setComment] = useState("");
  const [refundModalOpen, setRefundModalOpen] = useState(false); // ✅ refund modal state

  useEffect(() => {
    if (!open) setComment(""); // Reset comment when modal closes
  }, [open]);

  const requestType = request?.request?.type;
  const isInstantCheckout = request?.request?.isInstantCheckout;
  const isRefundEligible = request?.request?.isRefundEligible;

  const isScheduledCheckout =
    action === "approved" &&
    requestType === "checked_out" &&
    !isInstantCheckout;

  const effectiveDate = request?.request?.effectiveDate
    ? new Date(request.request.effectiveDate)
    : null;

  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const effectiveUTC = effectiveDate
    ? new Date(
        Date.UTC(
          effectiveDate.getFullYear(),
          effectiveDate.getMonth(),
          effectiveDate.getDate()
        )
      )
    : null;

  const isEffectiveTodayOrPast = effectiveUTC
    ? effectiveUTC.getTime() <= todayUTC.getTime()
    : true;

  const handleSubmit = () => {
    if (isScheduledCheckout && !isEffectiveTodayOrPast) {
      message.warning(
        "This is a scheduled checkout in the future. Please use 'Force Vacate' to submit early."
      );
      return;
    }
    onSubmit({status: action, comment});
  };

  const handleForceVacate = () => {
    onSubmit({status: action, comment, forceVacate: true});
  };

  // ✅ Instead of calling onSubmit directly, open the refund modal
  const handleDepositRefund = () => {
    setRefundModalOpen(true);
  };

  const getButtonText = () => {
    if (action === "rejected") return "Reject Request";
    if (requestType === "checked_in") return "Accept Check-In";
    if (requestType === "on_leave") return "Accept Leave";
    if (requestType === "checked_out") {
      if (!isInstantCheckout && !isEffectiveTodayOrPast)
        return "Force Vacate & Submit";
      return "Accept Check-Out";
    }
    return "Submit";
  };

  const getButtonProps = () => {
    if (action === "rejected") return {type: "primary", danger: true};
    if (isScheduledCheckout && !isEffectiveTodayOrPast)
      return {type: "primary", danger: true};
    return {type: "primary"};
  };

  const renderFooterButtons = () => {
    if (action === "rejected") {
      return [
        <Button key="reject" {...getButtonProps()} onClick={handleSubmit}>
          {getButtonText()}
        </Button>,
      ];
    }

    if (
      requestType === "checked_out" &&
      !isInstantCheckout &&
      isRefundEligible
    ) {
      return [
        <Button key="refund" danger onClick={handleDepositRefund}>
          Deposit Refund
        </Button>,
        <Button
          key="approve"
          {...getButtonProps()}
          onClick={
            isScheduledCheckout && !isEffectiveTodayOrPast
              ? handleForceVacate
              : handleSubmit
          }
        >
          {getButtonText()}
        </Button>,
      ];
    }

    return [
      <Button
        key="submit"
        {...getButtonProps()}
        onClick={
          isScheduledCheckout && !isEffectiveTodayOrPast
            ? handleForceVacate
            : handleSubmit
        }
      >
        {getButtonText()}
      </Button>,
    ];
  };

  return (
    <>
      <Modal
        title={`${action === "approved" ? "Accept" : "Reject"} Request`}
        open={open}
        onCancel={onClose}
        centered
        footer={renderFooterButtons()}
      >
        <Space direction="vertical" className="w-full">
          <Text>Do you want to add remarks before submitting?</Text>
          <TextArea
            rows={3}
            placeholder="Add remarks (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {action === "approved" &&
            isScheduledCheckout &&
            !isEffectiveTodayOrPast && (
              <Text type="warning">
                Scheduled checkout date is in the future (
                {effectiveDate?.toLocaleDateString()}). You can force vacate if
                needed.
              </Text>
            )}
        </Space>
      </Modal>

      {/* ✅ Refund Modal */}
      <RefundInitiateModal
        open={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        user={request}
        onSuccess={(refundData) => {
          setRefundModalOpen(false);
        }}
      />
    </>
  );
};

export default RequestResponseModal;
