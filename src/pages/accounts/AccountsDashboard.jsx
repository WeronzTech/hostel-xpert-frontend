import {useEffect, useState} from "react";
import {Row, Col, Select} from "antd";
import FinancialCard from "../../components/accounts/FinancialCard";
import RentCollectionModal from "../../modals/accounts/RentCollectionModal";
import {PageHeader} from "../../components";
import ExpenseOverviewCard from "../../components/accounts/ExpenseOverviewCard";
import PettyCashCarousel from "../../components/accounts/PettyCashCarousel";
import QuickActionsBar from "../../components/accounts/QuickActionsBar";
import {useSelector} from "react-redux";
import {useQuery} from "@tanstack/react-query";
import {
  getAccountDashboardDataForDepositSection,
  getAccountDashboardDataForExpenseSection,
  getAccountDashboardDataForIncomeSection,
  getAllPettyCashes,
  getMonthlyIncomeExpenseSummary,
} from "../../hooks/accounts/useAccounts";
import DepositOverviewCard from "../../components/accounts/DepositOverviewCard";
import FinanceBarChart from "../../components/home/FinanceBarChart";

const {Option} = Select;

const AccountsDashboard = () => {
  const {selectedProperty} = useSelector((state) => state.properties);
  const [showRentModal, setShowRentModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  const handleRentCollection = (type) => {
    setShowRentModal(false);
    // console.log(`Collecting ${type} rent`);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Income Data
  const {data: financialData, isLoading} = useQuery({
    queryKey: ["accountDashboard", selectedProperty?.id ?? "all"],
    queryFn: () =>
      getAccountDashboardDataForIncomeSection(selectedProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const {data: summaryData, isLoading: summaryLoading} = useQuery({
    queryKey: ["incomeExpense-summary", selectedProperty?.id, selectedYear],
    queryFn: () =>
      getMonthlyIncomeExpenseSummary(selectedProperty?.id, selectedYear),
  });

  // Expense Data
  const {data: expenseData, isLoading: isExpenseLoading} = useQuery({
    queryKey: ["accountDashboardExpense", selectedProperty?.id ?? "all"],
    queryFn: () =>
      getAccountDashboardDataForExpenseSection(selectedProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Deposit Data
  const {data: depositData, isLoading: isDepositLoading} = useQuery({
    queryKey: ["accountDashboardDeposit", selectedProperty?.id ?? "all"],
    queryFn: () =>
      getAccountDashboardDataForDepositSection(selectedProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // Petty Cash Data
  const {data: pettyCashes = [], isLoading: isManagersLoading} = useQuery({
    queryKey: ["pettyCashes", selectedProperty?.id ?? "all"],
    queryFn: () => getAllPettyCashes(selectedProperty?.id),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (summaryData?.availableYears?.length) {
      setAvailableYears(summaryData?.availableYears);
    }
  }, [summaryData]);

  const pettyCashData = pettyCashes.map((pettyCash) => ({
    managerId: pettyCash?.manager,
    inHandAmount: pettyCash?.inHandAmount,
    inAccountAmount: pettyCash?.inAccountAmount,
    managerName: pettyCash?.managerName,
  }));

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-4 pb-8 xl:px-12 lg:px-6">
      <div>
        <PageHeader
          title="Accounts Dashboard"
          subtitle="Monthly Financial Overview"
        />
        <QuickActionsBar />
      </div>
      {/* Financial Overview Cards */}
      <Row gutter={[16, 16]} style={{marginBottom: "32px"}}>
        <Col xs={24} sm={12} lg={8}>
          <FinancialCard
            title="Monthly Rent"
            type="monthly"
            totalAmountNeed={financialData?.monthly?.totalAmountNeed}
            lastMonthReceived={financialData?.monthly?.lastMonthReceived}
            currentMonthReceived={financialData?.monthly?.currentMonthReceived}
            pendingAmount={financialData?.monthly?.pendingAmount}
            isIncrease={financialData?.monthly?.isIncrease}
            percentageReceived={financialData?.monthly?.percentageReceived}
            comparisonAmount={financialData?.monthly?.comparisonAmount}
            comparisonPercentage={financialData?.monthly?.comparisonPercentage}
            isLoading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FinancialCard
            title="Daily Rent"
            type="daily"
            totalAmountNeed={financialData?.daily?.totalAmountNeed}
            lastMonthReceived={financialData?.daily?.lastMonthReceived}
            currentMonthReceived={financialData?.daily?.currentMonthReceived}
            pendingAmount={financialData?.daily?.pendingAmount}
            isIncrease={financialData?.daily?.isIncrease}
            percentageReceived={financialData?.daily?.percentageReceived}
            comparisonAmount={financialData?.daily?.comparisonAmount}
            comparisonPercentage={financialData?.daily?.comparisonPercentage}
            isLoading={isLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <FinancialCard
            title="Mess Only"
            type="mess"
            totalAmountNeed={financialData?.mess?.totalAmountNeed}
            lastMonthReceived={financialData?.mess?.lastMonthReceived}
            currentMonthReceived={financialData?.mess?.currentMonthReceived}
            pendingAmount={financialData?.mess?.pendingAmount}
            isIncrease={financialData?.mess?.isIncrease}
            percentageReceived={financialData?.mess?.percentageReceived}
            comparisonAmount={financialData?.mess?.comparisonAmount}
            comparisonPercentage={financialData?.mess?.comparisonPercentage}
            isLoading={isLoading}
          />
        </Col>
      </Row>
      {/* Expense, Deposit and Petty Cash Section */}
      <Row gutter={[16, 16]} style={{marginBottom: "32px"}}>
        <Col xs={24} lg={12}>
          <ExpenseOverviewCard
            expenses={expenseData}
            loading={isExpenseLoading}
          />
        </Col>
        <Col xs={24} lg={6}>
          <DepositOverviewCard
            depositData={depositData}
            loading={isDepositLoading}
          />
        </Col>
        <Col xs={24} lg={6}>
          <PettyCashCarousel
            pettyCashData={pettyCashData}
            loading={isManagersLoading}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{marginBottom: "32px"}}>
        <Col xs={24}>
          <div className="bg-white rounded-xl p-4 shadow-sm h-full">
            {/* Header with filter on the right */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-700 transition-all duration-300">
                Finance Overview{selectedYear ? ` - ${selectedYear}` : ""}
              </h4>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                size="small"
              >
                {availableYears.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>

            <FinanceBarChart
              data={summaryData?.data}
              loading={summaryLoading}
              height="380px"
            />
          </div>
        </Col>
      </Row>

      <RentCollectionModal
        isOpen={showRentModal}
        onClose={() => setShowRentModal(false)}
        onSelect={handleRentCollection}
      />
    </div>
  );
};

export default AccountsDashboard;
