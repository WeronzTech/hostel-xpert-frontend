import {FiCalendar} from "../../icons/index.js";

const PageHeader = ({title, subtitle, showCalendar = true}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && (
          <p className="text-gray-600 hidden sm:block">{subtitle}</p>
        )}
      </div>
      {showCalendar && (
        <div className="flex items-center gap-2 text-gray-600">
          <FiCalendar className="text-[#059669]" />
          <span>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
