// src/hooks/useTableSearch.js

import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";

const useTableSearch = () => {
  const searchInput = useRef(null);
  const [searchTexts, setSearchTexts] = useState({});

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search`}
          value={selectedKeys[0]}
          onChange={(e) => {
            const value = e.target.value || "";
            setSelectedKeys(value ? [value] : []);
            setSearchTexts((prev) => ({
              ...prev,
              [dataIndex]: value,
            }));
            confirm({ closeDropdown: false }); // ✅ Keep dropdown open during typing
          }}
          onPressEnter={() => {
            confirm();
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSearchTexts((prev) => ({
                ...prev,
                [dataIndex]: "",
              }));
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      const keys = dataIndex.split(".");
      const fieldValue = keys.reduce((acc, key) => acc?.[key], record);
      return fieldValue
        ? fieldValue
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase().trim())
        : false;
    },
    filterDropdownProps: {
      onOpenChange: (open) => {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    filteredValue: searchTexts[dataIndex] ? [searchTexts[dataIndex]] : null,
  });

  return { getColumnSearchProps };
};

export default useTableSearch;
