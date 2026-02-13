import {Pie} from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const OccupancyPieChart = ({occupied, total}) => {
  const vacant = total - occupied;
  const occupancyRate = Math.round((occupied / total) * 100);

  const data = {
    labels: ["Occupied", "Vacant"],
    datasets: [
      {
        data: [occupied, vacant],
        backgroundColor: ["#059669", "#e0e0e0"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend since we're showing custom one
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-row items-center justify-between gap-6 flex-wrap">
      {/* Legend/details on the left */}
      <div className="ml-4 mt-4 sm:ml-10 sm:mt-6 xl:ml-30 md:ml-20 lg:ml-40 lg:mt-10 space-y-4">
        <div className="text-left">
          <h4 className="font-medium text-gray-700">Occupancy Details</h4>
          <p className="text-sm text-gray-500">Total: {total}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-[#059669]"></div>
            <div>
              <span className="text-sm font-medium text-gray-700">
                Occupied
              </span>
              <span className="block text-xs text-gray-500">
                {occupied} ({occupancyRate}%)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <div>
              <span className="text-sm font-medium text-gray-700">Vacant</span>
              <span className="block text-xs text-gray-500">
                {vacant} ({100 - occupancyRate}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart on the right */}
      <div className="relative xl:w-40 xl:h-40 lg:w-40 lg:h-40 md:w-40 md:h-40 w-31 h-31 mr-4 mt-4 sm:mr-10 sm:mt-6 xl:mr-30 lg:mr-40 md:mr-20 lg:mt-10">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default OccupancyPieChart;
