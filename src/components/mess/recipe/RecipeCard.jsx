// import { Card, Tag, Button, Space } from "antd";
// import { AiOutlineEdit } from "react-icons/ai";
// import { MdDelete } from "react-icons/md";

// const RecipeCard = ({ recipe, recipeCategory, onEdit, onDelete }) => {
//   if (!recipe) {
//     return null;
//   }

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     onEdit(recipe);
//   };

//   const handleDelete = (e) => {
//     e.stopPropagation();
//     onDelete(recipe);
//   };

//   const cardTitle = (
//     <div className="flex justify-between items-center">
//       <span className="truncate pr-4">{recipe.name}</span>
//       <Space>
//         <Button
//           size="medium"
//           type="text"
//           icon={<AiOutlineEdit size={25} />}
//           onClick={handleEdit}
//         />
//         <Button
//           size="medium"
//           type="text"
//           danger
//           icon={<MdDelete size={25} />}
//           onClick={handleDelete}
//         />
//       </Space>
//     </div>
//   );

//   return (
//     <Card className="shadow-lg">
//       <Card.Meta
//         title={cardTitle}
//         description={`In ${recipeCategory?.name || "Uncategorized"}`}
//       />
//       <div className="mt-4">
//         {recipe.tags?.length > 0 && (
//           <div className="flex flex-wrap gap-2">
//             {recipe.tags.map((tag) => (
//               <Tag key={tag} color="blue">
//                 {tag}
//               </Tag>
//             ))}
//           </div>
//         )}
//       </div>
//     </Card>
//   );
// };

// export default RecipeCard;
import { Card, Tag, Button, Space, Divider } from "antd";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";

const RecipeCard = ({ recipe, recipeCategory, onEdit, onDelete }) => {
  if (!recipe) {
    return null;
  }

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(recipe);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(recipe);
  };

  const cardTitle = (
    <div className="flex justify-between items-center">
      <span className="truncate pr-4 font-semibold">{recipe.name}</span>
      <Space>
        <Button
          size="small"
          type="text"
          icon={<AiOutlineEdit size={20} />}
          onClick={handleEdit}
        />
        <Button
          size="small"
          type="text"
          danger
          icon={<MdDelete size={20} />}
          onClick={handleDelete}
        />
      </Space>
    </div>
  );

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <Card.Meta
        title={cardTitle}
        description={`In ${recipeCategory?.name || "Uncategorized"}`}
      />
      <div className="mt-4">
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <div className="text-m font-semibold">Ingredients</div>

      <div className="flex flex-wrap gap-2 mt-2 flex-grow overflow-y-auto">
        {recipe.ingredients?.map((ingredient, index) => (
          <Tag key={index} color="green">
            {ingredient?.name?.productName} ({ingredient?.quantity}{" "}
            {ingredient?.unit})
          </Tag>
        ))}
      </div>
    </Card>
  );
};

export default RecipeCard;
