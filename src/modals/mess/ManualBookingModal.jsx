import {useEffect, useState} from "react";
import {
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Button,
  message,
} from "antd";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {messApiService} from "../../hooks/mess/messApiService.js";
import {getKitchens} from "../../hooks/inventory/useInventory.js";
import moment from "moment";

const {Option} = Select;

export default function ManualBookingModal({open, onClose, selectedProperty}) {
  const [form] = Form.useForm();
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [filter, setFilter] = useState({});
  const [tomorrowDate, setTomorrowDate] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const queryClient = useQueryClient();

  // ✅ Always set tomorrow's date when modal opens
  useEffect(() => {
    if (open) {
      const tomorrow = moment().add(1, "days");
      const formattedDate = tomorrow.format("DD/MM/YYYY");
      setTomorrowDate(formattedDate);

      form.setFieldsValue({
        bookingDate: tomorrow,
      });

      if (selectedProperty?.id) {
        setFilter({propertyId: selectedProperty.id});
      } else {
        setFilter({});
      }
      setSelectedKitchen(null);
      form.resetFields(["kitchenId", "menuId"]);
    }
  }, [open, selectedProperty, form]);

  // ✅ Fetch kitchens - show all when no property selected
  const {data: kitchens = [], isLoading: loadingKitchen} = useQuery({
    queryKey: ["kitchens", filter],
    queryFn: () => getKitchens(filter),
    enabled: open, // Fetch when modal is open, regardless of property selection
    select: (data) => {
      // Extract array from response
      const kitchensData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      console.log("All kitchens from API:", kitchensData);
      console.log("Selected property:", selectedProperty?.name);

      // If no property is selected, return ALL kitchens
      if (!selectedProperty?.id) {
        console.log("No property selected - showing all kitchens");
        return kitchensData;
      }

      // If property is selected, filter kitchens that serve this property
      const filteredKitchens = kitchensData.filter((kitchen) => {
        // Check if kitchen.propertyId is an array of objects with _id property
        if (Array.isArray(kitchen.propertyId)) {
          // Extract all property IDs from the objects in the array
          const propertyIds = kitchen.propertyId.map(
            (property) => property._id
          );
          const hasProperty = propertyIds.includes(selectedProperty.id);

          console.log(
            `Kitchen ${kitchen.name} property IDs:`,
            propertyIds,
            "Match:",
            hasProperty
          );
          return hasProperty;
        }

        return false;
      });

      console.log("Filtered kitchens for property:", filteredKitchens);
      return filteredKitchens;
    },
  });

  // ✅ Fetch menu list for selected kitchen
  const {data: menuList = [], isLoading: loadingMenu} = useQuery({
    queryKey: ["menus", selectedKitchen],
    queryFn: () =>
      selectedKitchen && messApiService.getMessMenu(selectedKitchen),
    enabled: !!selectedKitchen,
    select: (res) => {
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.menu)) return res.menu;
      return [];
    },
  });

  // ✅ Mutation for creating booking
  const {mutateAsync: createBooking, isLoading: submitting} = useMutation({
    mutationFn: (payload) => messApiService.createManualMealBookings(payload),
    onSuccess: (data) => {
      messageApi.success(data.message);
      onClose();
      queryClient.invalidateQueries({queryKey: ["orders"]});
      queryClient.invalidateQueries({queryKey: ["mess-order-list"]});
    },
    onError: (err) => {
      message.error(
        err?.response?.data?.message || "Failed to create manual meal booking"
      );
    },
  });

  const handleSubmit = async (values) => {
    if (!selectedProperty?.id) {
      message.error("Please select a property first.");
      return;
    }
    if (!selectedKitchen) {
      message.error("Please select a kitchen.");
      return;
    }

    try {
      const payload = {
        propertyId: selectedProperty.id,
        kitchenId: selectedKitchen,
        count: values.count,
        mealType: values.mealType,
        bookingDate: moment(values.bookingDate).format("YYYY-MM-DD"),
        menuId: values.menuId,
      };

      console.log("Submitting booking payload:", payload);
      await createBooking(payload);
    } catch (error) {
      console.error("Booking submission error:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedKitchen(null);
    setTomorrowDate("");
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Add Manual Meal Booking for Tomorrow (${tomorrowDate})`}
        open={open}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Kitchen Dropdown */}
          <Form.Item
            label="Select Kitchen"
            name="kitchenId"
            rules={[{required: true, message: "Please select a kitchen"}]}
          >
            <Select
              placeholder={
                loadingKitchen
                  ? "Loading kitchens..."
                  : kitchens.length === 0
                  ? "No kitchens available"
                  : selectedProperty?.id
                  ? "Select kitchen for " + selectedProperty.name
                  : "Select kitchen (all kitchens shown)"
              }
              loading={loadingKitchen}
              onChange={(value) => setSelectedKitchen(value)}
              disabled={loadingKitchen}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={
                !loadingKitchen ? "No kitchens found" : "Loading kitchens..."
              }
            >
              {kitchens.map((kitchen) => (
                <Option key={kitchen._id} value={kitchen._id}>
                  {kitchen.name}
                  {kitchen.location ? ` (${kitchen.location})` : ""}
                  {/* Show associated properties */}
                  {kitchen.propertyId && Array.isArray(kitchen.propertyId) && (
                    <span style={{color: "#999", fontSize: "12px"}}>
                      {" "}
                      - Serves:{" "}
                      {kitchen.propertyId.map((p) => p.name).join(", ")}
                    </span>
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Count */}
          <Form.Item
            label="Count"
            name="count"
            rules={[{required: true, message: "Please enter count"}]}
          >
            <InputNumber min={1} style={{width: "100%"}} />
          </Form.Item>

          {/* Meal Type */}
          <Form.Item
            label="Meal Type"
            name="mealType"
            rules={[{required: true, message: "Please select meal type"}]}
          >
            <Select placeholder="Select meal type">
              <Option value="Breakfast">Breakfast</Option>
              <Option value="Lunch">Lunch</Option>
              <Option value="Dinner">Dinner</Option>
            </Select>
          </Form.Item>

          {/* Booking Date - Hidden but still in form */}
          <Form.Item name="bookingDate" hidden>
            <DatePicker />
          </Form.Item>

          {/* Menu Dropdown */}
          <Form.Item
            label="Select Menu"
            name="menuId"
            rules={[{required: true, message: "Please select menu"}]}
          >
            <Select
              placeholder={
                selectedKitchen
                  ? "Select menu"
                  : "Please select a kitchen first"
              }
              loading={loadingMenu}
              disabled={!selectedKitchen}
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent={
                selectedKitchen && !loadingMenu
                  ? "No menus available for this kitchen"
                  : "Please select a kitchen first"
              }
            >
              {menuList.map((menu) => (
                <Option
                  key={menu._id || menu.menuId}
                  value={menu._id || menu.menuId}
                >
                  {menu.menuName || menu.name || `Menu - ${menu._id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              disabled={!selectedProperty?.id || !kitchens.length || submitting}
            >
              {!selectedProperty?.id
                ? "Please select a property first"
                : kitchens.length === 0
                ? "No kitchens available"
                : submitting
                ? "Creating booking..."
                : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
