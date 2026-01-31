import { GoArrowUpRight } from "../../icons/index.js";

import { Link } from "react-router-dom";

const StatCard = ({
  title = "",
  value = "",
  icon = null,
  color = "primary",
  link = "/",
}) => {
  const colorVariants = {
    primary: {
      bg: "#4d44b5",
      text: "text-[#4d44b5]",
      light: "bg-[#4d44b5]/20",
    },
    renters: {
      bg: "#2c6e6e",
      text: "text-[#2c6e6e]",
      light: "bg-[#2c6e6e]/20",
      circle: "bg-[#2c6e6e]/10",
    },
    maintenance: {
      bg: "#d16a4a", // Slightly lighter terracotta
      text: "text-[#d16a4a]",
      light: "bg-[#d16a4a]/20",
    },
    employees: {
      bg: "#d18700",
      text: "text-[#d18700]",
      light: "bg-[#d18700]/20",
      circle: "bg-[#d18700]/10",
    },
  };

  const colors = colorVariants[color] || colorVariants.primary;

  return (
    <Link
      to={link}
      className="relative rounded-2xl p-5 shadow-md text-white overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}33 100%)`,
      }}
    >
      {/* Top Right Percentage Badge */}
      <div
        className={`absolute top-4 right-4 bg-white ${colors.text} rounded-full p-2 shadow-md hover:scale-105 transition transform`}
      >
        <GoArrowUpRight size={16} />
      </div>

      {/* Icon */}
      <div className={`${colors.circle} p-3 rounded-full w-fit mb-4 bg-white`}>
        <div className={`${colors.text}`}>{icon}</div>
      </div>

      {/* Title & Value */}
      <p className="text-sm text-white font-semibold">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>

      {/* Soft Circle Backgrounds */}
      <div
        className={`absolute -bottom-8 -right-8 w-32 h-32 ${colors.light} rounded-full z-0`}
      ></div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/20 rounded-full z-0"></div>
    </Link>
  );
};

export default StatCard;
