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
        <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col span={8}>
                <StatCard 
                    title="Đơn Chờ Xử Lý" 
                    value={pendingCount} 
                    icon="notifications_active" 
                    gradient={theme.gradients.royalGold} 
                    textColor="#fff"
                />
            </Col>
            <Col span={8}>
                <StatCard 
                    title="Khách Hôm Nay" 
                    value={todayCount} 
                    icon="calendar_today" 
                />
            </Col>
            <Col span={8}>
                <StatCard 
                    title="Doanh Thu (Tạm tính)" 
                    value={formattedRevenue}
                    icon="payments" 
                    textColor="#52c41a"
                />
            </Col>
        </Row>
    );
};

export default StatsHeader;
