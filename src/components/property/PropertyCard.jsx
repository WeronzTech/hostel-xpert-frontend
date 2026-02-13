import {FiMapPin, FiHome, FiEye} from "../../icons/index.js";
import {Link} from "react-router-dom";

const PropertyCard = ({property}) => {
  const [city, branch, phase] = property.location.split(", ");
  const occupancyRate =
    property.totalBeds > 0
      ? Math.round((property.occupied / property.totalBeds) * 100)
      : 0;
  const vacancyCount = property.totalBeds - property.occupied;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-5 space-y-4">
        {/* Header with icon and concise location */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <FiHome className="text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
              {property.propertyName}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <FiMapPin className="flex-shrink-0" />
              <span className="line-clamp-1">
                {branch}, {city}
              </span>
            </p>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs font-medium">Total Beds</p>
            <p className="font-semibold text-gray-800">{property.totalBeds}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs font-medium">Occupied</p>
            <p className="font-semibold text-blue-600">{property.occupied}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs font-medium">Vacant</p>
            <p className="font-semibold text-gray-800">{vacancyCount}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs font-medium">Occupancy</p>
            <p className="font-semibold text-gray-800">{occupancyRate}%</p>
          </div>
        </div>

        {/* Visual progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Occupancy</span>
            <span>
              {property.occupied}/{property.totalBeds} rooms
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                occupancyRate < 50
                  ? "bg-red-400"
                  : occupancyRate < 75
                    ? "bg-yellow-400"
                    : "bg-emerald-500"
              }`}
              style={{width: `${occupancyRate}%`}}
            />
          </div>
        </div>
      </div>

      {/* Subtle footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
        <span className="text-xs text-gray-500">Phase {phase}</span>
        <Link
          className="text-sm font-medium text-[#059669] hover:text-[#059669] flex items-center gap-1"
          to={`/property/${property._id}`} // ✅ sends correct ID to details
        >
          <FiEye className="text-sm" />
          View Details
        </Link>
      </div>
    </div>
  );
};

const EmptyState = ({searchTerm}) => (
  <div className="col-span-full flex justify-center">
    {" "}
    {/* This ensures it spans all columns and centers */}
    <div className="text-center py-8 bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <FiMapPin className="text-gray-400 text-xl" />
      </div>
      <h4 className="text-gray-600 font-medium mb-1">No properties found</h4>
      <p className="text-gray-400 text-sm">
        {searchTerm
          ? `No matches for "${searchTerm}"`
          : "No properties available"}
      </p>
    </div>
  </div>
);
export {PropertyCard, EmptyState};
