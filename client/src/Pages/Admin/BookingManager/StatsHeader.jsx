import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import theme from '../../../theme';

const StatCard = ({ title, value, icon, gradient, textColor }) => (
    <Card bordered={false} style={{ 
      background: gradient || '#fff', 
      borderRadius: theme.borderRadius.md,
      boxShadow: theme.shadows.soft,
      height: '100%',
      // overflow: 'hidden' // Removed overflow hidden as icon is gone
    }}>
      <Statistic 
        title={<span style={{ color: textColor || '#666', fontWeight: 600 }}>{title}</span>}
        value={value} 
        valueStyle={{ color: textColor || theme.colors.text.main, fontWeight: 'bold', fontSize: '32px' }}
      />
    </Card>
);

const StatsHeader = ({ bookings }) => {
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const todayCount = bookings.filter(b => {
        const date = new Date(b.startTime);
        const today = new Date();
        return date.getDate() === today.getDate() && 
               date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    }).length;
    
    // Giả lập doanh thu (Giá * số đơn completed)
    const revenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.serviceId?.price || 0), 0);

    const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenue);

    return (
        <>
            <style>{`
                .stats-row {
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                .stats-row > .ant-col {
                    padding-left: 6px !important;
                    padding-right: 6px !important;
                }
                @media (max-width: 768px) {
                    .stats-row > .ant-col {
                        margin-bottom: 8px;
                    }
                    .ant-statistic-content-value {
                        font-size: 24px !important;
                    }
                }
                @media (max-width: 480px) {
                    .ant-statistic-content-value {
                        font-size: 20px !important;
                    }
                    .ant-statistic-title {
                        font-size: 12px !important;
                    }
                }
            `}</style>
            <Row gutter={[12, 12]} className="stats-row">
                <Col xs={24} sm={12} md={8} lg={8}>
                    <StatCard 
                        title="Chờ Duyệt"
                        value={pendingCount}
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        textColor="white"
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={8}>
                    <StatCard 
                        title="Hôm Nay"
                        value={todayCount}
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        textColor="white"
                    />
                </Col>
                <Col xs={24} sm={24} md={8} lg={8}>
                    <StatCard 
                        title="Doanh Thu"
                        value={formattedRevenue}
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                        textColor="white"
                    />
                </Col>
            </Row>
        </>
    );
};

export default StatsHeader;
