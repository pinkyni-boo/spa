import React from 'react';
import { Card, Button, Typography, Tag, List, Divider, Avatar, Empty } from 'antd';
import { CloseOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, HistoryOutlined, PhoneOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CustomerInfoSidebar = ({ customer, history, onClose, onSelectHistory }) => {
    
    console.log('[CustomerInfoSidebar] Received data:', { customer, history });
    
    // Sort history: Upcoming first, then Completed (Desc)
    const now = dayjs();
    const upcoming = history.filter(h => {
        const isAfter = dayjs(h.startTime).isAfter(now);
        const notCancelled = h.status !== 'cancelled';
        console.log('[FILTER] Upcoming check:', { 
            startTime: h.startTime, 
            isAfter, 
            notCancelled, 
            status: h.status 
        });
        return isAfter && notCancelled;
    });
    const past = history.filter(h => dayjs(h.startTime).isBefore(now) && h.status !== 'cancelled');

    return (
        <div style={{ padding: '16px', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* 1. HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                     <Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: '#D4Af37' }} />
                     <div>
                         <Title level={5} style={{ margin: 0 }}>{customer.name}</Title>
                         <Text type="secondary" style={{ fontSize: 12 }}><PhoneOutlined/> {customer.phone}</Text>
                     </div>
                </div>
                <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
            </div>

            {/* 2. TAGS (VIP, LOYAL) */}
            <div style={{ marginBottom: 20 }}>
                <Tag color="gold" icon={<StarFilled />}>VIP Member</Tag>
                <Tag color="blue">{history.length} lần ghé thăm</Tag>
            </div>
            
            <Divider style={{ margin: '12px 0' }} />

            {/* 3. UPCOMING BOOKINGS */}
            <div style={{ marginBottom: 24 }}>
                <Title level={5} style={{ fontSize: 14, color: '#1890ff' }}>
                    <ClockCircleOutlined /> Sắp tới ({upcoming.length})
                </Title>
                {upcoming.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {upcoming.map(item => (
                            <Card 
                                key={item._id} 
                                size="small" 
                                hoverable 
                                style={{ borderColor: '#91d5ff', background: '#e6f7ff' }}
                                onClick={() => onSelectHistory(item)}
                            >
                                <div style={{ fontWeight: 'bold' }}>{dayjs(item.startTime).format('HH:mm - DD/MM/YYYY')}</div>
                                <div>{item.serviceName || item.serviceId?.name}</div>
                                <div style={{ fontSize: 11, color: '#666' }}>{item.staffName || item.staffId?.name}</div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có lịch sắp tới" style={{ margin: '10px 0' }} />
                )}
            </div>

            {/* 4. HISTORY */}
            <div>
                <Title level={5} style={{ fontSize: 14 }}>
                    <HistoryOutlined /> Lịch sử ({past.length})
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                     {past.map(item => (
                        <Card 
                            key={item._id} 
                            size="small" 
                            hoverable
                            onClick={() => onSelectHistory(item)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <strong style={{ color: '#555' }}>{dayjs(item.startTime).format('DD/MM/YYYY')}</strong>
                                 <Tag color={item.status === 'completed' ? 'green' : 'default'}>{item.status}</Tag>
                            </div>
                            <div style={{ marginTop: 4 }}>{item.serviceName || item.serviceId?.name}</div>
                        </Card>
                    ))}
                    {past.length === 0 && <Text type="secondary">Chưa có lịch sử</Text>}
                </div>
            </div>
        </div>
    );
};

export default CustomerInfoSidebar;
