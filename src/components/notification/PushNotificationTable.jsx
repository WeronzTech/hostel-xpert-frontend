import { Table, Tag, Tooltip, Image } from "antd";
import ActionButton from "../common/ActionButton";
import { IoSend, IoTrashOutline } from "../../icons/index.js";
import { greenButton } from "../../data/common/color.js";
import { formatDate } from "../../utils/formatUtils.js";
import useTableSearch from "../../hooks/common/useTableSearch.jsx";

const PushNotificationTable = ({ data = [], onDelete, onSend }) => {
  const { getColumnSearchProps } = useTableSearch();

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ...getColumnSearchProps("title"),
      width: 230,
      align: "center",
      // fixed: "left",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description"),
      width: 300,
      align: "center",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 200,
      align: "center",
      render: (image) =>
        image ? (
          <div className="flex justify-center items-center">
            <Image
              src={
                image.thumbUrl ||
                image.url ||
                (image.originFileObj
                  ? URL.createObjectURL(image.originFileObj)
                  : "")
              }
              alt="notification"
              width={56}
              height={56}
              style={{ objectFit: "cover", borderRadius: 8 }}
              preview={{ mask: "Click to preview" }}
            />
          </div>
        ) : (
          "-"
        ),
    },
    {
      title: "User Types",
      dataIndex: "users",
      key: "users",
      align: "center",
      width: 250,
      render: (users = []) =>
        users.map((type) => (
          <Tag key={type} color="blue">
            {type
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}{" "}
          </Tag>
        )),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      align: "center",
      render: (date) => formatDate(date),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      align: "center",
      render: (record) => (
        <div className="flex gap-4 justify-center">
          <ActionButton
            icon={<IoSend className="text-md mt-1" />}
            customTheme={greenButton}
            onClick={() => onSend(record._id)}
          />
          <ActionButton
            icon={<IoTrashOutline className="text-lg mt-1" />}
            danger
            onClick={() => onDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 10 }}
        bordered
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default PushNotificationTable;
