import {useEffect, useRef} from "react";
import {FiCheck} from "react-icons/fi";

const Timeline = ({steps, activeStep}) => {
  const stepContainerRef = useRef(null);

  useEffect(() => {
    const container = stepContainerRef.current;
    if (container && window.innerWidth < 640) {
      const stepWidth = 140; // Approximate width of each step block
      const offset = Math.max((activeStep - 2) * stepWidth, 0); // center 2nd of 3 steps
      container.scrollTo({
        left: offset,
        behavior: "smooth",
      });
    }
  }, [activeStep]);

  return (
    <div className="relative pt- pb-2">
      {/* Scroll only on small screens */}
      <div
        className="overflow-x-auto sm:overflow-visible px-4 sm:px-0 scrollbar-hide"
        ref={stepContainerRef}
      >
        <div className="flex xl:gap-8 lg:gap-7 md:gap-4 min-w-max sm:justify-center">
          {steps.map((step) => (
            <div
              key={step.id}
              className="w-[120px] flex-shrink-0 flex flex-col items-center relative"
            >
              {/* Step Circle */}
              <div
                className={`relative flex items-center justify-center 
                                w-10 h-10 sm:w-12 sm:h-12 rounded-full z-10
                                ${
                                  activeStep >= step.id
                                    ? "bg-[#4d44b5] text-white"
                                    : "bg-gray-200 text-gray-600"
                                }
                                ${
                                  activeStep === step.id
                                    ? "ring-2 ring-offset-2 ring-indigo-200"
                                    : ""
                                }`}
              >
                {activeStep > step.id ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>

              {/* Step Name */}
              <span className="mt-2 text-xs sm:text-sm text-center">
                {/* Mobile short name */}
                <span
                  className={`block sm:hidden truncate ${
                    activeStep >= step.id
                      ? "text-[#4d44b5] font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {step.name.split(" ")[0]}
                </span>

                {/* Full name on sm+ screens */}
                <span
                  className={`hidden sm:block ${
                    activeStep >= step.id
                      ? "text-[#4d44b5] font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current step indicator (mobile only) */}
      <div className="sm:hidden text-center text-xs text-[#4d44b5] font-medium mt-2">
        Step {activeStep} of {steps.length}:{" "}
        {steps.find((s) => s.id === activeStep)?.name}
      </div>
    </div>
  );
};

export default Timeline;
