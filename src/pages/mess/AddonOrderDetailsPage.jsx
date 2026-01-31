import {AddonDetailsTable, StatsGrid} from "../../components/index.js";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {getAddonOrderByPropertyId} from "../../hooks/inventory/useInventory.js";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useSocket} from "../../context/SocketContext.jsx";
import {MdOutlineFreeBreakfast, MdPendingActions} from "react-icons/md";
import {IoFastFoodOutline} from "react-icons/io5";
import {PiCurrencyInrBold} from "react-icons/pi";

function AddonOrderDetailsPage() {
  const [filter, setFilter] = useState({});
  const {socket} = useSocket(); // 2. Get the socket instance from context
  const queryClient = useQueryClient();

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty?.id
  );

  const {data: addonOrderData} = useQuery({
    queryKey: ["addon-order-list", filter],
    queryFn: () => getAddonOrderByPropertyId(filter),
  });

  useEffect(() => {
    if (selectedPropertyId) {
      setFilter({propertyId: selectedPropertyId});
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    if (socket) {
      // Define the handler function for the event
      const handleNewAddonBooking = (newBookingData) => {
        console.log("Received new addon booking:", newBookingData);

        // Manually update the react-query cache
        queryClient.setQueryData(["addon-order-list", filter], (oldData) => {
          // If there's no old data, create a new structure
          if (!oldData) {
            return {data: [newBookingData]};
          }
          // Otherwise, prepend the new booking to the existing list
          return {
            ...oldData,
            data: [newBookingData, ...oldData.data],
          };
        });
      };

      // Listen for the 'new-addon-booking' event
      socket.on("new-addon-booking", handleNewAddonBooking);

      // Cleanup function: remove the listener when the component unmounts
      return () => {
        socket.off("new-addon-booking", handleNewAddonBooking);
      };
    }
  }, [socket, queryClient, filter]);

  const stats = [
    {
      title: "Total Bookings Today",
      value: addonOrderData?.todayBookingCount || 0,
      icon: <MdOutlineFreeBreakfast className="text-xl" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Pending Orders",
      value: addonOrderData?.pendingCount || 0,
      icon: <MdPendingActions className="text-xl" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Delivered Orders",
      value: addonOrderData?.deliveredCount || 0,
      icon: <IoFastFoodOutline className="text-xl" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Today's Delivered Total (₹)",
      value: addonOrderData?.todayDeliveredTotal?.toLocaleString() || 0,
      icon: <PiCurrencyInrBold className="text-xl" />,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {" "}
      <StatsGrid stats={stats} />
      {/* Table */}
      <AddonDetailsTable bookings={addonOrderData?.data} />
    </div>
  );
}

export default AddonOrderDetailsPage;
