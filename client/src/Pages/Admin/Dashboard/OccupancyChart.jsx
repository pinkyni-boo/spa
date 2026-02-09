import React from 'react';
import { Card, Typography, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const { Title } = Typography;

const OccupancyChart = ({ data, loading }) => {
    // Custom tooltip to show details
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '10px', 
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 5 }}>{label}</p>
                    <p style={{ margin: 0, color: '#1890ff' }}>
                        Lấp đầy: <strong>{item.percentage}%</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        Thời gian: {(item.bookedMinutes / 60).toFixed(1)} / 11 giờ
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        Số khách: {item.bookingsCount} lượt
                    </p>
                </div>
            );
        }
        return null;
    };

    // Color logic based on percentage
    const getBarColor = (percentage) => {
        if (percentage >= 70) return '#52c41a'; // Green (Good)
        if (percentage >= 40) return '#faad14'; // Yellow (Average)
        return '#ff4d4f'; // Red (Poor)
    };

    return (
        <Card 
            title={<Title level={4} style={{ margin: 0 }}>Tỷ Lệ Lấp Đầy (Hôm nay)</Title>}
            style={{ 
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0',
                height: '100%',
                minHeight: 300
            }}
            loading={loading}
        >
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" domain={[0, 100]} unit="%" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="percentage" barSize={20} radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <Empty description="Chưa có dữ liệu phòng" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </Card>
    );
};

export default OccupancyChart;
