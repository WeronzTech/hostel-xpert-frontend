import { IoAddCircleOutline } from "react-icons/io5";
import { Button, Input } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import RecipeCategoryTable from "../../../components/mess/recipe/RecipeCategoryTable";
import { useParams } from "react-router-dom";
import { getRecipeCategoryByKitchenId } from "../../../hooks/inventory/useInventory";
import PageHeader from "../../../components/common/PageHeader";
import AddRecipeCategoryModal from "../../../modals/mess/recipe/AddRecipeCategoryModal";
import EditRecipeCategoryModal from "../../../modals/mess/recipe/EditRecipeCategoryModal";
import DeleteRecipeCategoryModal from "../../../modals/mess/recipe/DeleteRecipeCategoryModal";

const RecipeCategoryPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecipeCategory, setEditingRecipeCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecipeCategory, setDeletingRecipeCategory] = useState(null);

  const { kitchenId } = useParams();

  const { data: recipeCategories, isLoading: recipeCategoryLoading } = useQuery(
    {
      queryKey: ["recipe-category", kitchenId],
      queryFn: () => getRecipeCategoryByKitchenId(kitchenId),
    }
  );

  const showAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (recipeCategoryRecord) => {
    setEditingRecipeCategory(recipeCategoryRecord);
    setIsEditModalOpen(true);
  };

  const handleDelete = (recipeCategoryRecord) => {
    console.log("Delete button clicked for:", recipeCategoryRecord);
    setIsDeleteModalOpen(true);
    setDeletingRecipeCategory(recipeCategoryRecord);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingRecipeCategory(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingRecipeCategory(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Recipe Category"
          subtitle="Manage all recipe category of the Kitchen"
          showCalendar={false}
        />

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
            <Button
              type="primary"
              icon={<IoAddCircleOutline className="text-lg" />}
              onClick={showAddModal}
            >
              Create Recipe Category
            </Button>
          </div>

          <RecipeCategoryTable
            categories={recipeCategories || []}
            loading={recipeCategoryLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <AddRecipeCategoryModal
        open={isAddModalOpen}
        onClose={handleAddModalClose}
        kitchenId={kitchenId}
      />

      <EditRecipeCategoryModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        initialData={editingRecipeCategory}
      />

      <DeleteRecipeCategoryModal
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        category={deletingRecipeCategory}
      />
    </>
  );
};

export default RecipeCategoryPage;
