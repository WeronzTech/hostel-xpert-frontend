import {Bar} from "react-chartjs-2";
import {Card} from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {AiOutlineLineChart} from "react-icons/ai";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FinanceBarChart = ({data, loading, height = "200px"}) => {
  if (loading) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center text-gray-500">
          <div className="flex items-center justify-center mb-4">
            <AiOutlineLineChart
              className="text-gray-300"
              style={{
                fontSize: 56,
              }}
            />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            No Financial Data
          </h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Start tracking your income and expenses to see your financial
            overview here.
          </p>
        </div>
      </Card>
    );
  }

  // Format month names to short format (Jan, Feb, etc.)
  const formatMonth = (monthYear) => {
    const month = monthYear.split(" ")[0];
    return month.substring(0, 3);
  };

  // Format Y-axis values to use K, M, B suffixes
  const formatYAxis = (value) => {
    if (value >= 1000000) {
      return "₹" + (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return "₹" + (value / 1000).toFixed(1) + "K";
    }
    return "₹" + value;
  };

  const chartData = {
    labels: data.map((item) => formatMonth(item.monthYear)),
    datasets: [
      {
        label: "Income",
        data: data.map((item) => item.totalIncome),
        backgroundColor: "#00c853",
        borderRadius: 6,
        barPercentage: 0.7,
      },
      {
        label: "Expense",
        data: data.map((item) => item.totalExpense),
        backgroundColor: "#ff5252",
        borderRadius: 6,
        barPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.raw || 0;
            return `${label}: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
        ticks: {
          callback: formatYAxis,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Card className="w-full">
      {/* Chart - No header with selector */}
      <div className="relative w-full" style={{height: height}}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default FinanceBarChart;
