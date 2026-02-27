import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Avatar, Typography, Space, DatePicker, Tabs, Tooltip, Spin } from 'antd';
import { ClockCircleOutlined, UserOutlined, AppstoreOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fmtTime, fmtDate } from '../../../config/dateHelper';
import theme from '../../../theme';
import { adminBookingService } from '../../../services/adminBookingService';

const IconHeader = ({ icon, label }) => (
    <Tooltip title={label} placement="top">
        <span style={{ fontSize: 15, display: 'flex', justifyContent: 'center', cursor: 'default' }}>{icon}</span>
    </Tooltip>
);

const { Text } = Typography;

/* Fluid scale helper: maps viewport 900px→1600px to size min→max */
const fl = (min, max) => `clamp(${min}px, ${min}px + (${max - min}) * ((100vw - 900px) / 700), ${max}px)`;

const PAGE_SIZE = 20;

const BookingListView = ({ bookings: propBookings, loading: propLoading, onEdit, onApprove, filterDate, setFilterDate, onCreate, fetchParams, refreshTrigger = 0 }) => {
    const [activeTab, setActiveTab] = useState('all');

    // Server-side pagination state (khi có fetchParams)
    const [serverBookings, setServerBookings] = useState([]);
    const [serverLoading, setServerLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const isServerMode = !!fetchParams;
    const bookings = isServerMode ? serverBookings : (propBookings || []);
    const loading   = isServerMode ? serverLoading  : propLoading;

    useEffect(() => {
        if (!isServerMode) return;
        let cancelled = false;
        const load = async () => {
            setServerLoading(true);
            try {
                const res = await adminBookingService.getAllBookings({
                    ...fetchParams,
                    page,
                    limit: PAGE_SIZE,
                });
                if (!cancelled && res.success) {
                    setServerBookings(res.bookings || []);
                    setTotal(res.total || 0);
                }
            } finally {
                if (!cancelled) setServerLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [page, fetchParams?.branchId, fetchParams?.staffId, fetchParams?.paymentStatus, isServerMode, refreshTrigger]);

    const getFilteredBookings = () => {
        if (activeTab === 'all') return bookings;
        if (activeTab === 'completed_group') {
            return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
        }
        return bookings.filter(b => b.status === activeTab);
    };

    const filteredData = getFilteredBookings();

    const items = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'confirmed', label: 'Sắp tới' },
        { key: 'processing', label: 'Đang làm' },
        { key: 'completed_group', label: 'Lịch sử' },
    ];

    const STATUS_MAP = {
        confirmed:  { color: 'success',    text: 'XÁC NHẬN' },
        pending:    { color: 'warning',    text: 'CHỜ DUYỆT' },
        completed:  { color: 'processing', text: 'HOÀN THÀNH' },
        cancelled:  { color: 'error',      text: 'ĐÃ HỦY' },
        processing: { color: 'blue',       text: 'ĐANG LÀM' },
    };

    const columns = [
        {
            title: <IconHeader icon={<ClockCircleOutlined />} label="Thời gian" />,
            dataIndex: 'startTime',
            key: 'startTime',
            width: '14%',
            render: (text) => (
                <div>
                    <div style={{ color: theme.colors.primary[800], fontWeight: 700, fontSize: fl(13, 15), lineHeight: 1.3 }}>
                        {fmtTime(text)}
                    </div>
                    <div style={{ color: '#888', fontSize: fl(10, 12) }}>
                        {fmtDate(text)}
                    </div>
                </div>
            ),
            sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
        },
        {
            title: <IconHeader icon={<UserOutlined />} label="Khách hàng" />,
            dataIndex: 'customerName',
            key: 'customerName',
            width: '26%',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: fl(6, 10) }}>
                    <Avatar size={fl(26, 32)} style={{
                        backgroundColor: theme.colors.primary[100],
                        color: theme.colors.primary[600],
                        border: `1px solid ${theme.colors.primary[200]}`,
                        flexShrink: 0,
                        fontSize: fl(11, 13)
                    }}>
                        {text ? text.charAt(0).toUpperCase() : '?'}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: fl(12, 14), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
                        <div style={{ fontSize: fl(10, 12), color: '#666' }}>{record.phone}</div>
                    </div>
                </div>
            ),
        },
        {
            title: <IconHeader icon={<AppstoreOutlined />} label="Dịch vụ" />,
            dataIndex: 'serviceId',
            key: 'service',
            width: '32%',
            render: (service) => service ? (
                <Tag color="default" style={{ borderRadius: 20, padding: `1px ${fl(6, 10)}`, fontSize: fl(11, 13), whiteSpace: 'normal', lineHeight: 1.4 }}>
                    {service.name}
                </Tag>
            ) : <Typography.Text type="danger">--</Typography.Text>,
        },
        {
            title: <IconHeader icon={<CheckCircleOutlined />} label="Trạng thái" />,
            dataIndex: 'status',
            key: 'status',
            width: '22%',
            render: (status, record) => {
                const { color, text } = STATUS_MAP[status] || { color: 'default', text: 'Khác' };
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Tag color={color} style={{ fontWeight: 600, fontSize: fl(10, 12), margin: 0 }}>{text}</Tag>
                        {status === 'pending' && (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onApprove && onApprove(record._id); }}
                                style={{ fontSize: fl(10, 12), padding: '0 6px', height: 22 }}
                            >
                                Duyệt
                            </Button>
                        )}
                    </div>
                );
            },
        },
        {
            title: <IconHeader icon={<EditOutlined />} label="Chi tiết" />,
            key: 'action',
            width: '6%',
            render: (_, record) => (
                <Button type="link" size="small" onClick={() => onEdit(record)} style={{ fontSize: fl(11, 13), padding: '0 4px' }}>
                    Xem
                </Button>
            ),
        },
    ];

    return (
        <div style={{ background: '#fff', padding: `${fl(12, 20)} ${fl(12, 20)}`, borderRadius: 8, boxShadow: theme.shadows.soft }}>
            <style>{`
                .booking-list-table .ant-table-thead > tr > th {
                    font-size: clamp(10px, 1vw, 12px) !important;
                    padding: 8px 8px !important;
                    white-space: nowrap;
                }
                .booking-list-table .ant-table-tbody > tr > td {
                    padding: 8px 8px !important;
                    vertical-align: middle;
                }
                .booking-list-table .ant-tabs-tab {
                    font-size: clamp(11px, 1vw, 13px) !important;
                    padding: 4px 10px !important;
                }
            `}</style>
            <div style={{ marginBottom: fl(12, 20), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Typography.Title level={5} style={{ margin: 0, fontSize: fl(14, 16) }}>Danh Sách Đơn</Typography.Title>
                <Space size={6}>
                    <DatePicker placeholder="Lọc ngày" format="DD/MM/YYYY" onChange={setFilterDate} size="small" style={{ fontSize: fl(11, 13) }} />
                    <Button type="primary" onClick={onCreate} size="small" style={{ fontSize: fl(11, 13) }}>+ Tạo Đơn</Button>
                </Space>
            </div>

            <Tabs
                defaultActiveKey="all"
                items={items}
                onChange={setActiveTab}
                type="card"
                size="small"
                style={{ marginBottom: 12 }}
            />

            <Table
                className="booking-list-table"
                columns={columns}
                dataSource={filteredData}
                rowKey="_id"
                loading={loading}
                size="small"
                pagination={isServerMode ? {
                    current: page,
                    pageSize: PAGE_SIZE,
                    total: total,
                    onChange: (p) => { setPage(p); setActiveTab('all'); },
                    showTotal: (t) => `${t} đơn`,
                    showSizeChanger: false,
                    size: 'small',
                } : { pageSize: 8, size: 'small' }}
                tableLayout="fixed"
            />
        </div>
    );
};

export default BookingListView;
