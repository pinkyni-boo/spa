import React, { useState, useEffect } from 'react';
import { Layout, Input, Table, Typography, Drawer, Card, Tag, Statistic, Row, Col, Avatar, Timeline, message } from 'antd';
import { SearchOutlined, UserOutlined, HistoryOutlined, PhoneOutlined, DatabaseOutlined, DollarOutlined } from '@ant-design/icons';
import { customerService } from '../../../services/customerService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const CustomerManager = () => {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [customerHistory, setCustomerHistory] = useState({ profile: {}, stats: {}, history: [] });

    // Load initial data (recent customers)
    useEffect(() => {
        handleSearch('');
    }, []);

    // Search Customers
    const handleSearch = async (value) => {
        setLoading(true);
        try {
            const response = await customerService.searchCustomers(value || ''); // Send empty string if null
            if (response.success) {
                setCustomers(response.customers);
                
                // UX: If Searching (not default load) and only 1 result found, Auto Open History
                if (value && response.customers.length === 1) {
                    handleViewHistory(response.customers[0]);
                }
                
                if (value && response.customers.length === 0) {
                    message.info('Không tìm thấy khách hàng nào');
                }
            }
        } catch (error) {
            message.error('Lỗi tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    // Handle Clear Search (X button)
    const onSearch = (value) => {
        handleSearch(value);
    };

    const handleChangeString = (e) => {
        // Optional: Real-time search or Reset on clear
        if (e.target.value === '') {
            handleSearch('');
        }
    }

    // View Customer History
    const handleViewHistory = async (record) => {
        setDrawerVisible(true);
        setHistoryLoading(true);
        setSelectedCustomer(record);
        try {
            const response = await customerService.getCustomerHistory(record.phone);
            if (response.success) {
                setCustomerHistory(response);
            }
        } catch (error) {
            message.error('Không thể tải lịch sử');
        } finally {
            setHistoryLoading(false);
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            key: 'name',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name || record.customerName}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{record.isGuest ? 'Khách hàng (Từ Booking)' : 'Thành viên'}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => <span><PhoneOutlined /> {phone}</span>
        },
        {
            title: 'Lần cuối đến',
            dataIndex: 'lastVisit',
            key: 'lastVisit',
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <a onClick={(e) => {
                    e.stopPropagation(); // Prevent row click double trigger
                    handleViewHistory(record);
                }}>Xem lịch sử</a>
            )
        }
    ];

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <Title level={2}>📖 Tra Cứu Lịch Sử Khách Hàng</Title>
                
                <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                    <Search
                        placeholder="Nhập tên khách hàng hoặc số điện thoại..."
                        enterButton="Tìm kiếm"
                        size="large"
                        onSearch={onSearch}
                        onChange={handleChangeString}
                        loading={loading}
                        allowClear
                        prefix={<SearchOutlined />}
                    />
                </Card>

                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="phone"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'white', borderRadius: 8, cursor: 'pointer' }}
                    locale={{ emptyText: 'Không có dữ liệu khách hàng gần đây' }}
                    onRow={(record) => ({
                        onClick: () => {
                            handleViewHistory(record);
                        },
                        style: { cursor: 'pointer' }
                    })}
                />

                <Drawer
                    title="Hồ Sơ & Lịch Sử Dịch Vụ"
                    width={640}
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    styles={{ body: { padding: '24px' } }}
                >
                    {historyLoading ? (
                        <div style={{ textAlign: 'center', marginTop: 50 }}>Loading...</div>
                    ) : (
                        <>
                            {/* Profile Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                <div>
                                    <Title level={4} style={{ margin: 0 }}>{customerHistory.profile.name || selectedCustomer?.name}</Title>
                                    <Text type="secondary"><PhoneOutlined /> {customerHistory.profile.phone || selectedCustomer?.phone}</Text>
                                    <br />
                                    <Tag color="gold" style={{ marginTop: 8 }}>
                                        Điểm tích lũy: {customerHistory.stats.loyaltyPoints || 0}
                                    </Tag>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <Row gutter={16} style={{ marginBottom: 32 }}>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic
                                            title="Tổng chi tiêu"
                                            value={customerHistory.stats.totalSpent}
                                            suffix="đ"
                                            valueStyle={{ color: '#cf1322', fontSize: 18 }}
                                            prefix={<DollarOutlined />}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic
                                            title="Số lần đến"
                                            value={customerHistory.stats.visitCount}
                                            valueStyle={{ color: '#3f8600', fontSize: 18 }}
                                            prefix={<HistoryOutlined />}
                                        />
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small">
                                        <Statistic
                                            title="Dịch vụ hủy"
                                            value={customerHistory.stats.cancelledVisits}
                                            valueStyle={{ color: '#999', fontSize: 18 }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* History Timeline */}
                            <Title level={5} style={{ marginBottom: 16 }}>Lịch sử giao dịch</Title>
                            {customerHistory.history.length > 0 ? (
                                <Timeline>
                                    {customerHistory.history.map(item => (
                                        <Timeline.Item 
                                            key={item._id}
                                            color={item.status === 'completed' ? 'green' : item.status === 'cancelled' ? 'red' : 'blue'}
                                        >
                                            <div style={{ marginBottom: 4 }}>
                                                <Text strong>{dayjs(item.startTime).format('DD/MM/YYYY HH:mm')}</Text>
                                                <Tag style={{ marginLeft: 8 }} color={
                                                    item.status === 'completed' ? 'success' :
                                                    item.status === 'cancelled' ? 'error' : 'processing'
                                                }>
                                                    {item.status.toUpperCase()}
                                                </Tag>
                                            </div>
                                            <div>{item.serviceId?.name || 'Dịch vụ đã xóa'}</div>
                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                KTV: {item.staffId?.name || '---'} | 
                                                Giá: {item.finalPrice ? item.finalPrice.toLocaleString() : item.serviceId?.price?.toLocaleString()}đ
                                            </div>
                                            {item.note && <div style={{ fontSize: 12, fontStyle: 'italic', color: '#888' }}>Note: {item.note}</div>}
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            ) : (
                                <Text type="secondary">Chưa có lịch sử dịch vụ</Text>
                            )}
                        </>
                    )}
                </Drawer>
            </div>
        </Layout>
    );
};

export default CustomerManager;
