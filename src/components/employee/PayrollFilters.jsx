import {Input, Select, Button, Space} from "antd";
import {SearchOutlined, PlusOutlined} from "@ant-design/icons";
import dayjs from "dayjs";

const {Option} = Select;

const PayrollFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onCreateMissing,
}) => {
  // Generate month options
  const months = [
    {value: 0, label: "January"},
    {value: 1, label: "February"},
    {value: 2, label: "March"},
    {value: 3, label: "April"},
    {value: 4, label: "May"},
    {value: 5, label: "June"},
    {value: 6, label: "July"},
    {value: 7, label: "August"},
    {value: 8, label: "September"},
    {value: 9, label: "October"},
    {value: 10, label: "November"},
    {value: 11, label: "December"},
  ];

  // Generate year options (last 5 years to next year)
  const currentYear = dayjs().year();
  const years = Array.from({length: 7}, (_, i) => currentYear - 2 + i);

  return (
    <div className="filters-section bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search on the left */}
        <Input
          placeholder="Search by employee name..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={filters.search}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-md flex-1"
          allowClear
        />

        {/* Filters and button on the right */}
        <Space wrap>
          <Select
            placeholder="Select Month"
            value={filters.month}
            onChange={(value) => onFilterChange("month", value)}
            style={{width: 120}}
          >
            {months.map((month) => (
              <Option key={month.value} value={month.value}>
                {month.label}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select Year"
            value={filters.year}
            onChange={(value) => onFilterChange("year", value)}
            style={{width: 100}}
          >
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            style={{width: 120}}
            allowClear
          >
            <Option value="all">All Status</Option>
            <Option value="Pending">Pending</Option>
            <Option value="Paid">Paid</Option>
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateMissing}
          >
            Create Missing Payroll
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PayrollFilters;
