import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Card, Tabs, DatePicker, Table, Button, Row, Col,
    Statistic, Tag, message, Form, Input, Select, Modal, Popconfirm,
    Space, Badge, Tooltip
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, ResponsiveContainer
} from 'recharts';
import {
    DollarOutlined, UserOutlined, FileTextOutlined,
    PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
    TrophyOutlined, TeamOutlined, CalendarOutlined, WalletOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { dashboardService } from '../../../services/dashboardService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

const PAYMENT_LABEL = { cash: 'Tiền mặt', banking: 'Chuyển khoản', card: 'Thẻ' };
const PAYMENT_COLOR = { cash: 'green', banking: 'blue', card: 'purple' };

const EXPENSE_CATS = [
    { value: 'supply', label: 'Mua vật tư / mỹ phẩm' },
    { value: 'food', label: 'Ăn uống / tiếp khách' },
    { value: 'salary', label: 'Lương / thưởng' },
    { value: 'utility', label: 'Điện / nước / internet' },
    { value: 'other', label: 'Chi khác' },
];
const INCOME_CATS = [
    { value: 'booking', label: 'Thu dịch vụ' },
    { value: 'retail', label: 'Bán lẻ sản phẩm' },
    { value: 'tip', label: 'Tiền tip' },
    { value: 'other_income', label: 'Thu khác' },
];

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
// ─── TAB 1: DOANH THU ────────────────────────────────────────────────────────
const TabRevenue = () => {
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [rev, top] = await Promise.all([
                dashboardService.getRevenueChart(period),
                dashboardService.getTopServices(),
            ]);
            if (rev.success) setData(rev.data);
            if (top.success) setTopServices(top.data?.slice(0, 8) || []);
        } catch (_) {} finally { setLoading(false); }
    }, [period]);

    useEffect(() => { load(); }, [load]);

    const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title={period === 'week' ? 'Doanh Thu 7 Ngày' : 'Doanh Thu 6 Tháng'}
                            value={totalRevenue} formatter={fmt}
                            prefix={<DollarOutlined />} valueStyle={{ color: '#D4AF37' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Kỳ có doanh thu"
                            value={data.filter(d => d.revenue > 0).length}
                            suffix={period === 'week' ? '/ 7 ngày' : '/ 6 tháng'}
                            prefix={<CalendarOutlined />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Trung bình / kỳ"
                            value={data.length ? Math.round(totalRevenue / data.length) : 0}
                            formatter={fmt} />
                    </Card>
                </Col>
            </Row>

            <Card
                title="Biểu đồ doanh thu"
                extra={
                    <Space>
                        <Select value={period} onChange={setPeriod} style={{ width: 130 }}>
                            <Option value="week">7 ngày qua</Option>
                            <Option value="month">6 tháng qua</Option>
                        </Select>
                    </Space>
                }
                style={{ marginBottom: 16 }}
            >
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={v => (v / 1000) + 'k'} />
                        <RTooltip formatter={fmt} />
                        <Bar dataKey="revenue" fill="#D4AF37" name="Doanh thu" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Top dịch vụ tháng này">
                <Table
                    dataSource={topServices}
                    rowKey="name"
                    size="small"
                    pagination={false}
                    columns={[
                        { title: '#', render: (_, __, i) => <Text strong style={{ color: i < 3 ? '#D4AF37' : undefined }}>{i + 1}</Text>, width: 40 },
                        { title: 'Dịch vụ', dataIndex: 'name', key: 'name' },
                        { title: 'Lượt dùng', dataIndex: 'count', key: 'count', render: v => <Badge count={v} color="#1890ff" overflowCount={999} /> },
                        { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: v => <Text style={{ color: '#52c41a', fontWeight: 600 }}>{fmt(v)}</Text> },
                    ]}
                />
            </Card>
        </div>
    );
};

// ─── TAB 2: BÁO CÁO CUỐI NGÀY ───────────────────────────────────────────────
const TabDailyReport = () => {
    const [date, setDate] = useState(dayjs());
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/reports/daily?date=${date.format('YYYY-MM-DD')}`, { headers: getHeaders() });
            const data = await res.json();
            if (data.success) { setRows(data.tableData); setSummary(data.summary); }
        } catch (_) {} finally { setLoading(false); }
    }, [date]);

    useEffect(() => { load(); }, [load]);

    const columns = [
        { title: 'Giờ', dataIndex: 'time', width: 55, render: v => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(v).format('HH:mm')}</Text> },
        { title: 'Loại', dataIndex: 'rowType', width: 60,
            render: t => t === 'income' ? <Tag color="green" style={{ fontSize: 11 }}>THU</Tag> : <Tag color="red" style={{ fontSize: 11 }}>CHI</Tag> },
        {
            title: 'Khách hàng', key: 'customer',
            render: (_, r) => r.rowType === 'income' ? (
                <Space direction="vertical" size={0}>
                    <Text strong>{r.customerName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text>
                </Space>
            ) : <Text type="secondary" italic>{r.note || '— Chi —'}</Text>
        },
        { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
        { title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
        { title: 'Tiền DV', dataIndex: 'price', render: (v, r) => r.rowType === 'income' ? fmt(v) : '—', align: 'right' },
        {
            title: 'Tip', dataIndex: 'tip',
            render: (v, r) => r.rowType === 'income' && v > 0 ? <Text style={{ color: '#52c41a' }}>{fmt(v)}</Text> : <Text type="secondary">—</Text>,
            align: 'right'
        },
        {
            title: 'Tổng', dataIndex: 'total',
            render: (v, r) => r.rowType === 'income'
                ? <Text strong style={{ color: '#1890ff' }}>{fmt(v)}</Text>
                : <Text strong style={{ color: '#ff4d4f' }}>-{fmt(Math.abs(v))}</Text>,
            align: 'right'
        },
        {
            title: 'PTTT', dataIndex: 'paymentMethod',
            render: v => <Tag color={PAYMENT_COLOR[v] || 'default'}>{PAYMENT_LABEL[v] || v || '—'}</Tag>
        },
        { title: 'Ghi chú', dataIndex: 'note', render: v => v || '—', ellipsis: true },
    ];

    return (
        <div>
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={12} align="middle">
                    <Col><Text strong>Ngày: </Text>
                        <DatePicker value={date} onChange={d => setDate(d || dayjs())} format="DD/MM/YYYY" allowClear={false} />
                    </Col>

                </Row>
            </Card>

            <Row gutter={12} style={{ marginBottom: 16 }}>
                <Col span={5}><Card><Statistic title="Số khách" value={summary.totalCustomers || 0} prefix={<UserOutlined />} /></Card></Col>
                <Col span={5}><Card><Statistic title="Tổng Thu DV" value={summary.totalIncome || 0} formatter={fmt} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={4}><Card><Statistic title="Tổng Tip" value={summary.totalTip || 0} formatter={fmt} valueStyle={{ color: '#D4AF37' }} /></Card></Col>
                <Col span={5}><Card><Statistic title="Tổng Chi" value={summary.totalExpense || 0} formatter={fmt} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
                <Col span={5}><Card><Statistic title="Ọ Két (Thu - Chi)" value={summary.netCash || 0} formatter={fmt} valueStyle={{ color: (summary.netCash || 0) >= 0 ? '#1890ff' : '#ff4d4f', fontWeight: 700 }} /></Card></Col>
            </Row>

            <Card title={`Bảng Báo Cáo Ngày ${date.format('DD/MM/YYYY')}`}>
                <Table
                    columns={columns}
                    dataSource={rows}
                    rowKey="stt"
                    loading={loading}
                    size="small"
                    pagination={false}
                    locale={{ emptyText: 'Chưa có lịch hẹn nào hôm nay' }}
                    summary={() => rows.length > 0 && (
                        <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 700 }}>
                            <Table.Summary.Cell colSpan={4}><Text strong>TỔNG CỘNG</Text></Table.Summary.Cell>
                            <Table.Summary.Cell align="right"><Text style={{ color: '#52c41a' }}>{fmt(summary.totalRevenue)}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell align="right"><Text style={{ color: '#D4AF37' }}>{fmt(summary.totalTip)}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell align="right"><Text strong style={{ color: '#1890ff' }}>{fmt(summary.totalAll)}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell colSpan={4} />
                        </Table.Summary.Row>
                    )}
                />
            </Card>
        </div>
    );
};

// ─── TAB 3: SỔ QUỸ THU/CHI ────────────────────────────────────────────────────
const TabCashflow = () => {
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({ totalIncome: 0, totalTip: 0, totalExpense: 0, netCash: 0 });
    const [loading, setLoading] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => setRefreshKey(k => k + 1);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    startDate: dateRange[0].format('YYYY-MM-DD'),
                    endDate:   dateRange[1].format('YYYY-MM-DD'),
                });
                const res = await fetch(`${API_URL}/api/reports/cashflow?${params}`, { headers: getHeaders() });
                const data = await res.json();
                if (!cancelled && data.success) {
                    setRows(data.tableData);
                    setSummary(data.summary || {});
                }
            } catch (_) {} finally { if (!cancelled) setLoading(false); }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [dateRange, refreshKey]);

    const openAdd = () => {
        form.resetFields();
        form.setFieldsValue({ date: dayjs(), paymentMethod: 'cash' });
        setAddModalOpen(true);
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const res = await fetch(`${API_URL}/api/expenses`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({ ...values, date: values.date?.toISOString(), amount: Number(values.amount) }),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Đã thêm phiếu chi');
                setAddModalOpen(false);
                refresh();
            } else message.error(data.message || 'Có lỗi xảy ra');
        } catch (err) { message.error('Lỗi: ' + (err.message || err)); } finally { setSubmitting(false); }
    };

    const handleDeleteExpense = async (id) => {
        await fetch(`${API_URL}/api/expenses/${id}`, { method: 'DELETE', headers: getHeaders() });
        message.success('Đã xóa');
        refresh();
    };

    const columns = [
        {
            title: 'Giờ', dataIndex: 'time', width: 110,
            render: v => dayjs(v).format('DD/MM HH:mm')
        },
        {
            title: 'Loại', dataIndex: 'rowType', width: 70,
            render: t => t === 'income'
                ? <Tag color="green" icon={<ArrowUpOutlined />}>THU</Tag>
                : <Tag color="red" icon={<ArrowDownOutlined />}>CHI</Tag>
        },
        {
            title: 'Nội dung', key: 'content', ellipsis: true,
            render: (_, r) => r.rowType === 'income'
                ? <span><Text strong>{r.customerName}</Text>{r.serviceName !== '—' && <Text type="secondary"> · {r.serviceName}</Text>}</span>
                : <Text>{r.customerName}</Text>
        },
        { title: 'Nhân viên / Người lập', dataIndex: 'staffName', width: 140 },
        {
            title: 'Số tiền', dataIndex: 'total', width: 130, align: 'right',
            render: (v, r) => <Text strong style={{ color: r.rowType === 'income' ? '#52c41a' : '#ff4d4f' }}>{fmt(v)}</Text>
        },
        {
            title: 'PTTT', dataIndex: 'paymentMethod', width: 110,
            render: v => <Tag color={PAYMENT_COLOR[v]}>{PAYMENT_LABEL[v] || v}</Tag>
        },
        {
            title: '', key: 'del', width: 46,
            render: (_, r) => r.rowType === 'expense' ? (
                <Popconfirm title="Xóa phiếu chi này?" onConfirm={() => handleDeleteExpense(r._id)} okText="Xóa" cancelText="Hủy">
                    <Button size="small" danger icon={<DeleteOutlined />} type="text" />
                </Popconfirm>
            ) : null
        },
    ];

    const net = summary.netCash || 0;

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                    <Card style={{ borderLeft: '4px solid #52c41a' }}>
                        <Statistic title="Tổng Thu (DV + Tip)" value={(summary.totalIncome || 0)}
                            formatter={fmt} prefix={<ArrowUpOutlined />} valueStyle={{ color: '#52c41a' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
                        <Statistic title="Tổng Chi" value={summary.totalExpense || 0}
                            formatter={fmt} prefix={<ArrowDownOutlined />} valueStyle={{ color: '#ff4d4f' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card style={{ borderLeft: `4px solid ${net >= 0 ? '#1890ff' : '#faad14'}` }}>
                        <Statistic title="Ọ Két (Thu - Chi)" value={net}
                            formatter={fmt} prefix={<WalletOutlined />}
                            valueStyle={{ color: net >= 0 ? '#1890ff' : '#ff4d4f', fontWeight: 700 }} />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <RangePicker value={dateRange} onChange={r => r && setDateRange(r)} format="DD/MM/YYYY" allowClear={false} />
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                        <Tooltip title="Thu từ dịch vụ tự động vào đây khi thanh toán. Dùng nút này để ghi chi phí thủ công.">
                            <Button danger icon={<ArrowDownOutlined />} onClick={() => openAdd()}>
                                + Lập Phiếu Chi
                            </Button>
                        </Tooltip>
                    </Col>
                </Row>

                <Table columns={columns} dataSource={rows} rowKey="_id" loading={loading} size="small"
                    pagination={{ pageSize: 30, showTotal: t => `${t} dòng` }}
                    rowClassName={r => r.rowType === 'income' ? 'income-row' : 'expense-row'}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={4}><Text strong>Tổng kỳ</Text></Table.Summary.Cell>
                            <Table.Summary.Cell align="right">
                                <Text strong style={{ color: net >= 0 ? '#1890ff' : '#ff4d4f' }}>{fmt(net)}</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell colSpan={2} />
                        </Table.Summary.Row>
                    )}
                />
            </Card>

            <Modal
                title="+ Lập Phiếu Chi"
                open={addModalOpen} onOk={handleAdd} onCancel={() => setAddModalOpen(false)}
                okText="Lưu" cancelText="Hủy" confirmLoading={submitting}
                okButtonProps={{ danger: true }}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="reason" label="Nội dung chi" rules={[{ required: true, message: 'Nhập nội dung' }]}>
                        <Input placeholder="VD: Mua nước rửa chén, đá cục, khăn..." />
                    </Form.Item>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="amount" label="Số tiền (đ)" rules={[{ required: true, message: 'Nhập số tiền' }]}>
                                <Input type="number" min={0} placeholder="150000" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="paymentMethod" label="Hình thức">
                                <Select>
                                    <Option value="cash">Tiền mặt</Option>
                                    <Option value="banking">Chuyển khoản</Option>
                                    <Option value="card">Thẻ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="category" label="Danh mục">
                        <Select allowClear placeholder="Chọn danh mục">
                            {EXPENSE_CATS.map(c => (
                                <Option key={c.value} value={c.value}>{c.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Ngày">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .income-row td { background: #f6ffed !important; }
                .expense-row td { background: #fff2f0 !important; }
            `}</style>
        </div>
    );
};

// ─── TAB 4: NHÂN VIÊN ────────────────────────────────────────────────────────
const TabStaff = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs()]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await dashboardService.getStaffPerformance(
                dateRange[0].format('YYYY-MM-DD'),
                dateRange[1].format('YYYY-MM-DD')
            );
            if (res.success) setData(res.data);
        } catch (_) {} finally { setLoading(false); }
    }, [dateRange]);

    useEffect(() => { load(); }, [load]);

    const columns = [
        {
            title: '#', render: (_, __, i) => (
                i === 0 ? <TrophyOutlined style={{ color: '#FFD700', fontSize: 18 }} /> :
                i === 1 ? <TrophyOutlined style={{ color: '#C0C0C0', fontSize: 18 }} /> :
                i === 2 ? <TrophyOutlined style={{ color: '#CD7F32', fontSize: 18 }} /> :
                <Text type="secondary">{i + 1}</Text>
            ), width: 50
        },
        { title: 'Nhân viên', dataIndex: 'name', render: v => <Text strong>{v}</Text> },
        { title: 'Ngày làm', dataIndex: 'workingDays', render: v => <Tag color="blue">{v || 0} ngày</Tag> },
        { title: 'Lượt phục vụ', dataIndex: 'totalBookings', render: v => <Badge count={v} color="#1890ff" overflowCount={999} /> },
        { title: 'Khách', dataIndex: 'uniqueCustomers' },
        {
            title: 'Doanh thu', dataIndex: 'totalRevenue',
            render: v => <Text strong style={{ color: '#52c41a' }}>{fmt(v)}</Text>,
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
            defaultSortOrder: 'descend',
        },
        {
            title: 'TB / lượt', key: 'avg',
            render: (_, r) => <Text type="secondary">{fmt(r.totalBookings ? Math.round(r.totalRevenue / r.totalBookings) : 0)}</Text>
        },
        {
            title: 'Tip nhận được', dataIndex: 'totalTip',
            render: (v, r) => v > 0 ? (
                <span>
                    <Text strong style={{ color: '#389e0d' }}>{fmt(v)}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}> ({r.tipCount} lượt)</Text>
                </span>
            ) : <Text type="secondary">—</Text>
        },
        {
            title: 'Tổng nhận', key: 'grand',
            render: (_, r) => <Text strong style={{ color: '#D4AF37', fontSize: 13 }}>{fmt((r.totalRevenue || 0) + (r.totalTip || 0))}</Text>
        },
    ];

    const totalRevenue = data.reduce((s, d) => s + d.totalRevenue, 0);
    const totalBookings = data.reduce((s, d) => s + d.totalBookings, 0);
    const totalTip = data.reduce((s, d) => s + (d.totalTip || 0), 0);

    return (
        <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}><Card><Statistic title="Tổng doanh thu kỳ" value={totalRevenue} formatter={fmt} valueStyle={{ color: '#D4AF37' }} /></Card></Col>
                <Col span={6}><Card><Statistic title="Tổng lượt phục vụ" value={totalBookings} prefix={<TeamOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Số nhân viên" value={data.length} prefix={<UserOutlined />} /></Card></Col>
                <Col span={6}><Card><Statistic title="Tổng tip (nội bộ)" value={totalTip} formatter={fmt} valueStyle={{ color: '#389e0d' }} prefix="❤️" /></Card></Col>
            </Row>

            <Card
                title="Hiệu suất nhân viên"
                extra={
                    <Space>
                        <RangePicker value={dateRange} onChange={r => r && setDateRange(r)} format="DD/MM/YYYY" allowClear={false} />
                    </Space>
                }
            >
                <Table columns={columns} dataSource={data} rowKey="key" loading={loading} pagination={false} size="small" />
            </Card>
        </div>
    );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
const ReportManager = () => {
    const tabItems = [
        { key: '1', label: <span><DollarOutlined /> Doanh Thu</span>, children: <TabRevenue /> },
        { key: '2', label: <span><FileTextOutlined /> Báo Cáo Ngày</span>, children: <TabDailyReport /> },
        { key: '3', label: <span><WalletOutlined /> Sổ Quỹ Thu/Chi</span>, children: <TabCashflow /> },
        { key: '4', label: <span><TeamOutlined /> Nhân Viên</span>, children: <TabStaff /> },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <FileTextOutlined style={{ marginRight: 8, color: '#D4AF37' }} />
                    Báo Cáo & Sổ Quỹ
                </Title>
                <Text type="secondary">Thống kê doanh thu, lịch hẹn theo ngày và quản lý thu chi</Text>
            </div>
            <Tabs defaultActiveKey="1" items={tabItems} destroyInactiveTabPane={false} />
        </div>
    );
};

export default ReportManager;
