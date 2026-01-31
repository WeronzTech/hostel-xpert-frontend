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

const PaymentAnalytics = ({
  data,
  selectedYear,
  onYearChange,
  availableYears = [],
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payment data available
      </div>
    );
  }

  const monthlyData = data;

  // Calculate totals
  const totalReceived = monthlyData.reduce(
    (sum, month) => sum + month.totalReceived,
    0
  );

  const averageMonthly = totalReceived / monthlyData.length;

  // Current month
  const currentMonth = monthlyData[monthlyData.length - 1];

  // Highest and lowest received months
  const highestMonth = monthlyData.reduce((max, month) =>
    month.totalReceived > max.totalReceived ? month : max
  );
  const lowestMonth = monthlyData.reduce((min, month) =>
    month.totalReceived < min.totalReceived ? month : min
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
      return {barPercentage: 0.4, categoryPercentage: 0.6};
    } else if (monthCount <= 6) {
      return {barPercentage: 0.6, categoryPercentage: 0.7};
    } else {
      return {barPercentage: 0.7, categoryPercentage: 0.8};
    }
  };

  const barSpacing = getBarSpacing();

  // Bar Chart Data for Payments (single dataset since it's just total received)
  const barData = {
    labels: monthlyData.map((month) => getShortMonthName(month.monthYear)),
    datasets: [
      {
        label: "Amount Received",
        data: monthlyData.map((month) => month.totalReceived),
        backgroundColor: "#10b981", // Green color for received payments
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
            return `${label}: ₹ ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
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
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-base font-semibold">
                  Monthly Payments Received - {selectedYear}
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
                    ₹ {currentMonth.totalReceived.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Current</div>
                </div>
              </div>
            </Card>

            {/* Total Received */}
            <Card
              title="Total Summary"
              size="small"
              className="shadow-sm rounded-lg"
            >
              <div className="text-center p-3">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ₹ {totalReceived.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Total Received in {selectedYear}
                </div>
              </div>
            </Card>

            {/* Extremes */}
            <Card
              size="small"
              title="Receipt Comparison"
              className="shadow-sm rounded-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-green-700">
                        Highest
                      </div>
                      <div className="text-xs text-gray-500">
                        {highestMonth.monthYear}
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 font-bold">
                    ₹{highestMonth.totalReceived.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-semibold text-blue-700">
                        Lowest
                      </div>
                      <div className="text-xs text-gray-500">
                        {lowestMonth.monthYear}
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-600 font-bold">
                    ₹{lowestMonth.totalReceived.toLocaleString()}
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

export default PaymentAnalytics;
