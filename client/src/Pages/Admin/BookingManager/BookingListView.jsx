import React, { useState } from 'react';
import { Table, Tag, Button, Avatar, Typography, Space, DatePicker, Tabs } from 'antd';
import dayjs from 'dayjs';
import theme from '../../../theme';

const { Text } = Typography;

const BookingListView = ({ bookings, loading, onEdit, onApprove, filterDate, setFilterDate, onCreate }) => {
    const [activeTab, setActiveTab] = useState('all');

    // Filter Logic
    const getFilteredBookings = () => {
        if (activeTab === 'all') return bookings;
        if (activeTab === 'completed_group') {
            return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
        }
        return bookings.filter(b => b.status === activeTab);
    };

    const filteredData = getFilteredBookings();

    // Tab Items
    const items = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'confirmed', label: 'Sắp tới' },
        { key: 'processing', label: 'Đang làm' },
        { key: 'completed_group', label: 'Lịch sử' },
    ];

  const columns = [
    {
      title: 'NGUỒN',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source) => (
         <div style={{ textAlign: 'center' }}>
            {source === 'offline' ? (
                <span className="material-symbols-outlined" style={{ color: theme.colors.primary[600], fontSize: '24px' }}>person_add</span>
            ) : (
                <span className="material-symbols-outlined" style={{ color: '#1890ff', fontSize: '24px' }}>public</span>
            )}
            <div style={{ fontSize: '10px', color: '#888' }}>{source === 'offline' ? 'Tại quầy' : 'Web'}</div>
         </div>
      )
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140,
      render: (text) => (
        <div>
          <div style={{ color: theme.colors.primary[800], fontWeight: '700', fontSize: '15px' }}>{dayjs(text).format('HH:mm')}</div>
          <div style={{ color: '#888', fontSize: '12px' }}>{dayjs(text).format('DD/MM/YYYY')}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: 'KHÁCH HÀNG',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <Avatar style={{ backgroundColor: theme.colors.primary[100], color: theme.colors.primary[600], border: `1px solid ${theme.colors.primary[200]}` }}>
              {text ? text.charAt(0).toUpperCase() : '?'}
           </Avatar>
           <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{text}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{record.phone}</div>
           </div>
        </div>
      ),
    },
    {
      title: 'DỊCH VỤ',
      dataIndex: 'serviceId',
      key: 'service',
      render: (service) => service ? (
        <Tag color="default" style={{ borderRadius: '20px', padding: '2px 10px' }}>{service.name}</Tag>
      ) : <Text type="danger">--</Text>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status, record) => {
        let color = 'default'; 
        let text = 'Khác';

        switch(status) {
            case 'confirmed':
                color = 'success';
                text = 'ĐÃ XÁC NHẬN';
                break;
            case 'pending':
                color = 'warning';
                text = 'CHỜ DUYỆT';
                break;
            case 'completed':
                color = 'processing';
                text = 'HOÀN THÀNH';
                break;
            case 'cancelled':
                color = 'error';
                text = 'ĐÃ HỦY';
                break;
            case 'processing':
                color = 'blue';
                text = 'ĐANG LÀM';
                break;
            default:
                color = 'default';
        }
        
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color={color} style={{ fontWeight: 600 }}>{text}</Tag>
                {status === 'pending' && (
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onApprove && onApprove(record._id); // [FIX] Pass ID string, not object
                        }}
                        style={{ fontSize: 12 }}
                    >
                        Duyệt
                    </Button>
                )}
            </div>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => onEdit(record)}>Chi tiết</Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: theme.shadows.soft }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>Danh Sách Đơn</Typography.Title>
            <Space>
               <DatePicker placeholder="Lọc ngày" onChange={setFilterDate} />
               <Button type="primary" onClick={onCreate}>+ Tạo Đơn</Button>
            </Space>
        </div>

        <Tabs 
            defaultActiveKey="all" 
            items={items} 
            onChange={setActiveTab} 
            type="card"
            style={{ marginBottom: 16 }}
        />

        <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 8 }}
        />
    </div>
  );
};

export default BookingListView;
