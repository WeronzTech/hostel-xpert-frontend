import { Table, Space, Spin } from "antd";
import { AiOutlineEdit } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import ActionButton from "../../common/ActionButton";
import { redButton } from "../../../data/common/color";
import { useNavigate } from "react-router-dom";

const RecipeCategoryTable = ({ categories, loading, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/kitchen/recipe/${record._id}`);
          }}
          className="text-blue-600 hover:underline"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          <ActionButton
            icon={<AiOutlineEdit />}
            type="primary"
            onClick={() => onEdit(record)}
          >
            Edit
          </ActionButton>
          <ActionButton
            icon={<MdDelete />}
            onClick={() => onDelete(record)}
            type="primary"
            customTheme={redButton}
          >
            Delete
          </ActionButton>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={categories.map((cat) => ({ ...cat, key: cat._id }))}
        rowKey="_id"
        pagination={{ pageSize: 10, responsive: true }}
        bordered
      />
    </Spin>
  );
};

export default RecipeCategoryTable;
