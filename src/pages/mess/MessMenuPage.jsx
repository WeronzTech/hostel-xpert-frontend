import {useState} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {Card, Tag, Typography, Row, Col, Divider, Button} from "antd";
import {
  EditOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "../../icons/index.js";
import {useQuery} from "@tanstack/react-query";

import PageHeader from "../../components/common/PageHeader.jsx";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import {messApiService} from "../../hooks/mess/messApiService.js";
import {ActionButton} from "../../components/index.js";

const {Title, Text} = Typography;

// Helper function to format time
const formatTime = (time) => {
  if (!time) return "N/A";
  return dayjs(time, "HH:mm").format("hh:mm A");
};

// Header displaying meal timing info
const Header = ({title, bookingStartTime, bookingEndTime, onEditClicked}) => (
  <div className="mb-4 flex justify-between items-center">
    <div>
      <Title level={3} className="m-0">
        {title}
      </Title>
      <span className="text-md text-gray-600 font-medium">
        <ClockCircleOutlined className="mr-1" /> {formatTime(bookingStartTime)}{" "}
        - {formatTime(bookingEndTime)}
      </span>
    </div>
    <div className="flex gap-2">
      <ActionButton
        type="default"
        icon={<EditOutlined className="text-md" />}
        onClick={onEditClicked}
      >
        Edit
      </ActionButton>
    </div>
  </div>
);

function MessMenuPage() {
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const selectedKitchenId = useSelector(
    (state) => state.properties.selectedProperty.kitchenId
  );

  // State to track selected day in the week
  const [selectedDay, setSelectedDay] = useState(
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][new Date().getDay()]
  );

  const currentDay = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date().getDay()];

  // Fetch mess menu using tanstack-query
  const {data, error, isLoading, isError, refetch} = useQuery({
    queryKey: ["messMenu", selectedKitchenId],
    queryFn: () => messApiService.getMessMenu(selectedKitchenId),
    enabled: !!selectedKitchenId,
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // Handle error and empty state (first-time menu creation)
  // if (data?.data?.length === 0 || isError) {
  //   const msg = error?.message || "Something went wrong";

  //   if (data?.data?.length === 0) {
  //     return (
  //       <ErrorState
  //         isEmpty
  //         message="No Mess Menu Available"
  //         description="You haven't added a weekly menu for this property yet."
  //         actionText="Add Menu"
  //         onAction={() => navigate("/mess/create/menu")}
  //         icon={<PlusOutlined />}
  //       />
  //     );
  //   }

  //   return (
  //     <ErrorState
  //       message="Failed to load mess menu"
  //       description={msg}
  //       onAction={() => refetch()}
  //       actionText="Try Again"
  //     />
  //   );
  // }

  // Destructure menu data
  const menuData = data?.data?.[0];
  const activeMenu = menuData?.menu?.find(
    (day) => day.dayOfWeek === selectedDay
  );

  const handleEdit = () => {
    // console.log("clicked edit"); //debug log
    setTimeout(() => {
      navigate("/mess/edit", {state: {menuData}});
    }, 0); // 0 or 100ms to avoid render-block
  };

  return (
    <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
      {/* Page Header */}
      <PageHeader
        title="Mess Menu"
        subtitle="Manage the daily menu for the Mess and the meal timings"
        actionBtn={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/mess/create/menu")}
          >
            Add Menu
          </Button>
        }
        showCalendar={false}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate("/mess/create/menu")}
      >
        Add Menu
      </Button>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Timings Header */}
        <Header
          title="Meal Timings"
          bookingStartTime={menuData?.bookingStartTime}
          bookingEndTime={menuData?.bookingEndTime}
          onEditClicked={handleEdit}
        />

        {/* Meal Timings List */}
        <Row gutter={[16, 16]} className="mb-8">
          {menuData?.mealTimes?.map((meal) => (
            <Col xs={24} sm={12} lg={6} key={meal?.mealType}>
              <div className="p-3 bg-slate-100 rounded-lg">
                <Text strong>{meal?.mealType}</Text>
                <div className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                  <ClockCircleOutlined />
                  <span>
                    {formatTime(meal?.start)} - {formatTime(meal?.end)}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* Main Content: Days + Meals */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Day Selector */}
          <div className="md:w-1/5">
            <ul className="space-y-2">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((day) => (
                <li key={day}>
                  <button
                    onClick={() => setSelectedDay(day)}
                    className={`w-full text-left p-3 rounded-lg transition-all text-md cursor-pointer font-semibold ${
                      selectedDay === day
                        ? "bg-blue-100 text-blue-700 border-l-4 border-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {day}
                      {day === currentDay && <Tag color="blue">Today</Tag>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Meal Sections */}
          <div className="flex-1">
            <Row gutter={[24, 24]}>
              {menuData?.mealTimes?.map((mealTime) => {
                const mealData = activeMenu?.meals.find(
                  (m) => m.mealType === mealTime?.mealType
                );
                const hasItems =
                  mealData?.itemIds && mealData?.itemIds?.length > 0;

                return (
                  <Col xs={24} md={12} key={mealTime?.mealType}>
                    <Card
                      title={<Text strong>{mealTime?.mealType}</Text>}
                      variant="borderless"
                      className="h-full shadow-sm border border-slate-200"
                    >
                      {hasItems ? (
                        <div
                          className="space-y-4"
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          <ul className="space-y-1 pl-5 list-disc">
                            {mealData?.itemIds?.map((item) => (
                              <li key={item?._id} className="text-slate-600">
                                {item?.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <Text type="secondary" italic>
                          Not available.
                        </Text>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessMenuPage;
