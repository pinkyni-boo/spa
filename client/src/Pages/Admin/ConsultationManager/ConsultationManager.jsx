import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Tag, Button, Modal, Form, Input, Select, Space,
    Typography, Card, Row, Col, Statistic, Tooltip, message, Popconfirm, Badge
} from 'antd';
import {
    PhoneOutlined, UserOutlined, MessageOutlined,
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
    EyeOutlined, DeleteOutlined, EditOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STATUS_META = {
    pending:   { label: 'Chờ xử lý',  color: 'gold',   icon: <ClockCircleOutlined /> },
    contacted: { label: 'Đã liên hệ', color: 'blue',   icon: <PhoneOutlined /> },
    done:      { label: 'Hoàn thành', color: 'green',  icon: <CheckCircleOutlined /> },
    cancelled: { label: 'Hủy',        color: 'red',    icon: <CloseCircleOutlined /> },
};

const ConsultationManager = () => {
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const getToken = () => localStorage.getItem('token') || '';

    const fetchConsultations = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (filterStatus) params.append('status', filterStatus);
            if (search) params.append('search', search);

            const res = await fetch(`${API_URL}/api/consultations?${params}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                setConsultations(data.consultations);
                setTotal(data.total);
            }
        } catch (e) {
            message.error('Không thể tải danh sách tư vấn');
        } finally {
            setLoading(false);
        }
    }, [page, filterStatus, search]);

    useEffect(() => {
        fetchConsultations();
    }, [fetchConsultations]);

    const handleEdit = (record) => {
        setSelectedRecord(record);
        form.setFieldsValue({
            status: record.status,
            adminNotes: record.adminNotes || '',
            assignedStaff: record.assignedStaff || '',
        });
        setEditModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);
            const res = await fetch(`${API_URL}/api/consultations/${selectedRecord._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(values),
            });
            const data = await res.json();
            if (data.success) {
                message.success('Đã cập nhật!');
                setEditModalOpen(false);
                fetchConsultations();
            } else {
                message.error(data.message);
            }
        } catch (e) {
            message.error('Lỗi cập nhật');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/consultations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await res.json();
            if (data.success) {
                message.success('Đã xóa');
                fetchConsultations();
            } else {
                message.error(data.message);
            }
        } catch (e) {
            message.error('Lỗi xóa');
        }
    };

    // Stats
    const stats = {
        pending:   consultations.filter(c => c.status === 'pending').length,
        contacted: consultations.filter(c => c.status === 'contacted').length,
        done:      consultations.filter(c => c.status === 'done').length,
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 130,
            render: (v) => (
                <Text style={{ fontSize: 12 }}>
                    {dayjs(v).format('DD/MM/YYYY')}<br />
                    <span style={{ color: '#aaa' }}>{dayjs(v).format('HH:mm')}</span>
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text strong><UserOutlined style={{ marginRight: 4 }} />{r.customerName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}><PhoneOutlined style={{ marginRight: 4 }} />{r.phone}</Text>
                    {r.email && <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>}
                </Space>
            ),
        },
        {
            title: 'Quan tâm',
            dataIndex: 'serviceInterest',
            key: 'serviceInterest',
            width: 130,
            render: (v) => v ? <Tag color="purple">{v}</Tag> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Nội dung',
            dataIndex: 'concern',
            key: 'concern',
            ellipsis: true,
            render: (v) => (
                <Tooltip title={v}>
                    <Text style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v}
                    </Text>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (s) => {
                const meta = STATUS_META[s] || { label: s, color: 'default' };
                return <Tag color={meta.color} icon={meta.icon}>{meta.label}</Tag>;
            },
        },
        {
            title: 'Nhân viên PT',
            dataIndex: 'assignedStaff',
            key: 'assignedStaff',
            width: 120,
            render: (v) => v || <Text type="secondary">—</Text>,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, r) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => { setSelectedRecord(r); setDetailModalOpen(true); }}
                        />
                    </Tooltip>
                    <Tooltip title="Cập nhật">
                        <Button
                            size="small"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(r)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa yêu cầu tư vấn này?"
                        onConfirm={() => handleDelete(r._id)}
                        okText="Xóa" cancelText="Hủy"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <Title level={3} style={{ margin: 0 }}>
                    <MessageOutlined style={{ marginRight: 8, color: '#D4AF37' }} />
                    Quản Lý Tư Vấn
                </Title>
                <Text type="secondary">Danh sách yêu cầu tư vấn từ khách hàng</Text>
            </div>

            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng yêu cầu" value={total} prefix={<MessageOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xử lý"
                            value={stats.pending}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã liên hệ"
                            value={stats.contacted}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<PhoneOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.done}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filter Bar */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={12} align="middle">
                    <Col>
                        <Select
                            placeholder="Lọc trạng thái"
                            allowClear
                            style={{ width: 160 }}
                            value={filterStatus || undefined}
                            onChange={(v) => { setFilterStatus(v || ''); setPage(1); }}
                        >
                            {Object.entries(STATUS_META).map(([key, meta]) => (
                                <Option key={key} value={key}>
                                    <Tag color={meta.color}>{meta.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col flex="auto">
                        <Input.Search
                            placeholder="Tìm tên, SĐT, nội dung..."
                            allowClear
                            onSearch={(v) => { setSearch(v); setPage(1); }}
                            style={{ maxWidth: 320 }}
                        />
                    </Col>
                    <Col>
                        <Button icon={<ReloadOutlined />} onClick={fetchConsultations}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={consultations}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: 20,
                        total,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} yêu cầu`,
                    }}
                    rowClassName={(r) => r.status === 'pending' ? 'pending-row' : ''}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu tư vấn"
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={[
                    <Button key="edit" type="primary" onClick={() => { setDetailModalOpen(false); handleEdit(selectedRecord); }}>
                        Cập nhật
                    </Button>,
                    <Button key="close" onClick={() => setDetailModalOpen(false)}>Đóng</Button>,
                ]}
                width={600}
            >
                {selectedRecord && (
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Họ tên:</Text>
                                <div><Text strong>{selectedRecord.customerName}</Text></div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Số điện thoại:</Text>
                                <div><Text strong>{selectedRecord.phone}</Text></div>
                            </Col>
                        </Row>
                        {selectedRecord.email && (
                            <Row>
                                <Col span={24}>
                                    <Text type="secondary">Email:</Text>
                                    <div><Text>{selectedRecord.email}</Text></div>
                                </Col>
                            </Row>
                        )}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Dịch vụ quan tâm:</Text>
                                <div>{selectedRecord.serviceInterest
                                    ? <Tag color="purple">{selectedRecord.serviceInterest}</Tag>
                                    : <Text type="secondary">Không rõ</Text>}
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Thời gian có thể:</Text>
                                <div><Text>{selectedRecord.preferredDate || '—'}</Text></div>
                            </Col>
                        </Row>
                        <div>
                            <Text type="secondary">Nội dung tư vấn:</Text>
                            <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 8, marginTop: 4 }}>
                                <Text>{selectedRecord.concern}</Text>
                            </div>
                        </div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Trạng thái:</Text>
                                <div>
                                    {(() => {
                                        const meta = STATUS_META[selectedRecord.status];
                                        return <Tag color={meta?.color} icon={meta?.icon}>{meta?.label}</Tag>;
                                    })()}
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Nhân viên phụ trách:</Text>
                                <div><Text>{selectedRecord.assignedStaff || '—'}</Text></div>
                            </Col>
                        </Row>
                        {selectedRecord.adminNotes && (
                            <div>
                                <Text type="secondary">Ghi chú admin:</Text>
                                <div style={{ background: '#fffbe6', padding: 12, borderRadius: 8, marginTop: 4 }}>
                                    <Text>{selectedRecord.adminNotes}</Text>
                                </div>
                            </div>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Gửi lúc: {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm')} — Nguồn: {selectedRecord.source}
                        </Text>
                    </Space>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Cập nhật yêu cầu tư vấn"
                open={editModalOpen}
                onOk={handleSave}
                onCancel={() => setEditModalOpen(false)}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={submitting}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                        <Select>
                            {Object.entries(STATUS_META).map(([key, meta]) => (
                                <Option key={key} value={key}>
                                    <Tag color={meta.color}>{meta.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="assignedStaff" label="Nhân viên phụ trách">
                        <Input placeholder="Tên nhân viên phụ trách" prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="adminNotes" label="Ghi chú nội bộ">
                        <TextArea rows={3} placeholder="Ghi chú về quá trình xử lý..." />
                    </Form.Item>
                </Form>
            </Modal>

            <style>{`
                .pending-row { background: #fffbe6 !important; }
                .ant-table-row.pending-row:hover td { background: #fff8d0 !important; }
            `}</style>
        </div>
    );
};

export default ConsultationManager;
