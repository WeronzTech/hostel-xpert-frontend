import {StatsGrid} from "../../components";
import {FiUsers, FiCheckCircle, FiXCircle, FiClock} from "react-icons/fi";

const AttendanceStats = ({data}) => {
  const stats = [
    {
      title: "Total Students",
      value: data?.length || 0,
      icon: <FiUsers className="text-xl" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Present",
      value: data?.filter((s) => s.status === "Present").length || 0,
      icon: <FiCheckCircle className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Absent",
      value: data?.filter((s) => s.status === "Absent").length || 0,
      icon: <FiXCircle className="text-xl" />,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Late",
      value: data?.filter((s) => s.status === "Late").length || 0,
      icon: <FiClock className="text-xl" />,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return <StatsGrid stats={stats} />;
};

export default AttendanceStats;
