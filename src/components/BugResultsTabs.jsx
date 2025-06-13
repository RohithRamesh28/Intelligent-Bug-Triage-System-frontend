import { Tabs, Table, Tag } from 'antd';
import React from 'react';

const BugResultsTabs = ({ bugResults }) => {
  // Group bugs by file (file_path + file_name as unique key)
  const groupedBugs = bugResults.reduce((acc, bug) => {
    const fileKey = `${bug.file_path}/${bug.file_name}`;
    if (!acc[fileKey]) {
      acc[fileKey] = [];
    }
    acc[fileKey].push(bug);
    return acc;
  }, {});

  // Table columns
  const columns = [
    {
      title: 'Line',
      dataIndex: 'line',
      key: 'line',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        let color = 'default';
        if (priority === 'High') color = 'red';
        else if (priority === 'Medium') color = 'orange';
        else if (priority === 'Low') color = 'green';

        return <Tag color={color}>{priority}</Tag>;
      },
    },
  ];

  const tabItems = Object.keys(groupedBugs).map((fileKey) => ({
    key: fileKey,
    label: fileKey,
    children: (
      <Table
        dataSource={groupedBugs[fileKey].map((bug, index) => ({ key: index, ...bug }))}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
      />
    ),
  }));

  return (
    <Tabs
      defaultActiveKey={tabItems.length > 0 ? tabItems[0].key : ''}
      type="card"
      items={tabItems}
    />
  );
};

export default BugResultsTabs;
