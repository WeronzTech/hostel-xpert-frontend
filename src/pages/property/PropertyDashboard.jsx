import {useState, useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {
  FiSearch,
  FiHome,
  FiUsers,
  FiAlertTriangle,
  FaRupeeSign,
} from "../../icons/index.js";
import {useNavigate} from "react-router-dom";
import {getAllHeavensProperties} from "../../hooks/property/useProperty";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner";
import PageHeader from "../../components/common/PageHeader";
import StatsGrid from "../../components/common/StatsGrid";
import {
  PropertyCard,
  EmptyState,
} from "../../components/property/PropertyCard.jsx";
import {Button, Result} from "antd";
import {FaUserCheck} from "react-icons/fa";
import {useSelector} from "react-redux";

const PropertyDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();
  const {selectedProperty} = useSelector((state) => state.properties);

  const placeholderTerms = [
    "State",
    "City",
    "Location",
    "Branch",
    "Phase",
    "Property",
  ];

  // Calculate stats based on filtered properties
  const calculateStats = (filteredProps, allProps) => {
    // Ensure filteredProps is always an array
    const filteredArray = Array.isArray(filteredProps)
      ? filteredProps
      : [filteredProps];
    const allArray = Array.isArray(allProps) ? allProps : [allProps];

    const isFiltered = filteredArray.length !== allArray.length;
    const totalOccupancy = filteredArray.reduce(
      (sum, p) => sum + (p.occupiedBeds || 0),
      0,
    );
    const totalRevenue = filteredArray.reduce(
      (sum, p) => sum + (p.revenue || 0),
      0,
    );
    const totalRooms = filteredArray.reduce(
      (sum, p) => sum + (p.totalBeds || 0),
      0,
    );
    const occupancyRate =
      totalRooms > 0 ? Math.round((totalOccupancy / totalRooms) * 100) : 0;

    return [
      {
        title: isFiltered ? "Matching Properties" : "Total Properties",
        value: filteredArray.length,
        icon: <FiHome className="text-xl" />,
        color:
          filteredArray.length > 0
            ? "bg-indigo-100 text-indigo-600"
            : "bg-red-100 text-red-600",
      },
      {
        title: "Total Occupancy",
        value: `${totalOccupancy}/${totalRooms}`,
        icon: <FiUsers className="text-xl" />,
        color:
          filteredArray.length > 0
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-600",
      },
      {
        title: "Occupancy Rate",
        value: `${occupancyRate}%`,
        icon: <FaUserCheck className="text-xl" />,
        color:
          occupancyRate > 75
            ? "bg-green-100 text-green-600"
            : occupancyRate > 50
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600",
      },
      {
        title: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString()}`,
        icon: <FaRupeeSign className="text-xl" />,
        color:
          filteredArray.length > 0
            ? "bg-indigo-100 text-indigo-600"
            : "bg-red-100 text-red-600",
      },
    ];
  };

  // Use TanStack Query to fetch properties
  const {
    data: properties = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["properties", selectedProperty?.id],
    queryFn: () => {
      return getAllHeavensProperties(selectedProperty.id);
    },
    enabled: true, // Always enabled
  });
  console.log(properties);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex(
        (prev) => (prev + 1) % placeholderTerms.length,
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [currentPlaceholderIndex, placeholderTerms.length]);

  // Filter properties based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
      setStats(calculateStats(properties, properties));
      return;
    }

    const results = properties.filter(
      (property) =>
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredProperties(results);
    setStats(calculateStats(results, properties));
  }, [searchTerm, properties]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="mb-6 bg-white rounded-lg p-2 flex items-center justify-center">
        <Result
          status="error"
          title={
            <h4 className="text-base font-semibold text-gray-800">
              Failed to load properties
            </h4>
          }
          subTitle={
            <p className="text-sm text-gray-500 max-w-md">{error.message}</p>
          }
          icon={
            <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto">
              <FiAlertTriangle className="text-red-500 text-2xl" />
            </div>
          }
          extra={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      <PageHeader
        title="Property Overview"
        subtitle="Manage all properties and their associated settings"
      />

      <StatsGrid
        stats={stats}
        cols={{default: 1, sm: 2, md: 3, lg: 4, xl: 4}}
      />

      {/* Search Bar with Add Property Button */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-col md:flex-row lg:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Dynamic placeholder overlay */}
            {!searchTerm && (
              <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                <span className="text-gray-400">
                  Search your{" "}
                  <span className="text-[#059669] font-medium">
                    {placeholderTerms[currentPlaceholderIndex]}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Add Property Button */}
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <button
              className="w-full md:w-auto cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg hover:bg-[#059669] transition-colors"
              onClick={() => navigate("/add-property")}
            >
              <FiHome className="text-lg" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={{
                ...property,
                totalBeds: property.totalBeds,
                occupied: property.occupiedBeds,
              }}
            />
          ))
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </div>
    </div>
  );
};

export default PropertyDashboard;
