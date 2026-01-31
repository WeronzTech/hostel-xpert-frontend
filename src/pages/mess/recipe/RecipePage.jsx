import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input, Spin, Empty, Row, Col, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import RecipeCard from "../../../components/mess/recipe/RecipeCard";
import {
  getAllRecipe,
  getRecipeCategoryById,
} from "../../../hooks/inventory/useInventory";
import AddRecipeModal from "../../../modals/mess/recipe/AddRecipeModal";
import { IoAddCircleOutline } from "react-icons/io5";
import EditRecipeModal from "../../../modals/mess/recipe/EditRecipeModal";
import DeleteRecipeModal from "../../../modals/mess/recipe/DeleteRecipeModal";

const { Search } = Input;

const RecipePage = () => {
  const { recipeCategoryId } = useParams();
  const [filter, setFilter] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const { kitchenId } = useSelector(
    (state) => state.properties.selectedProperty
  );

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["recipes", filter],
    queryFn: () => getAllRecipe(filter),
  });

  const { data: recipeCategory } = useQuery({
    queryKey: ["recipes", recipeCategoryId],
    queryFn: () => getRecipeCategoryById(recipeCategoryId),
    enabled: !!recipeCategoryId,
  });

  const handleSearch = (value) => {
    setFilter({ name: value });
  };

  const handleEdit = (recipe) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleDelete = (recipe) => {
    setSelectedRecipe(recipe);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (kitchenId) {
      setFilter({ recipeCategoryId, kitchenId });
    } else {
      setFilter({ recipeCategoryId });
    }
  }, [recipeCategoryId, kitchenId]);

  const renderContent = () => {
    console.log("Recipes", recipes);
    if (recipesLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (!recipes || recipes.length === 0) {
      return (
        <Empty description="No recipes found. Try adjusting your filters." />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {recipes?.map((recipe) => (
          <Col xs={24} sm={12} md={8} lg={6} key={recipe._id}>
            <RecipeCard
              recipe={recipe}
              recipeCategory={recipeCategory}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 xl:px-12 lg:px-4 lg:pt-6 lg:pb-12 px-4 pt-4 pb-8">
        <PageHeader
          title="Recipes"
          subtitle="Browse and manage all recipes in the kitchen"
        />

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Row
            gutter={[16, 16]}
            className="mb-6"
            justify="space-between"
            align="middle"
          >
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by recipe name..."
                onSearch={handleSearch}
                enterButton
                allowClear
              />
            </Col>
            <Col
              xs={24}
              sm={12}
              md={8}
              style={{ display: "flex", justifyContent: "end" }}
            >
              <Button
                type="primary"
                icon={<IoAddCircleOutline className="text-lg" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Recipe
              </Button>
            </Col>
          </Row>

          {renderContent()}
        </div>
      </div>
      <AddRecipeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        kitchenId={kitchenId}
        recipeCategoryId={recipeCategoryId}
      />
      {selectedRecipe && (
        <EditRecipeModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecipe(null);
          }}
          kitchenId={kitchenId}
          recipe={selectedRecipe}
        />
      )}

      {selectedRecipe && (
        <DeleteRecipeModal
          open={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedRecipe(null);
          }}
          recipe={selectedRecipe}
        />
      )}
    </>
  );
};

export default RecipePage;
