import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { Button, Dropdown } from 'antd';

const ExportButtons = ({ onExport, isExporting }) => {
  const items = [
    {
      key: 'csv',
      label: 'Export as CSV',
    },
    {
      key: 'pdf',
      label: 'Export as PDF',
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: (e) => onExport(e.key) }} placement="bottomRight" disabled={isExporting}>
      <Button icon={<FiDownload />} loading={isExporting} className="flex items-center gap-2">
        Export Data
      </Button>
    </Dropdown>
  );
};

export default ExportButtons;
