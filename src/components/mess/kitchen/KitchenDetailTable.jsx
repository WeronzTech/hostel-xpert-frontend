import { Table } from "antd";
import { AiOutlineEdit } from "react-icons/ai";
import { Tag } from "antd";
import { MdDelete } from "react-icons/md";
import { redButton } from "../../../data/common/color";
import ActionButton from "../../common/ActionButton";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectProperty } from "../../../redux/propertiesSlice";

const KitchenDetailTable = ({ kitchenData, loading, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedProperty = useSelector(
    (state) => state.properties.selectedProperty
  );
  const kitchenTableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 250,
      render: (text, record) => (
        <a
          onClick={(e) => {
            e.stopPropagation();
            dispatch(
              selectProperty({
                ...selectedProperty,
                kitchenId: record._id,
              })
            );
            navigate(`/kitchen/${record._id}`);
          }}
          className="text-blue-600 hover:underline"
        >
          {text}
        </a>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      align: "center",
      width: 250,
    },
    {
      title: "Properties",
      dataIndex: "propertyId",
      key: "propertyId",
      align: "center",
      width: 300,
      render: (propertyId) => (
        <>
          {Array.isArray(propertyId) ? (
            propertyId.map((prop) => (
              <Tag color="blue" key={prop?._id}>
                {prop?.name}
              </Tag>
            ))
          ) : (
            <span>{propertyId}</span>
          )}
        </>
      ),
    },
    {
      title: "Incharge",
      dataIndex: "incharge",
      key: "incharge",
      align: "center",
      width: 200,
      render: (incharge) => (incharge ? incharge.name : "N/A"),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <ActionButton
            icon={<AiOutlineEdit />}
            onClick={() => onEdit(record)}
          />
          <ActionButton
            customTheme={redButton}
            icon={<MdDelete />}
            onClick={() => onDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        loading={loading}
        columns={kitchenTableColumns}
        dataSource={kitchenData}
        scroll={{ x: 850 }}
        rowKey="_id"
        pagination={false}
        bordered
        className="w-full"
      />
    </>
  );
};

export default KitchenDetailTable;
