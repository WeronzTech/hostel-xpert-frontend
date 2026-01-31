import { useState, useEffect, useMemo } from "react";
import { TimePicker, Button, Select, Card, message, Tabs, Form } from "antd";
import dayjs from "dayjs";
import PageHeader from "../common/PageHeader";
import ActionButton from "../common/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { messApiService } from "../../hooks/mess/messApiService.js";
import { getAllRecipe } from "../../hooks/inventory/useInventory.js";

// Helper to format Day.js object to "HH:mm" for saving
const formatTimeForSaving = (time) =>
  time ? dayjs(time).format("HH:mm") : null;

// Helper to parse "HH:mm" string from state to Day.js object
const parseTimeFromState = (timeStr) =>
  timeStr ? dayjs(timeStr, "HH:mm") : null;

const daysOfWeek = [
  { value: "Sunday", label: "Sun" },
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
];

const initialMealTimes = [
  { mealType: "Breakfast", start: null, end: null },
  { mealType: "Lunch", start: null, end: null },
  { mealType: "Snacks", start: null, end: null },
  { mealType: "Dinner", start: null, end: null },
];

// This structure is for the frontend state ONLY.
const initialWeeklyMenuState = {
  Sunday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Monday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Tuesday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Wednesday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Thursday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Friday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
  Saturday: {
    meals: {
      Breakfast: { itemIds: [] },
      Lunch: { itemIds: [] },
      Snacks: { itemIds: [] },
      Dinner: { itemIds: [] },
    },
  },
};

const EditMessMenuPage = ({ loading = false }) => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [initialData, setInitialData] = useState(state?.menuData);

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id
  );

  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [activeTabKey, setActiveTabKey] = useState("1");

  const [menuConfig, setMenuConfig] = useState({
    bookingStartTime: "06:00",
    bookingEndTime: "22:00",
    mealTimes: initialMealTimes,
    menu: JSON.parse(JSON.stringify(initialWeeklyMenuState)),
  });

  const kitchenId = initialData?.kitchenId;

  // --- NEW: Fetch all available recipes for the dropdowns ---
  const { data: recipeData, isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes", kitchenId],
    queryFn: () => getAllRecipe({ kitchenId }),
    enabled: !!kitchenId,
    staleTime: Infinity, // Recipes don't change often, so cache them
  });

  // Format recipes for the Select component's `options` prop
  const recipeOptions = useMemo(() => {
    if (!recipeData) return [];
    return recipeData.map((recipe) => ({
      label: recipe.name,
      value: recipe._id,
    }));
  }, [recipeData]);

  // Prefill state from API data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const newMenuState = JSON.parse(JSON.stringify(initialWeeklyMenuState));

      initialData.menu.forEach((day) => {
        const dayName = day.dayOfWeek;
        if (newMenuState[dayName]) {
          day.meals.forEach((meal) => {
            if (newMenuState[dayName].meals[meal.mealType]) {
              // Store the IDs, not the full objects
              newMenuState[dayName].meals[meal.mealType].itemIds =
                meal.itemIds.map((item) => item._id);
            }
          });
        }
      });

      const requiredMealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];
      const updatedMealTimes = requiredMealTypes.map((mealType) => {
        const found = initialData.mealTimes?.find(
          (mt) => mt.mealType === mealType
        );
        return found ?? { mealType, start: null, end: null };
      });

      setMenuConfig({
        bookingStartTime: initialData.bookingStartTime,
        bookingEndTime: initialData.bookingEndTime,
        mealTimes: updatedMealTimes,
        menu: newMenuState,
      });
    }
  }, [initialData]);

  const updateMenuMutation = useMutation({
    mutationFn: (payload) => messApiService.updatedMenuData(payload),
    onSuccess: () => {
      messageApi.success("Mess menu updated successfully!");
      queryClient.invalidateQueries(["messMenu", kitchenId]);
      setTimeout(() => navigate("/mess/create"), 1000);
    },
    onError: (error) => {
      console.error("Edit error:", error);
      messageApi.error(error.message || "Update failed");
    },
  });

  const handleDayChange = (day) => setSelectedDay(day);

  const handleTimeChange = (type, times) => {
    const [start, end] = times || [];
    if (type === "booking") {
      setMenuConfig((prev) => ({
        ...prev,
        bookingStartTime: formatTimeForSaving(start),
        bookingEndTime: formatTimeForSaving(end),
      }));
    } else {
      setMenuConfig((prev) => ({
        ...prev,
        mealTimes: prev.mealTimes.map((mt) =>
          mt.mealType === type
            ? {
                ...mt,
                start: formatTimeForSaving(start),
                end: formatTimeForSaving(end),
              }
            : mt
        ),
      }));
    }
  };

  // The `selectedIds` is now an array of recipe IDs
  const handleItemChange = (mealType, selectedIds) => {
    setMenuConfig((prev) => {
      const newMenu = { ...prev.menu };
      newMenu[selectedDay].meals[mealType].itemIds = selectedIds;
      return { ...prev, menu: newMenu };
    });
  };

  const handleSave = () => {
    if (!selectedPropertyId) {
      messageApi.error("No property selected");
      return;
    }

    const finalMenuPayload = Object.entries(menuConfig.menu)
      .map(([dayOfWeek, dayData]) => {
        const mealsWithItems = Object.entries(dayData.meals)
          .map(([mealType, mealData]) => ({
            mealType,
            itemIds: mealData.itemIds, // This is now an array of IDs
          }))
          .filter((meal) => meal.itemIds.length > 0);

        return { dayOfWeek, meals: mealsWithItems };
      })
      .filter((day) => day.meals.length > 0);

    if (finalMenuPayload.length === 0) {
      messageApi.error("Please add at least one menu item before saving.");
      return;
    }

    const filteredMealTimes = menuConfig.mealTimes.filter(
      (mt) => mt.start && mt.end
    );

    const formattedPayload = {
      bookingStartTime: menuConfig.bookingStartTime,
      bookingEndTime: menuConfig.bookingEndTime,
      kitchenId: initialData?.kitchenId,
      mealTimes: filteredMealTimes,
      menu: finalMenuPayload,
    };

    updateMenuMutation.mutate(formattedPayload);
  };

  const renderMenuItemsTab = () => {
    if (!menuConfig?.menu || !menuConfig.menu[selectedDay]) return null;

    return (
      <>
        <div className="flex space-x-2 mb-6 mt-4 overflow-x-auto md:justify-center pb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day.value}
              onClick={() => handleDayChange(day.value)}
              className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200 ${
                selectedDay === day.value
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {day.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {["Breakfast", "Lunch", "Snacks", "Dinner"].map((meal) =>
            renderMealCard(meal)
          )}
        </div>
      </>
    );
  };

  // --- UPDATED: renderMealCard now uses a searchable multi-select dropdown ---
  const renderMealCard = (mealType) => {
    const mealData = menuConfig.menu[selectedDay]?.meals[mealType];
    if (!mealData) return null;

    return (
      <Card
        key={mealType}
        className="w-full md:w-[calc(50%-0.5rem)] bg-white border border-gray-200 rounded-lg shadow-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{mealType}</h3>
        <Select
          mode="multiple"
          allowClear
          value={mealData.itemIds}
          onChange={(selectedIds) => handleItemChange(mealType, selectedIds)}
          placeholder={`Select items for ${mealType}`}
          className="w-full"
          options={recipeOptions}
          loading={recipesLoading}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </Card>
    );
  };

  const renderTimingsTab = () => (
    <Form form={form} layout="vertical" name="bookingForm">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card
          title="Overall Booking Window"
          variant="borderless"
          className="bg-gray-50 rounded-lg"
        >
          <Form.Item
            label="Booking Time"
            name="bookingTime"
            rules={[
              {
                required: true,
                message: "Please select the overall booking window.",
              },
            ]}
            initialValue={[
              parseTimeFromState(menuConfig.bookingStartTime),
              parseTimeFromState(menuConfig.bookingEndTime),
            ]}
          >
            <TimePicker.RangePicker
              format="hh:mm A"
              className="w-full"
              onChange={(times) => handleTimeChange("booking", times)}
            />
          </Form.Item>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuConfig.mealTimes.map(({ mealType, start, end }) => (
            <Card
              key={mealType}
              title={mealType}
              size="small"
              variant="borderless"
              className="bg-white rounded-lg shadow-sm"
            >
              <TimePicker.RangePicker
                value={[parseTimeFromState(start), parseTimeFromState(end)]}
                onChange={(times) => handleTimeChange(mealType, times)}
                format="hh:mm A"
                className="w-full"
              />
            </Card>
          ))}
        </div>
      </div>
    </Form>
  );

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Edit Weekly Mess Menu"
          subtitle="Modify menu items and timings"
        />
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              centered
              items={[
                {
                  key: "1",
                  label: "Menu Items",
                  children: renderMenuItemsTab(),
                },
                {
                  key: "2",
                  label: "Meal Timings",
                  children: renderTimingsTab(),
                },
              ]}
            />
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              {activeTabKey === "1" && (
                <ActionButton onClick={() => setActiveTabKey("2")}>
                  Next
                </ActionButton>
              )}
              {activeTabKey === "2" && (
                <>
                  <ActionButton
                    type="default"
                    onClick={() => navigate("/mess/create")}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    type="primary"
                    onClick={handleSave}
                    loading={loading || updateMenuMutation.isLoading}
                  >
                    Save Full Menu
                  </ActionButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditMessMenuPage;
