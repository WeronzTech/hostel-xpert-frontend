import {useState} from "react";
import {Button, Dropdown, Menu} from "antd";
import {FiDownload, FiUpload, FiPocket} from "react-icons/fi";
import {BsPercent, BsReceipt} from "react-icons/bs";
import RentCollectionModal from "../../modals/accounts/RentCollectionModal";
import AddExpenseModal from "../../modals/accounts/AddExpenseModal";
import PettyCashModal from "../../modals/accounts/PettyCashModal";
import CreateAgentModal from "../../modals/accounts/CreateAgentModal";
import CommissionPaymentModal from "../../modals/accounts/CommissionPaymentModal";
import CreateVoucherModal from "../../modals/accounts/CreateVoucherModal";
import GSTExportComponent from "../../utils/GSTExportComponent"; // Import the combined component
import AllocateUsersModal from "../../modals/accounts/AllocateUsersModal";

const QuickActionsBar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [isPettyCashModalVisible, setIsPettyCashModalVisible] = useState(false);
  const [isCreateAgentModalVisible, setIsCreateAgentModalVisible] =
    useState(false);
  const [isCommissionPaymentModalVisible, setIsCommissionPaymentModalVisible] =
    useState(false);
  const [isCreateVoucherModalVisible, setIsCreateVoucherModalVisible] =
    useState(false);
  const [isAllocateUsersModalVisible, setIsAllocateUsersModalVisible] =
    useState(false);

  const rentMenu = (
    <Menu
      items={[
        {
          key: "monthly",
          label: "Monthly Rent",
          onClick: () => handleRentOptionSelect("monthly"),
        },
        {
          key: "daily",
          label: "Daily Rent",
          onClick: () => handleRentOptionSelect("daily"),
        },
        {
          key: "mess",
          label: "Mess Charges",
          onClick: () => handleRentOptionSelect("mess"),
        },
      ]}
    />
  );

  const expenseCategories = (
    <Menu
      items={[
        {
          key: "PG",
          label: "PG",
          onClick: () => handleExpenseOptionSelect("PG"),
        },
        {
          key: "Mess",
          label: "Mess",
          onClick: () => handleExpenseOptionSelect("Mess"),
        },
        {
          key: "Others",
          label: "Others",
          onClick: () => handleExpenseOptionSelect("Others"),
        },
      ]}
    />
  );

  const commissionCategories = (
    <Menu
      items={[
        {
          key: "agent",
          label: "Create Agent",
          onClick: () => handleCommissionOptionSelect("agent"),
        },
        {
          key: "assignUsers",
          label: "Allocate Users",
          onClick: () => handleCommissionOptionSelect("assignUsers"),
        },
        {
          key: "commission",
          label: "Pay Commissions",
          onClick: () => handleCommissionOptionSelect("commission"),
        },
      ]}
    />
  );

  const handleRentOptionSelect = (option) => {
    setSelectedOption(option);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedOption("");
  };

  const handleExpenseOptionSelect = (category) => {
    setSelectedExpenseCategory(category);
    setIsExpenseModalVisible(true);
  };

  const handleExpenseModalClose = () => {
    setIsExpenseModalVisible(false);
    setSelectedExpenseCategory("");
  };

  const handleCommissionOptionSelect = (option) => {
    if (option === "agent") {
      setIsCreateAgentModalVisible(true);
    } else if (option === "commission") {
      setIsCommissionPaymentModalVisible(true);
    } else if (option === "assignUsers") {
      setIsAllocateUsersModalVisible(true);
    }
  };

  const handleCommissionPaymentModalClose = () => {
    setIsCommissionPaymentModalVisible(false);
  };

  const handleCommissionPaymentSuccess = () => {
    console.log("Commission paid successfully!");
  };

  const handleAgentModalClose = () => {
    setIsCreateAgentModalVisible(false);
  };

  const handleAllocateModalClose = () => {
    setIsAllocateUsersModalVisible(false);
  };

  const handleAgentCreationSuccess = () => {
    console.log("Agent created successfully!");
  };

  const handleAllocateCreationSuccess = () => {
    console.log("Users assigned to related agent successfully!");
  };

  const handleVoucherModalClose = () => {
    setIsCreateVoucherModalVisible(false);
  };

  const handleVoucherCreationSuccess = (voucherData) => {
    console.log("Voucher created successfully:", voucherData);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <Dropdown
            overlay={rentMenu}
            trigger={["hover"]}
            placement="bottomLeft"
          >
            <Button
              style={{
                flex: 1,
                minWidth: "150px",
                backgroundColor: "white",
                borderColor: "#4d44b5",
                color: "#4d44b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "48px",
              }}
            >
              <FiDownload /> Collect Rent
            </Button>
          </Dropdown>

          <Dropdown
            overlay={expenseCategories}
            trigger={["hover"]}
            placement="bottomLeft"
          >
            <Button
              style={{
                flex: 1,
                minWidth: "150px",
                backgroundColor: "white",
                borderColor: "#4d44b5",
                color: "#4d44b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "48px",
              }}
            >
              <FiUpload /> Add Expense
            </Button>
          </Dropdown>

          <Button
            style={{
              flex: 1,
              minWidth: "150px",
              backgroundColor: "white",
              borderColor: "#4d44b5",
              color: "#4d44b5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "48px",
            }}
            onClick={() => setIsPettyCashModalVisible(true)}
          >
            <FiPocket /> Petty Cash
          </Button>

          <Dropdown
            overlay={commissionCategories}
            trigger={["hover"]}
            placement="bottomLeft"
          >
            <Button
              style={{
                flex: 1,
                minWidth: "150px",
                backgroundColor: "white",
                borderColor: "#4d44b5",
                color: "#4d44b5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                height: "48px",
              }}
            >
              <BsPercent />
              Commission
            </Button>
          </Dropdown>

          <Button
            style={{
              flex: 1,
              minWidth: "150px",
              backgroundColor: "white",
              borderColor: "#4d44b5",
              color: "#4d44b5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "48px",
            }}
            onClick={() => setIsCreateVoucherModalVisible(true)}
          >
            <BsReceipt />
            Create Voucher
          </Button>

          {/* Use the combined GST Export Component */}
          <GSTExportComponent />
        </div>
      </div>

      {/* All your existing modals remain the same */}
      <RentCollectionModal
        visible={isModalVisible}
        onCancel={handleModalClose}
        selectedOption={selectedOption}
      />

      <AddExpenseModal
        visible={isExpenseModalVisible}
        onCancel={handleExpenseModalClose}
        selectedCategory={selectedExpenseCategory}
      />

      <PettyCashModal
        visible={isPettyCashModalVisible}
        onCancel={() => setIsPettyCashModalVisible(false)}
      />

      <AllocateUsersModal
        visible={isAllocateUsersModalVisible}
        onCancel={handleAllocateModalClose}
        onSuccess={handleAllocateCreationSuccess}
      />

      <CreateAgentModal
        visible={isCreateAgentModalVisible}
        onCancel={handleAgentModalClose}
        onSuccess={handleAgentCreationSuccess}
      />

      <CommissionPaymentModal
        visible={isCommissionPaymentModalVisible}
        onCancel={handleCommissionPaymentModalClose}
        onSuccess={handleCommissionPaymentSuccess}
      />

      <CreateVoucherModal
        visible={isCreateVoucherModalVisible}
        onCancel={handleVoucherModalClose}
        onSuccess={handleVoucherCreationSuccess}
      />
    </>
  );
};

export default QuickActionsBar;
