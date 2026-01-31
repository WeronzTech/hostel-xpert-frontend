import { useState, useMemo } from "react";
import {
  message,
  Button,
  Dropdown,
  Checkbox,
  Radio,
  Pagination,
  Empty,
} from "antd";
import {
  AddonCard,
  AddonFormModal,
  ConfirmationModal,
  ErrorState,
} from "../../components/index.js";
import Search from "antd/es/input/Search";
import { IoAddCircleOutline, IoFilter } from "../../icons/index.js";
import PageHeader from "../../components/common/PageHeader.jsx";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addonApiService } from "../../hooks/mess/addonApiService.js";
import LoadingSpinner from "../../ui/loadingSpinner/LoadingSpinner.jsx";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function AddonPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMealTypes, setSelectedMealTypes] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [editingAddon, setEditingAddon] = useState(null);
  // Track the ID of the addon currently being updated
  const [updatingAddonId, setUpdatingAddonId] = useState(null);

  // Track which addon is being deleted
  const [deletingAddon, setDeletingAddon] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const selectedKitchenId = useSelector(
    (state) => state.properties.selectedProperty.kitchenId
  );

  // Define the query key separately for reusability
  const addonsQueryKey = [
    "addons",
    selectedKitchenId,
    selectedAvailability,
    selectedMealTypes,
  ];

  // Fetch all addons using Tanstack query
  const { data, error, isError, isLoading } = useQuery({
    queryKey: addonsQueryKey,
    queryFn: async () => {
      if (!selectedKitchenId) return [];
      const response = await addonApiService.getAddonsForKitchen({
        kitchenId: selectedKitchenId,
        mealType: selectedMealTypes,
        isAvailable: selectedAvailability,
      });
      return response.data || [];
    },
    enabled: !!selectedKitchenId,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allAddons = data || [];

  // Create addon mutation using Tanstack query
  const { mutate: createAddon, isPending: isCreating } = useMutation({
    mutationFn: addonApiService.createAddon,
    onSuccess: () => {
      messageApi.success("Addon created successfully");
      queryClient.invalidateQueries({ queryKey: ["addons"] }); // Refetch addons list
      setIsModalVisible(false); // Close modal on success
    },
    onError: () => {
      messageApi.error("Failed to create addon");
    },
  });

  // Create a mutation for deleting addons using Tanstack query
  const { mutate: deleteAddon, isPending: isDeleting } = useMutation({
    mutationFn: addonApiService.deleteAddon,
    onSuccess: () => {
      messageApi.success("Addon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      setIsDeleteModalVisible(false);
      setDeletingAddon(null);
    },
    onError: () => messageApi.error("Failed to delete addon"),
  });

  // Create a mutation for toggling availability using Tanstack query
  const { mutate: toggleAvailability } = useMutation({
    mutationFn: addonApiService.updateAddonAvailability,
    onMutate: ({ addonId }) => {
      setUpdatingAddonId(addonId); // start loading for that card
    },
    onSuccess: () => {
      messageApi.success("Addon availability updated successfully");
      queryClient.invalidateQueries({ queryKey: ["addons"] });
    },
    onError: () => messageApi.error("Updation failed"),
    onSettled: () => {
      setUpdatingAddonId(null); // reset loading
    },
  });

  // Create a mutation for editing an addon using tanstack query
  const { mutate: updateAddon, isPending: isUpdatingAddon } = useMutation({
    mutationFn: addonApiService.updateAddon,
    onSuccess: () => {
      messageApi.success("Addon updated successfully");
      queryClient.invalidateQueries({ queryKey: ["addons"] });
      setEditingAddon(null);
    },
    onError: () => messageApi.error("Failed to update addon"),
  });

  // Client-side filtering for search term
  const filteredAddons = useMemo(() => {
    if (!searchTerm) return allAddons;
    return allAddons.filter(
      (addon) =>
        addon.itemName
          ?.toLowerCase()
          .includes(searchTerm.trim().toLowerCase()) ||
        addon.itemDescription
          ?.toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
    );
  }, [allAddons, searchTerm]);

  const paginatedAddons = filteredAddons.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Addon form submission logic (for adding and editing)
  const handleFormSubmit = (values) => {
    const formData = new FormData();
    console.log(values); // debug logs
    // Append all fields except imageUpload
    // Object.entries(values).forEach(([key, value]) => {
    //   if (key === "imageUpload" || key === "imageFile") return; // skip imageUpload and imageFile

    //   if (Array.isArray(value)) {
    //     // For arrays like mealType
    //     value.forEach((v) => formData.append(`${key}[]`, v));
    //   } else {
    //     formData.append(key, value);
    //   }
    // });

    Object.entries(values).forEach(([key, value]) => {
      if (key === "imageUpload" || key === "imageFile") return;

      // // Normalize null/undefined/"null" → empty string
      let normalizedValue = value;
      if (
        value === null ||
        value === "null" ||
        value === undefined ||
        value === ""
      ) {
        normalizedValue = "";
      }

      if (key === "itemId" && value?._id) {
        formData.append("itemId", value._id);
      } else if (Array.isArray(normalizedValue)) {
        normalizedValue.forEach((v) => formData.append(`${key}[]`, v));
      } else {
        formData.append(key, normalizedValue);
      }
    });

    // Append the image file under the correct backend field name
    if (values.imageFile instanceof File) {
      formData.append("itemImage", values.imageFile);
    }

    if (editingAddon) {
      // Use the full update mutation
      // console.log("Final Addon FormData payload for editing:", [
      //   ...formData.entries(),
      // ]); // debug log
      updateAddon({ addonId: editingAddon._id, data: formData });
    } else {
      formData.append("kitchenId", selectedKitchenId);
      console.log("Final FormData payload:", [...formData.entries()]); // debug log
      createAddon(formData);
    }
  };

  // Loading state
  if (isLoading) return <LoadingSpinner />;

  // No kitched Id provided
  if (!selectedKitchenId)
    return (
      <ErrorState
        message="No Kitchen selected"
        description="Please select a kitchen to view addons."
      />
    );

  // Erro state
  if (isError)
    return (
      <ErrorState
        message="Failed to load Addons"
        description={error.message || "Something went wrong."}
        onAction={() =>
          queryClient.invalidateQueries({ queryKey: addonsQueryKey })
        }
        actionText="Try Again"
      />
    );

  const filterDropdownContent = (
    <div className="p-4 w-64 space-y-4 bg-white rounded shadow-[0px_4px_24px_4px_rgba(0,_0,_0,_0.1)]">
      <div>
        <p className="font-semibold mb-1 text-gray-700">Meal Type</p>
        <Checkbox.Group
          options={mealTypes}
          value={selectedMealTypes}
          onChange={setSelectedMealTypes}
        />
      </div>
      <div>
        <p className="font-semibold mb-1 text-gray-700">Availability</p>
        <Radio.Group
          value={selectedAvailability}
          onChange={(e) => setSelectedAvailability(e.target.value)}
        >
          <Radio value={true}>Available</Radio>
          <Radio value={false}>Unavailable</Radio>
        </Radio.Group>
      </div>
      <div className="pt-2">
        <Button
          size="small"
          type="link"
          onClick={() => {
            setSelectedMealTypes([]);
            setSelectedAvailability(null);
          }}
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader title="Addons" subtitle="Manage your addons easily" />

        <div className="flex flex-wrap justify-between items-center gap-y-4 mb-6">
          <div className="flex items-center gap-2">
            <Search
              placeholder="Search Item or Menu"
              allowClear
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Dropdown
              overlay={filterDropdownContent}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <Button
                icon={<IoFilter className="text-lg mt-1" />}
                className="flex items-center"
              >
                Filters
              </Button>
            </Dropdown>
          </div>
          <Button
            type="primary"
            icon={<IoAddCircleOutline className="text-lg mt-1" />}
            onClick={() => setIsModalVisible(true)}
          >
            Add New
          </Button>
        </div>

        <div>
          <span className="text-sm text-gray-800 font-semibold">
            Showing{" "}
            {filteredAddons.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
            - {Math.min(currentPage * pageSize, filteredAddons.length)} of{" "}
            {filteredAddons.length} items
          </span>
        </div>

        <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {paginatedAddons.length > 0 ? (
            paginatedAddons.map((addon) => (
              <AddonCard
                key={addon._id}
                addon={addon}
                onEdit={() => setEditingAddon(addon)}
                onDelete={() => {
                  setDeletingAddon(addon);
                  setIsDeleteModalVisible(true);
                }}
                onToggle={(id, isAvailable) =>
                  toggleAvailability({ addonId: id, isAvailable: !isAvailable })
                }
                isUpdating={updatingAddonId === addon._id}
              />
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No addons found"
              />
            </div>
          )}
        </div>

        {filteredAddons.length > pageSize && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredAddons.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        )}

        {/* Addon Modal for creating new addon */}
        <AddonFormModal
          visible={isModalVisible || !!editingAddon}
          onClose={() => {
            setIsModalVisible(false);
            setEditingAddon(null);
          }}
          onSubmit={handleFormSubmit}
          isSubmitting={isCreating || isUpdatingAddon}
          initialValues={
            editingAddon
              ? {
                  ...editingAddon,
                  itemId: editingAddon.itemId?._id, // normalize itemId
                }
              : { isAvailable: true } // defaults for new
          }
          kitchenId={selectedKitchenId}
        />

        {/* Addon delete confirmation modal */}
        <ConfirmationModal
          open={isDeleteModalVisible}
          title="Delete Addon"
          message={`Are you sure you want to delete "${deletingAddon?.itemName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          confirmLoading={isDeleting}
          onConfirm={() => {
            if (deletingAddon?._id) {
              deleteAddon(deletingAddon._id); // trigger delete API
            }
          }}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setDeletingAddon(null);
          }}
        />
      </div>
    </>
  );
}

export default AddonPage;
