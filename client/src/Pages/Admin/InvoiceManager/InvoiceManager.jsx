import React, { useState, useEffect } from 'react';
import {
    Table, Tag, Button, Typography, Card, DatePicker,
    Row, Col, Statistic, Drawer, Descriptions, Divider,
    Space, Input, Modal, message, Tooltip, Empty
} from 'antd';
import {
    FileTextOutlined, SearchOutlined, EyeOutlined,
    StopOutlined, DollarOutlined, UserOutlined, CreditCardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminBookingService } from '../../../services/adminBookingService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' ₫';

const PM_MAP = {
    cash:    { label: 'Tiền mặt',   color: 'green' },
    banking: { label: 'Chuyển khoản', color: 'blue' },
    card:    { label: 'Quẹt thẻ',   color: 'purple' },
};

const InvoiceManager = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [voidModal, setVoidModal] = useState(false);
    const [voidReason, setVoidReason] = useState('');
    const [voidingId, setVoidingId] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await adminBookingService.getInvoices();
            setInvoices(Array.isArray(data?.invoices) ? data.invoices : []);
        } catch {
            message.error('Lỗi tải danh sách hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInvoices(); }, []);

    // Filter
    const filtered = invoices.filter(inv => {
        const created = dayjs(inv.createdAt);
        const inRange = !dateRange || (
            created.isAfter(dateRange[0].startOf('day').subtract(1, 'ms')) &&
            created.isBefore(dateRange[1].endOf('day').add(1, 'ms'))
        );
        const q = search.toLowerCase();
        const matchSearch = !q || (inv.customerName || '').toLowerCase().includes(q)
            || (inv.phone || '').includes(q)
            || (inv._id || '').toLowerCase().includes(q);
        return inRange && matchSearch;
    });

    // Stats
    const totalRevenue = filtered.reduce((s, i) => s + (i.finalTotal || 0), 0);
    const totalTip = filtered.reduce((s, i) => s + (i.tipAmount || 0), 0);
    const voidedCount = filtered.filter(i => i.note?.includes('[VOIDED')).length;

    const handleVoid = async () => {
        if (!voidReason.trim()) { message.warning('Vui lòng nhập lý do hủy'); return; }
        try {
            const res = await fetch(`${API_URL}/api/invoices/${voidingId}/void`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ reason: voidReason })
            });
            const data = await res.json();
            if (data.success) {
                message.success('Đã hủy hóa đơn');
                setVoidModal(false);
                setVoidReason('');
                fetchInvoices();
            }
        } catch { message.error('Lỗi hủy hóa đơn'); }
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (t) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#1f1f1f' }}>{dayjs(t).format('HH:mm')}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{dayjs(t).format('DD/MM/YYYY')}</div>
                </div>
            ),
            sorter: (a, b) => dayjs(a.createdAt) - dayjs(b.createdAt),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            width: 180,
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{r.customerName}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{r.phone}</div>
                </div>
            ),
        },
        {
            title: 'Dịch vụ / SP',
            key: 'items',
            render: (_, r) => (
                <div style={{ maxWidth: 220 }}>
                    {(r.items || []).map((it, i) => (
                        <Tag key={i} style={{ marginBottom: 2, fontSize: 11 }}>{it.name}</Tag>
                    ))}
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalTotal',
            key: 'finalTotal',
            width: 130,
            render: (v) => <Text strong style={{ color: '#52c41a' }}>{fmt(v)}</Text>,
            sorter: (a, b) => a.finalTotal - b.finalTotal,
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            width: 130,
            render: (pm) => {
                const m = PM_MAP[pm] || { label: pm, color: 'default' };
                return <Tag color={m.color}>{m.label}</Tag>;
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 100,
            render: (_, r) => r.note?.includes('[VOIDED')
                ? <Tag color="red">Đã hủy</Tag>
                : <Tag color="green">Hợp lệ</Tag>,
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="Xem chi tiết">
                        <Button size="small" type="text" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawerOpen(true); }} />
                    </Tooltip>
                    {!r.note?.includes('[VOIDED') && (
                        <Tooltip title="Hủy hóa đơn">
                            <Button size="small" type="text" danger icon={<StopOutlined />} onClick={() => { setVoidingId(r._id); setVoidModal(true); }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>Quản Lý Hóa Đơn</Title>
                <Text type="secondary">Lịch sử thanh toán và xuất hóa đơn</Text>
            </div>

            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Số hóa đơn" value={filtered.length} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng doanh thu" value={totalRevenue} formatter={fmt} valueStyle={{ color: '#52c41a', fontSize: 18 }} prefix={<DollarOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng tip" value={totalTip} formatter={fmt} valueStyle={{ color: '#D4AF37', fontSize: 18 }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Hóa đơn bị hủy" value={voidedCount} valueStyle={{ color: '#ff4d4f' }} prefix={<StopOutlined />} />
                    </Card>
                </Col>
            </Row>

            {/* Filter Bar */}
            <Card style={{ marginBottom: 16, borderRadius: 8 }}>
                <Row gutter={12} align="middle">
                    <Col>
                        <RangePicker
                            value={dateRange}
                            onChange={(r) => setDateRange(r)}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </Col>
                    <Col flex="auto">
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo tên, SĐT..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            allowClear
                            style={{ maxWidth: 280 }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: 8 }}>
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="_id"
                    loading={loading}
                    size="small"
                    pagination={{ pageSize: 15, size: 'small', showTotal: (t) => `${t} hóa đơn` }}
                    tableLayout="fixed"
                    locale={{ emptyText: <Empty description="Chưa có hóa đơn nào" /> }}
                    rowClassName={(r) => r.note?.includes('[VOIDED') ? 'voided-row' : ''}
                />
                <style>{`
                    .voided-row td { opacity: 0.5; text-decoration: line-through; }
                `}</style>
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={`Hóa đơn #${selected?._id?.slice(-6).toUpperCase()}`}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                width={460}
                extra={
                    selected && !selected.note?.includes('[VOIDED') && (
                        <Button danger size="small" icon={<StopOutlined />} onClick={() => { setVoidingId(selected._id); setVoidModal(true); }}>
                            Hủy HĐ
                        </Button>
                    )
                }
            >
                {selected && (
                    <>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label={<span><UserOutlined /> Khách</span>}>
                                <strong>{selected.customerName}</strong> — {selected.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                {dayjs(selected.createdAt).format('HH:mm DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thu ngân">{selected.cashierName || '—'}</Descriptions.Item>
                            <Descriptions.Item label={<span><CreditCardOutlined /> Thanh toán</span>}>
                                <Tag color={PM_MAP[selected.paymentMethod]?.color || 'default'}>
                                    {PM_MAP[selected.paymentMethod]?.label || selected.paymentMethod}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" plain style={{ fontSize: 13 }}>Chi tiết dịch vụ / sản phẩm</Divider>

                        <Table
                            size="small"
                            dataSource={selected.items || []}
                            rowKey={(_, i) => i}
                            pagination={false}
                            columns={[
                                { title: 'Tên', dataIndex: 'name', key: 'name' },
                                { title: 'Loại', dataIndex: 'type', key: 'type', width: 80, render: t => <Tag>{t === 'service' ? 'DV' : 'SP'}</Tag> },
                                { title: 'SL', dataIndex: 'qty', key: 'qty', width: 50 },
                                { title: 'Thành tiền', dataIndex: 'subtotal', key: 'subtotal', width: 110, render: v => <Text strong>{fmt(v)}</Text> },
                            ]}
                        />

                        <Divider />

                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Tạm tính">{fmt(selected.subTotal)}</Descriptions.Item>
                            {selected.discount > 0 && (
                                <Descriptions.Item label="Giảm giá">
                                    <Text type="danger">- {fmt(selected.discount)}</Text>
                                </Descriptions.Item>
                            )}
                            {selected.tax > 0 && (
                                <Descriptions.Item label="Thuế VAT">{fmt(selected.tax)}</Descriptions.Item>
                            )}
                            {selected.surchargeFee > 0 && (
                                <Descriptions.Item label="Phụ phí">{fmt(selected.surchargeFee)}</Descriptions.Item>
                            )}
                            {selected.tipAmount > 0 && (
                                <Descriptions.Item label={`Tip (${selected.tipStaffName || ''})`}>
                                    {fmt(selected.tipAmount)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label={<strong>Tổng cộng</strong>}>
                                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{fmt(selected.finalTotal)}</Text>
                            </Descriptions.Item>
                        </Descriptions>

                        {selected.note && (
                            <>
                                <Divider />
                                <Text type="secondary" style={{ fontSize: 12 }}>Ghi chú: {selected.note}</Text>
                            </>
                        )}
                    </>
                )}
            </Drawer>

            {/* Void Modal */}
            <Modal
                title="Hủy hóa đơn"
                open={voidModal}
                onCancel={() => { setVoidModal(false); setVoidReason(''); }}
                onOk={handleVoid}
                okText="Xác nhận hủy"
                okButtonProps={{ danger: true }}
            >
                <p>Nhập lý do hủy hóa đơn:</p>
                <Input.TextArea
                    rows={3}
                    value={voidReason}
                    onChange={e => setVoidReason(e.target.value)}
                    placeholder="VD: Khách yêu cầu hoàn tiền, nhập sai dịch vụ..."
                />
            </Modal>
        </div>
    );
};

export default InvoiceManager;
