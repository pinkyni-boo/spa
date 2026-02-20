import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Table, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, message, Popconfirm, Space, Switch, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, PercentageOutlined, DollarOutlined } from '@ant-design/icons';
import { promotionService } from '../../../services/promotionService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const PromotionManager = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [form] = Form.useForm();

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await promotionService.getAllPromotions();
            if (response.success) {
                setPromotions(response.promotions);
            }
        } catch (error) {
            message.error('Không thể tải danh sách khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreate = () => {
        setEditingPromotion(null);
        form.resetFields();
        form.setFieldsValue({
            type: 'percentage',
            status: 'active',
            perUserLimit: 1,
            minOrderValue: 0,
            isFlashSale: false
        });
        setModalVisible(true);
    };

    const handleEdit = (promotion) => {
        setEditingPromotion(promotion);
        form.setFieldsValue({
            ...promotion,
            dateRange: [dayjs(promotion.startDate), dayjs(promotion.endDate)]
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await promotionService.deletePromotion(id);
            if (response.success) {
                message.success('Đã vô hiệu hóa khuyến mãi');
                fetchPromotions();
            }
        } catch (error) {
            message.error('Không thể xóa khuyến mãi');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const promotionData = {
                ...values,
                startDate: values.dateRange[0].toDate(),
                endDate: values.dateRange[1].toDate()
            };
            delete promotionData.dateRange;

            const response = editingPromotion
                ? await promotionService.updatePromotion(editingPromotion._id, promotionData)
                : await promotionService.createPromotion(promotionData);

            if (response.success) {
                message.success(editingPromotion ? 'Cập nhật thành công' : 'Tạo khuyến mãi thành công');
                setModalVisible(false);
                fetchPromotions();
            } else {
                // [DEBUG] Show backend error if available
                message.error(response.message || response.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('[FRONTEND] Error:', error); // [DEBUG]
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Mã',
            dataIndex: 'code',
            key: 'code',
            render: (code, record) => (
                <Space>
                    <Text strong style={{ fontFamily: 'monospace' }}>{code}</Text>
                    {record.isFlashSale && (
                        <Tag icon={<ThunderboltOutlined />} color="red">FLASH SALE</Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            render: (_, record) => (
                <Tag color="green" icon={record.type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />}>
                    {record.type === 'percentage' ? `${record.value}%` : `${record.value.toLocaleString()} VNĐ`}
                </Tag>
            )
        },
        {
            title: 'Thời gian',
            key: 'period',
            render: (_, record) => (
                <div>
                    <div>{dayjs(record.startDate).format('DD/MM/YYYY')}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>đến {dayjs(record.endDate).format('DD/MM/YYYY')}</div>
                </div>
            )
        },
        {
            title: 'Sử dụng',
            key: 'usage',
            render: (_, record) => (
                <div>
                    <Text>{record.usageCount}</Text>
                    {record.usageLimit && (
                        <Text type="secondary"> / {record.usageLimit}</Text>
                    )}
                    {record.isFlashSale && record.flashSaleStock !== null && (
                        <div style={{ fontSize: 12, color: '#ff4d4f' }}>
                            Còn: {record.flashSaleStock}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    active: 'green',
                    inactive: 'default',
                    expired: 'red'
                };
                const labels = {
                    active: 'Hoạt động',
                    inactive: 'Tạm dừng',
                    expired: 'Hết hạn'
                };
                return <Tag color={colors[status]}>{labels[status]}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Vô hiệu hóa khuyến mãi?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>🎁 Quản Lý Ưu Đãi</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        style={{ background: '#D4Af37', borderColor: '#D4Af37' }}
                    >
                        Tạo Khuyến Mãi
                    </Button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={promotions}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'white', borderRadius: 12 }}
                />

                {/* Create/Edit Modal */}
                <Modal
                    title={editingPromotion ? 'Sửa Khuyến Mãi' : 'Tạo Khuyến Mãi Mới'}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onOk={() => form.submit()}
                    okText={editingPromotion ? 'Cập nhật' : 'Tạo'}
                    cancelText="Hủy"
                    width={700}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="code"
                                    label="Mã Khuyến Mãi"
                                    rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                                >
                                    <Input placeholder="SUMMER2024" style={{ textTransform: 'uppercase' }} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Tên Hiển Thị"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                >
                                    <Input placeholder="Giảm giá mùa hè" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="type"
                                    label="Loại Giảm Giá"
                                    rules={[{ required: true }]}
                                >
                                    <Select>
                                        <Select.Option value="percentage">Phần trăm (%)</Select.Option>
                                        <Select.Option value="fixed">Số tiền cố định</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="value"
                                    label="Giá Trị"
                                    rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="status"
                                    label="Trạng Thái"
                                >
                                    <Select>
                                        <Select.Option value="active">Hoạt động</Select.Option>
                                        <Select.Option value="inactive">Tạm dừng</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="dateRange"
                            label="Thời Gian Hiệu Lực"
                            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                        >
                            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="usageLimit"
                                    label="Giới Hạn Tổng"
                                    tooltip="Để trống = không giới hạn"
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} placeholder="Không giới hạn" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="perUserLimit"
                                    label="Giới Hạn/Khách"
                                >
                                    <InputNumber min={1} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="minOrderValue"
                                    label="Đơn Tối Thiểu"
                                >
                                    <InputNumber min={0} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="isFlashSale"
                            label="Flash Sale"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.isFlashSale !== currentValues.isFlashSale}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('isFlashSale') ? (
                                    <Form.Item
                                        name="flashSaleStock"
                                        label="Số Lượng Flash Sale"
                                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                                    >
                                        <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                ) : null
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default PromotionManager;
