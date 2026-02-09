import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, List, Tag, Spin, Button } from 'antd';
import { DollarOutlined, UserOutlined, CalendarOutlined, TeamOutlined, ReloadOutlined } from '@ant-design/icons';
import StatsCard from './StatsCard';
import RevenueChart from './RevenueChart';
import OccupancyChart from './OccupancyChart'; // [NEW] Import
import { dashboardService } from '../../../services/dashboardService';
import theme from '../../../theme';

const { Title, Text } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [staffStatus, setStaffStatus] = useState([]);
    const [occupancyData, setOccupancyData] = useState([]); // [NEW] State
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('week');

    const fetchData = async () => {
        setLoading(true);
        console.log('🔄 [DASHBOARD] Fetching data...');
        try {
            const [statsRes, revenueRes, servicesRes, staffRes, occupancyRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getRevenueChart(period),
                dashboardService.getTopServices(),
                dashboardService.getStaffStatus(),
                dashboardService.getOccupancyRate() // [NEW] API call
            ]);

            if (statsRes.success) setStats(statsRes.stats);
            if (revenueRes.success) setRevenueData(revenueRes.data);
            if (servicesRes.success) setTopServices(servicesRes.services);
            if (staffRes.success) setStaffStatus(staffRes.staff);
            if (occupancyRes.success) setOccupancyData(occupancyRes.data); // [NEW] Set data
        } catch (error) {
            console.error('❌ [DASHBOARD] Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>📊 Dashboard - Tổng Quan</Title>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={fetchData}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>

                {loading && !stats ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={12} lg={6}>
                                <StatsCard
                                    title="Doanh Thu Hôm Nay"
                                    value={stats?.todayRevenue || 0}
                                    icon={<DollarOutlined />}
                                    color={theme.colors.primary[500]}
                                    prefix="đ"
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <StatsCard
                                    title="Số Khách Hôm Nay"
                                    value={stats?.customerCount || 0}
                                    icon={<UserOutlined />}
                                    color="#52c41a"
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <StatsCard
                                    title="Tổng Đơn Hôm Nay"
                                    value={stats?.totalBookings || 0}
                                    icon={<CalendarOutlined />}
                                    color="#1890ff"
                                />
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <StatsCard
                                    title="Đơn Chờ Duyệt"
                                    value={stats?.pendingBookings || 0}
                                    icon={<CalendarOutlined />}
                                    color="#faad14"
                                />
                            </Col>
                        </Row>

                        {/* Revenue & Occupancy Charts [UPDATED LAYOUT] */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} lg={16}>
                                <RevenueChart data={revenueData} loading={loading} />
                            </Col>
                            <Col xs={24} lg={8}>
                                <OccupancyChart data={occupancyData} loading={loading} />
                            </Col>
                        </Row>

                        {/* Top Services & Staff [UPDATED LAYOUT] */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={8}>
                                <Card
                                    title={<Title level={4} style={{ margin: 0 }}>Top Dịch Vụ</Title>}
                                    style={{ 
                                        borderRadius: 12,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        border: '1px solid #f0f0f0',
                                        height: '100%'
                                    }}
                                >
                                    <List
                                        dataSource={topServices}
                                        renderItem={(service, index) => (
                                            <List.Item>
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <Text strong>{index + 1}. {service.name}</Text>
                                                        <Tag color="blue">{service.count} lượt</Tag>
                                                    </div>
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        Doanh thu: {service.revenue.toLocaleString()} VNĐ
                                                    </Text>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} lg={16}>
                                <Card
                                    title={<Title level={4} style={{ margin: 0 }}><TeamOutlined /> Trạng Thái Nhân Viên</Title>}
                                    style={{ 
                                        borderRadius: 12,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        border: '1px solid #f0f0f0',
                                        height: '100%'
                                    }}
                                >
                                    <Row gutter={[16, 16]}>
                                        {staffStatus.map(staff => (
                                            <Col xs={24} sm={12} md={8} lg={6} key={staff._id}>
                                                <Card
                                                    size="small"
                                                    style={{ 
                                                        borderRadius: 8,
                                                        border: staff.status === 'busy' ? '2px solid #ff4d4f' : '2px solid #52c41a'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                        <div style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            borderRadius: '50%',
                                                            background: staff.status === 'busy' ? '#ff4d4f' : '#52c41a'
                                                        }} />
                                                        <Text strong>{staff.name}</Text>
                                                    </div>
                                                    <Tag color={staff.status === 'busy' ? 'red' : 'green'}>
                                                        {staff.status === 'busy' ? 'Đang bận' : 'Rảnh'}
                                                    </Tag>
                                                    <div style={{ marginTop: 8 }}>
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            Hôm nay: {staff.todayBookings} đơn
                                                        </Text>
                                                    </div>
                                                    {staff.currentBooking && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text style={{ fontSize: 11, color: '#ff4d4f' }}>
                                                                Đang phục vụ: {staff.currentBooking.customerName}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </Card>
                            </Col>
                        </Row>
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
