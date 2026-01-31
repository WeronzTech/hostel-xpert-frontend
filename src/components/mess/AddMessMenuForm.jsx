// import { useState, useEffect, useRef } from "react";
// import {
//   TimePicker,
//   Button,
//   Select,
//   Input,
//   Card,
//   message,
//   Tabs,
//   Divider,
//   Space,
//   Form,
// } from "antd";
// import { PlusOutlined, IoTrashOutline } from "../../icons/index.js";
// import dayjs from "dayjs";
// import PageHeader from "../common/PageHeader";
// import ActionButton from "../common/ActionButton";
// import { useNavigate } from "react-router-dom";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { messApiService } from "../../hooks/mess/messApiService.js";

// // Helper to format Day.js object to "HH:mm" for saving
// const formatTimeForSaving = (time) =>
//   time ? dayjs(time).format("HH:mm") : null;

// // Helper to parse "HH:mm" string from state to Day.js object
// const parseTimeFromState = (timeStr) =>
//   timeStr ? dayjs(timeStr, "HH:mm") : null;

// // Data for days of the week with full and short names
// const daysOfWeek = [
//   { value: "Sunday", label: "Sun" },
//   { value: "Monday", label: "Mon" },
//   { value: "Tuesday", label: "Tue" },
//   { value: "Wednesday", label: "Wed" },
//   { value: "Thursday", label: "Thu" },
//   { value: "Friday", label: "Fri" },
//   { value: "Saturday", label: "Sat" },
// ];

// // Initial predefined category options
// const initialCategoryOptions = [
//   { value: "vegan", label: "Vegan" },
//   { value: "nonVegan", label: "Non Veg" },
//   { value: "common", label: "Common" },
// ];

// // Initial empty state for a week's menu
// const initialWeeklyMenu = {
//   Sunday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Monday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Tuesday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Wednesday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Thursday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Friday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
//   Saturday: {
//     meals: {
//       Breakfast: { items: {} },
//       Lunch: { items: {} },
//       Snacks: { items: {} },
//       Dinner: { items: {} },
//     },
//   },
// };

// // Default meal times in 24-hour format for the state
// const initialMealTimes = [
//   { mealType: "Breakfast", start: null, end: null },
//   { mealType: "Lunch", start: null, end: null },
//   { mealType: "Snacks", start: null, end: null },
//   { mealType: "Dinner", start: null, end: null },
// ];

// const AddMessMenuPage = ({ initialData = {}, loading = false }) => {
//   const [selectedDay, setSelectedDay] = useState("Sunday");
//   const [activeTabKey, setActiveTabKey] = useState("1");

//   // React Router Hooks
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const [form] = Form.useForm();
//   const [messageApi, contextHolder] = message.useMessage();

//   // Get selected property ID from Redux store
//   const selectedKitchenId = useSelector(
//     (state) => state.properties.selectedProperty.kitchenId
//   );
//   //console.log(`Selected Prperty ID: ${selectedPropertyId}`); // debug log

//   // State for all categories, including custom ones
//   const [allCategories, setAllCategories] = useState(initialCategoryOptions);
//   // State for the custom category input field
//   const [customCategoryName, setCustomCategoryName] = useState("");
//   const inputRef = useRef(null);

//   // Unified state for the entire menu configuration
//   const [menuConfig, setMenuConfig] = useState({
//     bookingStartTime: "06:00",
//     bookingEndTime: "22:00",
//     kitchenId: selectedKitchenId,
//     mealTimes: initialMealTimes,
//     menu: JSON.parse(JSON.stringify(initialWeeklyMenu)), // Deep copy
//   });

//   // TanStack Query mutation for creating the mess menu
//   const createMenuMutation = useMutation({
//     mutationFn: (menuPayload) => messApiService.createMessMenu(menuPayload),
//     onSuccess: () => {
//       //console.log("Menu created successfully:", data); // debug log
//       messageApi.success(`Mess menu created successfully!`);
//       queryClient.invalidateQueries({
//         queryKey: ["messMenu", selectedKitchenId],
//       });
//       setTimeout(() => {
//         navigate("/mess/create");
//       }, 1000);
//     },
//     onError: (error) => {
//       console.error("Menu creation error:", {
//         message: error.message,
//         details: error.details,
//         fullError: error,
//       });
//       console.error("error details:", error?.details);

//       if (Array.isArray(error.details) && error.details.length > 0) {
//         error.details.forEach((err) => {
//           messageApi.error(`${err.field}: ${err.message}`);
//         });
//       } else if (error?.message) {
//         messageApi.error(error.message);
//       } else {
//         messageApi.error("Failed to create mess menu");
//       }
//     },
//   });

//   // Effect to populate form from initialData prop
//   useEffect(() => {
//     if (initialData && Object.keys(initialData).length > 0) {
//       const formattedData = { ...initialData };
//       const newMenu = JSON.parse(JSON.stringify(initialWeeklyMenu));
//       if (formattedData.menu) {
//         formattedData.menu.forEach((dayData) => {
//           const dayName = dayData.dayOfWeek;
//           if (newMenu[dayName]) {
//             dayData.meals.forEach((mealData) => {
//               if (newMenu[dayName].meals[mealData.mealType]) {
//                 newMenu[dayName].meals[mealData.mealType].items =
//                   mealData.items || {};
//               }
//             });
//           }
//         });
//       }
//       setMenuConfig((prev) => ({ ...prev, ...formattedData, menu: newMenu }));
//     }
//   }, [initialData]);

//   // Handlers for state updates (immutable)
//   const handleDayChange = (day) => setSelectedDay(day);

//   const handleTimeChange = (type, times) => {
//     const [start, end] = times;
//     if (type === "booking") {
//       setMenuConfig((prev) => ({
//         ...prev,
//         bookingStartTime: formatTimeForSaving(start),
//         bookingEndTime: formatTimeForSaving(end),
//       }));
//     } else {
//       setMenuConfig((prev) => ({
//         ...prev,
//         mealTimes: prev.mealTimes.map((mt) =>
//           mt.mealType === type
//             ? {
//                 ...mt,
//                 start: formatTimeForSaving(start),
//                 end: formatTimeForSaving(end),
//               }
//             : mt
//         ),
//       }));
//     }
//   };

//   const handleItemChange = (mealType, category, newItems) => {
//     setMenuConfig((prev) => {
//       const newMenu = { ...prev.menu };
//       newMenu[selectedDay].meals[mealType].items[category] = newItems;
//       return { ...prev, menu: newMenu };
//     });
//   };

//   const handleSelectNewCategory = (mealType, categoryValue) => {
//     if (
//       categoryValue &&
//       !menuConfig.menu[selectedDay].meals[mealType].items[categoryValue]
//     ) {
//       setMenuConfig((prev) => {
//         const newMenu = { ...prev.menu };
//         if (!newMenu[selectedDay].meals[mealType].items) {
//           newMenu[selectedDay].meals[mealType].items = {};
//         }
//         newMenu[selectedDay].meals[mealType].items[categoryValue] = [];
//         return { ...prev, menu: newMenu };
//       });
//     } else {
//       message.warning("This category has already been added.");
//     }
//   };

//   const handleAddCustomCategory = (e, mealType) => {
//     e.preventDefault();
//     if (!customCategoryName) {
//       message.error("Category name cannot be empty.");
//       return;
//     }
//     const isDuplicate = allCategories.some(
//       (cat) => cat.label.toLowerCase() === customCategoryName.toLowerCase()
//     );
//     if (isDuplicate) {
//       message.error("This category already exists.");
//       return;
//     }

//     const newCategoryValue = customCategoryName
//       .replace(/\s+/g, "_")
//       .toLowerCase();
//     const newCategory = { value: newCategoryValue, label: customCategoryName };

//     setAllCategories((prev) => [...prev, newCategory]);
//     handleSelectNewCategory(mealType, newCategory.value);
//     setCustomCategoryName("");
//     setTimeout(() => inputRef.current?.focus(), 0);
//   };

//   const handleRemoveCategory = (mealType, category) => {
//     setMenuConfig((prev) => {
//       const newMenu = { ...prev.menu };
//       delete newMenu[selectedDay].meals[mealType].items[category];
//       return { ...prev, menu: newMenu };
//     });
//   };

//   // Final data transformation before submitting
//   const handleSave = () => {
//     // --- VALIDATION LOGIC --- //
//     if (!selectedKitchenId) {
//       messageApi.error("Cannot save menu, no kitchen is selected.");
//       return;
//     }

//     // --- PAYLOAD FORMATTING AND VALIDATION --- //
//     const finalMenu = Object.entries(menuConfig.menu)
//       .map(([dayOfWeek, dayData]) => {
//         // For each day, process its meals. Filter out meals that have no items.
//         const mealsWithItems = Object.entries(dayData.meals)
//           .map(([mealType, mealData]) => ({
//             mealType,
//             items: Object.fromEntries(
//               Object.entries(mealData.items).filter(
//                 ([_, items]) => items.length > 0
//               )
//             ),
//           }))
//           .filter((meal) => Object.keys(meal.items).length > 0);

//         return { dayOfWeek, meals: mealsWithItems };
//       })
//       // Finally, filter out any days that have no meals with items.
//       .filter((day) => day.meals.length > 0);

//     // Check if the final formatted menu is empty.
//     if (finalMenu.length === 0) {
//       messageApi.error(
//         "Please add at least one menu item to a meal before saving."
//       );
//       setActiveTabKey("1");
//       return;
//     }

//     // Filter out meal times that have both start and end times set
//     const filteredMealTimes = menuConfig.mealTimes.filter(
//       (mt) => mt.start && mt.end
//     );

//     // Validate that all required meal types have been set with times
//     const requiredMealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];
//     const missingTimeTypes = [];

//     requiredMealTypes.forEach((mealType) => {
//       const hasItemsForMeal = Object.values(menuConfig.menu).some((day) =>
//         Object.entries(day.meals[mealType]?.items || {}).some(
//           ([_, items]) => Array.isArray(items) && items.length > 0
//         )
//       );

//       const timeSetting = menuConfig.mealTimes.find(
//         (mt) => mt.mealType === mealType
//       );

//       const isTimeMissing =
//         !timeSetting || !timeSetting.start || !timeSetting.end;

//       if (hasItemsForMeal && isTimeMissing) {
//         missingTimeTypes.push(mealType);
//       }
//     });

//     if (missingTimeTypes.length > 0) {
//       messageApi.error(
//         `Please set time for ${missingTimeTypes.join(", ")} before saving.`
//       );
//       setActiveTabKey("2"); // Navigate to meal timing tab
//       return;
//     }

//     const formattedMenuPayload = {
//       ...menuConfig,
//       mealTimes: filteredMealTimes,
//       menu: finalMenu,
//     };

//     // Trigger the mutation
//     createMenuMutation.mutate(formattedMenuPayload);
//   };

//   const getCategoryLabel = (key) => {
//     const option = allCategories.find((opt) => opt.value === key);
//     return option ? option.label : key;
//   };

//   // Render Functions for UI components
//   const renderMenuItemsTab = () => (
//     <>
//       <div className="flex space-x-2 mb-6 mt-4 overflow-x-auto md:justify-center pb-2">
//         {daysOfWeek.map((day) => (
//           <div
//             key={day.value}
//             onClick={() => handleDayChange(day.value)}
//             className={`cursor-pointer px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-200
//                         ${
//                           selectedDay === day.value
//                             ? "bg-indigo-600 text-white shadow-md"
//                             : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                         }`}
//           >
//             {day.label}
//           </div>
//         ))}
//       </div>
//       <div className="flex flex-wrap gap-4">
//         {["Breakfast", "Lunch", "Snacks", "Dinner"].map((meal) =>
//           renderMealCard(meal)
//         )}
//       </div>
//     </>
//   );

//   const renderMealCard = (mealType) => {
//     const mealData = menuConfig.menu[selectedDay]?.meals[mealType];
//     if (!mealData) return null;

//     const categories = Object.keys(mealData.items);

//     const existingCategories = Object.keys(mealData.items);
//     const availableCategoryOptions = allCategories.filter(
//       (option) => !existingCategories.includes(option.value)
//     );

//     return (
//       <Card
//         key={mealType}
//         className="w-full md:w-[calc(50%-0.5rem)] bg-white border border-gray-200 rounded-lg shadow-sm"
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-800">{mealType}</h3>
//         </div>

//         <div className="space-y-4">
//           {categories.map((category) => (
//             <div key={category}>
//               <div className="flex justify-between items-center mb-1">
//                 <label className="font-medium text-gray-700">
//                   {getCategoryLabel(category)}
//                 </label>
//                 <Button
//                   type="text"
//                   danger
//                   icon={<IoTrashOutline size={14} />}
//                   onClick={() => handleRemoveCategory(mealType, category)}
//                 />
//               </div>
//               <Select
//                 mode="tags"
//                 value={mealData.items[category]}
//                 onChange={(newItems) =>
//                   handleItemChange(mealType, category, newItems)
//                 }
//                 placeholder={`Add items for ${getCategoryLabel(
//                   category
//                 )} and press Enter`}
//                 className="w-full"
//                 tokenSeparators={[","]}
//               />
//             </div>
//           ))}
//         </div>

//         <div className="mt-4">
//           <Select
//             placeholder={
//               availableCategoryOptions.length > 0
//                 ? "Add a category..."
//                 : "All categories added"
//             }
//             className="w-full"
//             value={null}
//             onSelect={(value) => handleSelectNewCategory(mealType, value)}
//             options={availableCategoryOptions}
//             disabled={
//               availableCategoryOptions.length === 0 && !customCategoryName
//             }
//             popupRender={(menu) => (
//               <>
//                 {menu}
//                 <Divider style={{ margin: "8px 0" }} />
//                 <Space style={{ padding: "0 8px 4px" }}>
//                   <Input
//                     placeholder="Please enter meal type"
//                     ref={inputRef}
//                     value={customCategoryName}
//                     onChange={(e) => setCustomCategoryName(e.target.value)}
//                     onKeyDown={(e) => e.stopPropagation()}
//                   />
//                   <Button
//                     type="text"
//                     icon={<PlusOutlined />}
//                     onClick={(e) => handleAddCustomCategory(e, mealType)}
//                   >
//                     Add
//                   </Button>
//                 </Space>
//               </>
//             )}
//           />
//         </div>
//       </Card>
//     );
//   };

//   const renderTimingsTab = () => (
//     <Form form={form} layout="vertical" name="bookingForm">
//       <div className="max-w-2xl mx-auto space-y-6">
//         <Card
//           title="Overall Booking Window"
//           variant="borderless"
//           className="bg-gray-50 rounded-lg"
//         >
//           <Form.Item
//             label="Booking Time"
//             name="bookingTime"
//             rules={[
//               {
//                 required: true,
//                 message: "Please select the overall booking window.",
//               },
//             ]}
//             initialValue={[
//               parseTimeFromState(menuConfig.bookingStartTime),
//               parseTimeFromState(menuConfig.bookingEndTime),
//             ]}
//           >
//             <TimePicker.RangePicker
//               format="hh:mm A"
//               className="w-full"
//               onChange={(times) => handleTimeChange("booking", times)}
//             />
//           </Form.Item>
//         </Card>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {menuConfig.mealTimes.map(({ mealType, start, end }) => (
//             <Card
//               key={mealType}
//               title={mealType}
//               size="small"
//               variant="borderless"
//               className="bg-white rounded-lg shadow-sm"
//             >
//               <TimePicker.RangePicker
//                 value={[parseTimeFromState(start), parseTimeFromState(end)]}
//                 onChange={(times) => handleTimeChange(mealType, times)}
//                 format="hh:mm A"
//                 className="w-full"
//               />
//             </Card>
//           ))}
//         </div>
//       </div>
//     </Form>
//   );

//   // Effect to handle property selection
//   const initialRenderRef = useRef(true);

//   useEffect(() => {
//     if (initialRenderRef.current) {
//       initialRenderRef.current = false;
//       return;
//     }

//     if (!selectedKitchenId) {
//       message.warning(
//         "No kitchen selected. Redirecting to menu creation page..."
//       );
//       setTimeout(() => {
//         navigate("/mess/create");
//       }, 1000);
//       return;
//     }

//     message.info("Property changed. Returning to menu creation.");
//     setTimeout(() => {
//       navigate("/mess/create");
//     }, 1000);
//   }, [navigate, selectedKitchenId]);

//   return (
//     <>
//       {contextHolder}
//       <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
//         <PageHeader
//           title="Create Weekly Mess Menu"
//           subtitle="Define the menu for each day of the week and meal timings"
//         />
//         <div className="max-w-7xl mx-auto">
//           {/* Main Content */}
//           <div className="bg-white p-6 rounded-xl shadow-lg">
//             <Tabs
//               activeKey={activeTabKey}
//               onChange={setActiveTabKey}
//               centered
//               items={[
//                 {
//                   key: "1",
//                   label: "Menu Items",
//                   children: renderMenuItemsTab(),
//                 },
//                 {
//                   key: "2",
//                   label: "Meal Timings",
//                   children: renderTimingsTab(),
//                 },
//               ]}
//             />

//             {/* Action Buttons */}
//             <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
//               {activeTabKey === "1" && (
//                 <ActionButton onClick={() => setActiveTabKey("2")}>
//                   Next
//                 </ActionButton>
//               )}

//               {activeTabKey === "2" && (
//                 <>
//                   <ActionButton
//                     type="default"
//                     onClick={() => navigate("/mess/create")}
//                   >
//                     Cancel
//                   </ActionButton>
//                   <ActionButton
//                     type="primary"
//                     onClick={handleSave}
//                     loading={loading}
//                   >
//                     Save Full Menu
//                   </ActionButton>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AddMessMenuPage;
import { useState, useEffect, useMemo } from "react";
import { TimePicker, Button, Select, Card, message, Tabs, Form } from "antd";
import dayjs from "dayjs";
import PageHeader from "../common/PageHeader";
import ActionButton from "../common/ActionButton";
import { useNavigate } from "react-router-dom";
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
// It now uses `itemIds` to store an array of recipe IDs.
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

const AddMessMenuPage = ({ loading = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const selectedKitchenId = useSelector(
    (state) => state.properties.selectedProperty.kitchenId
  );

  const [selectedDay, setSelectedDay] = useState("Sunday");
  const [activeTabKey, setActiveTabKey] = useState("1");

  const [menuConfig, setMenuConfig] = useState({
    bookingStartTime: "06:00",
    bookingEndTime: "22:00",
    kitchenId: selectedKitchenId,
    mealTimes: initialMealTimes,
    menu: JSON.parse(JSON.stringify(initialWeeklyMenuState)),
  });

  // --- NEW: Fetch all available recipes for the dropdowns ---
  const { data: recipeData, isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes", selectedKitchenId],
    queryFn: () => getAllRecipe({ kitchenId: selectedKitchenId }),
    enabled: !!selectedKitchenId,
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

  const createMenuMutation = useMutation({
    mutationFn: (payload) => messApiService.createMessMenu(payload),
    onSuccess: () => {
      messageApi.success("Mess menu created successfully!");
      queryClient.invalidateQueries(["messMenu", selectedKitchenId]);
      setTimeout(() => navigate("/mess/create"), 1000);
    },
    onError: (error) => {
      console.error("Create error:", error);
      messageApi.error(error.message || "Menu creation failed");
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
    if (!selectedKitchenId) {
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
      kitchenId: selectedKitchenId,
      mealTimes: filteredMealTimes,
      menu: finalMenuPayload,
    };

    createMenuMutation.mutate(formattedPayload);
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
          title="Create Weekly Mess Menu"
          subtitle="Define the menu for each day of the week and meal timings"
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
                    loading={loading || createMenuMutation.isLoading}
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

export default AddMessMenuPage;
