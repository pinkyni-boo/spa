import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StatsCard = ({ title, value, icon, trend, color = '#1890ff', prefix = '' }) => {
    const trendUp = trend > 0;
    
    return (
        <Card 
            style={{ 
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
                    <Title level={2} style={{ margin: '8px 0 0 0', color }}>
                        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                    </Title>
                    {trend !== undefined && (
                        <div style={{ marginTop: 8 }}>
                            <Text style={{ color: trendUp ? '#52c41a' : '#ff4d4f', fontSize: 13 }}>
                                {trendUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                {' '}{Math.abs(trend)}%
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>vs hôm qua</Text>
                        </div>
                    )}
                </div>
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    color
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

export default StatsCard;
