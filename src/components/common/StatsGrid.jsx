const StatsGrid = ({ stats }) => (
  <div
    className="grid gap-4 mb-8"
    style={{
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    }}
  >
    {stats.map((stat, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"
      >
        <div className={`p-3 rounded-full ${stat.color}`}>{stat.icon}</div>
        <div>
          <p className="text-gray-500 text-sm">{stat.title}</p>
          <p className="text-xl font-bold">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

export default StatsGrid;
