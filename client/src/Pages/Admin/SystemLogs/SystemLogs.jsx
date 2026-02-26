import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Select, DatePicker, Button, Space, Typography,
    Card, Row, Col, Tooltip, Divider, Input
} from 'antd';
import {
    SearchOutlined, FilterOutlined,
    UserOutlined, ClockCircleOutlined, ApartmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Màu / nhãn cho từng action ─────────────────────────────────────────────
const ACTION_META = {
    AUTH_LOGIN:       { color: 'blue',    label: 'Đăng nhập' },
    BOOKING_CREATE:   { color: 'green',   label: 'Tạo lịch' },
    BOOKING_UPDATE:   { color: 'cyan',    label: 'Cập nhật lịch' },
    BOOKING_DELETE:   { color: 'red',     label: 'Xóa lịch' },
    BOOKING_CANCEL:   { color: 'orange',  label: 'Hủy lịch' },
    BOOKING_APPROVE:  { color: 'geekblue',label: 'Duyệt lịch' },
    BOOKING_CHECKIN:  { color: 'lime',    label: 'Check-in' },
    BOOKING_COMPLETE: { color: 'success', label: 'Hoàn thành' },
    SERVICE_CREATE:   { color: 'purple',  label: 'Tạo dịch vụ' },
    SERVICE_UPDATE:   { color: 'purple',  label: 'Sửa dịch vụ' },
    SERVICE_DELETE:   { color: 'magenta', label: 'Xóa dịch vụ' },
    STAFF_CREATE:     { color: 'gold',    label: 'Thêm nhân viên' },
    STAFF_UPDATE:     { color: 'gold',    label: 'Sửa nhân viên' },
    STAFF_DELETE:     { color: 'volcano', label: 'Xóa nhân viên' },
    ROOM_CREATE:      { color: 'cyan',    label: 'Tạo phòng' },
    ROOM_UPDATE:      { color: 'cyan',    label: 'Sửa phòng' },
    ROOM_DELETE:      { color: 'red',     label: 'Xóa phòng' },
    PROMOTION_CREATE: { color: 'pink',    label: 'Tạo KM' },
    PROMOTION_UPDATE: { color: 'pink',    label: 'Sửa KM' },
    PROMOTION_DELETE: { color: 'magenta', label: 'Xóa KM' },
    BRANCH_CREATE:    { color: 'cyan',    label: 'Tạo chi nhánh' },
    BRANCH_UPDATE:    { color: 'cyan',    label: 'Sửa chi nhánh' },
    BRANCH_DELETE:    { color: 'red',     label: 'Xóa chi nhánh' },
    USER_CREATE:      { color: 'geekblue',label: 'Tạo tài khoản' },
    USER_UPDATE:      { color: 'geekblue',label: 'Sửa tài khoản' },
    USER_DELETE:      { color: 'volcano', label: 'Xóa tài khoản' },
    FEEDBACK_APPROVE: { color: 'green',   label: 'Duyệt phản hồi' },
    FEEDBACK_REJECT:  { color: 'orange',  label: 'Từ chối phản hồi' },
    FEEDBACK_DELETE:  { color: 'red',     label: 'Xóa phản hồi' },
    SYSTEM_CONFIG:    { color: 'default', label: 'Cấu hình hệ thống' },
};

const ACTION_OPTIONS = Object.entries(ACTION_META).map(([value, { label }]) => ({
    value,
    label,
}));

const TARGET_TYPE_OPTIONS = [
    'Booking', 'Service', 'Staff', 'Room', 'Promotion', 'User', 'Branch', 'Feedback', 'System'
].map(v => ({ value: v, label: v }));

// ─── Component ──────────────────────────────────────────────────────────────
const SystemLogs = () => {
    const [logs, setLogs]         = useState([]);
    const [total, setTotal]       = useState(0);
    const [loading, setLoading]   = useState(false);

    // Filters
    const [dateRange, setDateRange]       = useState(null);
    const [actionFilter, setActionFilter] = useState(null);
    const [targetFilter, setTargetFilter] = useState(null);
    const [userSearch, setUserSearch]     = useState('');

    // Pagination
    const [page, setPage]   = useState(1);
    const [limit]           = useState(25);

    const fetchLogs = useCallback(async (currentPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit,
            });
            if (actionFilter) params.append('action', actionFilter);
            if (targetFilter) params.append('targetType', targetFilter);
            if (dateRange?.[0]) params.append('startDate', dateRange[0].startOf('day').toISOString());
            if (dateRange?.[1]) params.append('endDate',   dateRange[1].endOf('day').toISOString());

            const res = await fetch(`${API_URL}/api/logs?${params.toString()}`, {
                headers: getAuthHeaders(),
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch (err) {
            console.error('[SystemLogs] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, actionFilter, targetFilter, dateRange]);

    // Re-fetch when filters change (reset to page 1)
    useEffect(() => {
        setPage(1);
        fetchLogs(1);
    }, [actionFilter, targetFilter, dateRange]);

    // Re-fetch when page changes
    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const handleReset = () => {
        setDateRange(null);
        setActionFilter(null);
        setTargetFilter(null);
        setUserSearch('');
        setPage(1);
        fetchLogs(1);
    };

    // ── Columns ────────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 160,
            render: (ts) => (
                <Tooltip title={dayjs(ts).format('DD/MM/YYYY HH:mm:ss')}>
                    <Space orientation="vertical" size={0}>
                        <Text style={{ fontSize: 13 }}>{dayjs(ts).format('DD/MM/YYYY')}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(ts).format('HH:mm:ss')}</Text>
                    </Space>
                </Tooltip>
            ),
        },
        {
            title: 'Người thực hiện',
            dataIndex: 'displayName',
            key: 'user',
            width: 160,
            filteredValue: userSearch ? [userSearch] : null,
            onFilter: (value, record) =>
                record.displayName?.toLowerCase().includes(value.toLowerCase()),
            render: (name, record) => (
                <Space orientation="vertical" size={0}>
                    <Text strong style={{ fontSize: 13 }}>{name}</Text>
                    <Tag color="default" style={{ fontSize: 11 }}>{record.role}</Tag>
                </Space>
            ),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            key: 'action',
            width: 150,
            render: (action) => {
                const meta = ACTION_META[action] || { color: 'default', label: action };
                return <Tag color={meta.color}>{meta.label}</Tag>;
            },
        },
        {
            title: 'Đối tượng',
            dataIndex: 'targetType',
            key: 'target',
            width: 180,
            render: (type, record) => (
                <Space orientation="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{record.targetName || '—'}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{type}</Text>
                </Space>
            ),
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'branchId',
            key: 'branch',
            width: 130,
            render: (branch) => branch?.name
                ? <Tag color="processing">{branch.name}</Tag>
                : <Text type="secondary">—</Text>,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'details',
            key: 'details',
            render: (details) => {
                if (!details || Object.keys(details).length === 0) return <Text type="secondary">—</Text>;
                const str = JSON.stringify(details, null, 0);
                const preview = str.length > 80 ? str.slice(0, 80) + '…' : str;
                return (
                    <Tooltip title={<pre style={{ maxWidth: 400, whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify(details, null, 2)}</pre>} overlayStyle={{ maxWidth: 440 }}>
                        <Text type="secondary" style={{ fontSize: 12, cursor: 'pointer' }}>{preview}</Text>
                    </Tooltip>
                );
            },
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            width: 130,
            render: (ip) => <Text code style={{ fontSize: 11 }}>{ip || '—'}</Text>,
        },
    ];

    // ── Filtered rows (client-side user search on top of server data) ───────
    const displayedLogs = userSearch
        ? logs.filter(l => l.displayName?.toLowerCase().includes(userSearch.toLowerCase()))
        : logs;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Nhật Ký Hệ Thống</Title>
                    <Text type="secondary">Theo dõi mọi thao tác của admin &amp; nhân viên</Text>
                </Col>

            </Row>

            {/* Filter Bar */}
            <Card
                size="small"
                style={{ marginBottom: 16, borderRadius: 8 }}
                bodyStyle={{ padding: '12px 16px' }}
            >
                <Row gutter={[12, 8]} align="middle">
                    <Col xs={24} sm={12} md={7}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Lọc hành động"
                            options={ACTION_OPTIONS}
                            value={actionFilter}
                            onChange={setActionFilter}
                            allowClear
                            showSearch
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Loại đối tượng"
                            options={TARGET_TYPE_OPTIONS}
                            value={targetFilter}
                            onChange={setTargetFilter}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo tên người dùng"
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={3}>
                        <Button onClick={handleReset} block>
                            Xóa lọc
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
                <Table
                    dataSource={displayedLogs}
                    columns={columns}
                    rowKey="_id"
                    loading={loading}
                    size="small"
                    scroll={{ x: 1000 }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: false,
                        showTotal: (t) => `${t} bản ghi`,
                        onChange: (p) => setPage(p),
                    }}
                    style={{ borderRadius: 8 }}
                />
            </Card>
        </div>
    );
};

export default SystemLogs;
