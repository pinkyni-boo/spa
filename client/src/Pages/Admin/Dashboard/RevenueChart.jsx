import React, { useState } from 'react';
import { Card, Typography, Segmented } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const RevenueChart = ({ data, loading }) => {
    const [chartType, setChartType] = useState('line');

    const formatCurrency = (value) => {
        return `${(value / 1000).toFixed(0)}K`;
    };

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
        <Card 
            title={<Title level={4} style={{ margin: 0 }}>Doanh Thu</Title>}
            extra={
                <Segmented 
                    options={[
                        { label: 'Đường', value: 'line' },
                        { label: 'Cột', value: 'bar' }
                    ]}
                    value={chartType}
                    onChange={setChartType}
                />
            }
            style={{ 
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #f0f0f0'
            }}
            loading={loading}
        >
            <ResponsiveContainer width="100%" height={300}>
                <ChartComponent data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        stroke="#8c8c8c"
                    />
                    <YAxis 
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 12 }}
                        stroke="#8c8c8c"
                    />
                    <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                        contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
                    />
                    <DataComponent 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#1890ff" 
                        fill="#1890ff"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </ChartComponent>
            </ResponsiveContainer>
        </Card>
    );
};

export default RevenueChart;
