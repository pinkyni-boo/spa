import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Tabs, DatePicker, Table, Button, Row, Col, Statistic, Tag, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarOutlined, UserOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { dashboardService } from '../../../services/dashboardService';
import RevenueChart from '../Dashboard/RevenueChart'; // Reuse existing component

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ReportManager = () => {
    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        fetchData();
    }, [dateRange, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            if (activeTab === '1') {
                // Fetch Revenue (using existing Dashboard API for now - maybe need custom range later)
                // Existing API uses fixed period='week' or 'month'. 
                // For now, we reuse 'week' or 'month' logic or we should update backend to accept range for revenue too.
                // LIMITATION: DashboardController.getRevenueChart only accepts 'period'. 
                // Workaround: We will use 'month' for now as default visualization.
                // Improvement: We will use the staff performance API for revenue summary if needed, or update backend later.
                // Let's use getRevenueChart('month') for now to show something contentful.
                const res = await dashboardService.getRevenueChart('month');
                if (res.success) setRevenueData(res.data);
            } else {
                // Fetch Staff Performance
                const res = await dashboardService.getStaffPerformance(startDate, endDate);
                if (res.success) setStaffData(res.data);
            }
        } catch (error) {
            message.error('Lỗi tải dữ liệu báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const staffColumns = [
        {
            title: 'Nhân Viên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Tổng Doanh Thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (value) => <Text type="success">{value.toLocaleString()} đ</Text>,
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
        },
        {
            title: 'Số Đơn',
            dataIndex: 'totalBookings',
            key: 'totalBookings',
            sorter: (a, b) => a.totalBookings - b.totalBookings,
        },
        {
            title: 'Khách Khác Nhau',
            dataIndex: 'uniqueCustomers',
            key: 'uniqueCustomers',
        },
    ];

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}>📊 Báo Cáo & Thống Kê</Title>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <RangePicker 
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates || [dayjs().startOf('month'), dayjs().endOf('month')])}
                            format="DD/MM/YYYY"
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                            Cập nhật
                        </Button>
                    </div>
                </div>

                <Card>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane tab={<span><DollarOutlined />Doanh Thu</span>} key="1">
                            {/* Revenue Content */}
                            <Row gutter={[24, 24]}>
                                <Col span={24}>
                                    <RevenueChart data={revenueData} loading={loading} />
                                </Col>
                            </Row>
                        </TabPane>
                        
                        <TabPane tab={<span><UserOutlined />Hiệu Suất Nhân Viên</span>} key="2">
                            {/* Staff Content */}
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={12}>
                                    <Card title="Biểu Đồ Hiệu Suất (Doanh Thu)" bordered={false}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={staffData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis dataKey="name" type="category" width={100} />
                                                <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                                                <Legend />
                                                <Bar dataKey="totalRevenue" name="Doanh Thu" fill="#82ca9d" barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Card>
                                </Col>
                                <Col xs={24} lg={12}>
                                    <Table 
                                        columns={staffColumns} 
                                        dataSource={staffData}
                                        rowKey="key"
                                        loading={loading}
                                        pagination={{ pageSize: 5 }}
                                    />
                                </Col>
                            </Row>
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </Layout>
    );
};

export default ReportManager;
