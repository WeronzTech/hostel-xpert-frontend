import {Card, Row, Col, Select} from "antd";
import {Bar} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const {Option} = Select;

const ExpenseAnalytics = ({
  data,
  selectedYear,
  onYearChange,
  availableYears = [],
}) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500"></div>;
  }

  const monthlyData = data;

  // Calculate totals
  const totalExpense = monthlyData.reduce(
    (sum, month) => sum + month.totalExpense,
    0
  );

  const averageMonthly = totalExpense / monthlyData.length;

  // Current month
  const currentMonth = monthlyData[monthlyData.length - 1];

  // Highest and lowest spending months
  const highestMonth = monthlyData.reduce((max, month) =>
    month.totalExpense > max.totalExpense ? month : max
  );
  const lowestMonth = monthlyData.reduce((min, month) =>
    month.totalExpense < min.totalExpense ? month : min
  );

  // Function to get short month name
  const getShortMonthName = (monthYear) => {
    const monthName = monthYear.split(" ")[0];
    return monthName.substring(0, 3);
  };

  // Dynamic bar spacing based on number of months
  const getBarSpacing = () => {
    const monthCount = monthlyData.length;
    if (monthCount <= 3) {
      return {barPercentage: 0.4, categoryPercentage: 0.6}; // Wider bars for few months
    } else if (monthCount <= 6) {
      return {barPercentage: 0.6, categoryPercentage: 0.7}; // Medium bars
    } else {
      return {barPercentage: 0.7, categoryPercentage: 0.8}; // Standard bars
    }
  };

  const barSpacing = getBarSpacing();

  // Stacked Bar Chart Data
  const barData = {
    labels: monthlyData.map((month) => getShortMonthName(month.monthYear)),
    datasets: [
      {
        label: "PG",
        data: monthlyData.map((month) => month.pg),
        backgroundColor: "#4d44b5",
        borderRadius: 4, // Rounded corners for better look
      },
      {
        label: "Mess",
        data: monthlyData.map((month) => month.mess),
        backgroundColor: "#f97316",
        borderRadius: 4,
      },
      {
        label: "Others",
        data: monthlyData.map((month) => month.others),
        backgroundColor: "#10b981",
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 26,
          padding: 15,
        },
      },
      tooltip: {
        mode: "nearest",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.raw;
            const total = context.chart.data.datasets.reduce(
              (sum, dataset) => sum + dataset.data[context.dataIndex],
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ₹ ${value.toLocaleString()} (${percentage}%)`;
          },
          afterBody: function (context) {
            const total = context[0].chart.data.datasets.reduce(
              (sum, dataset) => sum + dataset.data[context[0].dataIndex],
              0
            );
            return `Total: ₹ ${total.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          padding: 8,
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: 8,
          font: {
            size: 11,
          },
          callback: function (value) {
            if (value >= 1000000) {
              return "₹ " + (value / 1000000).toFixed(1) + "M";
            } else if (value >= 1000) {
              return "₹ " + (value / 1000).toFixed(0) + "K";
            }
            return "₹ " + value.toLocaleString();
          },
        },
      },
    },
    // Dynamic bar spacing
    barPercentage: barSpacing.barPercentage,
    categoryPercentage: barSpacing.categoryPercentage,
  };

  return (
    <div className="p-4">
      <Row gutter={[24, 24]}>
        {/* Left Side - Graph */}
        <Col xs={24} md={14}>
          <Card
            title={
              <div className="flex flex-col  sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-base font-semibold">
                  Monthly Expense Breakdown - {selectedYear}
                </span>
                <Select
                  value={selectedYear}
                  onChange={onYearChange}
                  style={{width: 120}}
                  size="small"
                  className="w-full sm:w-auto"
                >
                  {availableYears.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </div>
            }
            className="h-full shadow-sm"
          >
            <div
              style={{
                height: "296px",
                minHeight: "250px",
                position: "relative",
              }}
              className="w-full"
            >
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
        </Col>

        {/* Right Side - Metrics */}
        <Col xs={24} md={10}>
          <div className="flex flex-col gap-4">
            {/* Quick Stats */}
            <Card size="small" className="text-center shadow-sm rounded-lg">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-lg font-bold text-emerald-600">
                    ₹ {Math.round(averageMonthly).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Average</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-600">
                    {monthlyData.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Months</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-700">
                    ₹ {currentMonth.totalExpense.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Current</div>
                </div>
              </div>
            </Card>

            {/* Current Month Breakdown */}
            <Card
              title="This Month"
              size="small"
              className="shadow-sm rounded-lg"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="text-sm font-semibold text-indigo-700">
                    PG
                  </div>
                  <div className="text-xs font-medium text-indigo-600">
                    ₹ {currentMonth.pg.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-sm font-semibold text-orange-700">
                    Mess
                  </div>
                  <div className="text-xs font-medium text-orange-600">
                    ₹ {currentMonth.mess.toLocaleString()}
                  </div>
                </div>
                <div className="p-2 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="text-sm font-semibold text-teal-700">
                    Others
                  </div>
                  <div className="text-xs font-medium text-teal-600">
                    ₹ {currentMonth.others.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Extremes */}
            <Card
              size="small"
              title="Spending Comparison"
              className="shadow-sm rounded-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-red-700">
                        Peak
                      </div>
                      <div className="text-xs text-gray-500">
                        {highestMonth.monthYear}
                      </div>
                    </div>
                  </div>
                  <div className="text-red-600 font-bold">
                    ₹{highestMonth.totalExpense.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-emerald-700">
                        Lowest
                      </div>
                      <div className="text-xs text-gray-500">
                        {lowestMonth.monthYear}
                      </div>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-bold">
                    ₹{lowestMonth.totalExpense.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ExpenseAnalytics;
