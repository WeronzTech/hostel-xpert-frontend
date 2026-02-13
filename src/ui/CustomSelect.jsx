import {useState, useRef, useEffect} from "react";
import {FiChevronDown} from "react-icons/fi";

const CustomSelect = ({
  options,
  value,
  onChange,
  name,
  label,
  getSelectedLabel, // ✅ New optional prop for custom display after selection
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onChange({target: {name, value}});
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText =
    (getSelectedLabel && selectedOption && getSelectedLabel(selectedOption)) ||
    selectedOption?.label ||
    "Select an option";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg flex justify-between items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-colors"
        >
          <span>{displayText}</span>
          <FiChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white text-[#059669] border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-2 cursor-pointer ${
                  value === option.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                } first:rounded-t-lg last:rounded-b-lg`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
