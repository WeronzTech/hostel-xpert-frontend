import {IoAddCircleOutline} from "react-icons/io5";
import {Button, Input} from "antd";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import PageHeader from "../../../components/common/PageHeader";
import {getKitchens} from "../../../hooks/inventory/useInventory.js";
import {useSelector} from "react-redux";
import KitchenDetailTable from "../../../components/mess/kitchen/KitchenDetailTable.jsx";
import AddKitchenModal from "../../../modals/mess/kitchen/AddKitchenModal.jsx";
import EditKitchenModal from "../../../modals/mess/kitchen/EditKitchenModal.jsx";
import DeleteKitchenModal from "../../../modals/mess/kitchen/DeleteKitchenModal.jsx";

const {Search} = Input;

const KitchenPage = () => {
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingKitchen, setDeletingKitchen] = useState(null);

  const selectedPropertyId = useSelector(
    (state) => state.properties.selectedProperty.id,
  );

  const {data: kitchens, isLoading: kitchensLoading} = useQuery({
    queryKey: ["kitchens", selectedPropertyId, search],
    queryFn: () =>
      getKitchens({propertyId: selectedPropertyId, search: search}),
  });

  const handleSearch = (value) => {
    setSearch(value);
  };

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (kitchenRecord) => {
    setEditingKitchen(kitchenRecord);
    setIsEditModalOpen(true);
  };

  const handleDelete = (kitchenRecord) => {
    console.log("Delete button clicked for:", kitchenRecord);
    setIsDeleteModalOpen(true);
    setDeletingKitchen(kitchenRecord);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingKitchen(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingKitchen(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader title="Kitchen" subtitle="Manage all the Kitchens" />

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
            <Search
              placeholder="Search by kitchen name..."
              onSearch={handleSearch}
              style={{width: 250}}
              enterButton
            />
            <Button
              type="primary"
              icon={<IoAddCircleOutline className="text-lg" />}
              onClick={showAddModal}
            >
              Create Kitchen
            </Button>
          </div>

          <KitchenDetailTable
            kitchenData={kitchens || []}
            loading={kitchensLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AddKitchenModal open={isAddModalOpen} onClose={handleAddModalClose} />

      <EditKitchenModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        initialData={editingKitchen}
      />

      <DeleteKitchenModal
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        kitchenData={deletingKitchen}
      />
    </>
  );
};

export default KitchenPage;
