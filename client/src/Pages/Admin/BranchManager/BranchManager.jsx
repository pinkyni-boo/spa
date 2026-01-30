import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Card, Row, Col, Modal, Form, Input, TimePicker, Tag, message, Popconfirm, Spin, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { branchService } from '../../../services/branchService';
import { resourceService } from '../../../services/resourceService'; // [CHANGED] Use resourceService to fetch staff
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [adminUsers, setAdminUsers] = useState([]); // [NEW]
    const [form] = Form.useForm();

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const response = await branchService.getAllBranches();
            if (response.success) {
                setBranches(response.branches);
            }
        } catch (error) {
            message.error('Không thể tải danh sách chi nhánh');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const response = await resourceService.getAllStaff(); // [CHANGED] from userService.getAllUsers
            if (response.success) {
                // Filter staff with role='admin'
                const admins = response.staff.filter(s => s.role === 'admin');
                setAdminUsers(admins);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchAdmins(); // [NEW]
    }, []);

    const handleCreate = () => {
        setEditingBranch(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        form.setFieldsValue({
            ...branch,
            managerId: branch.managerId?._id || branch.managerId, // [UPDATED]
            operatingHours: branch.operatingHours ? [
                dayjs(branch.operatingHours.open, 'HH:mm'),
                dayjs(branch.operatingHours.close, 'HH:mm')
            ] : null
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await branchService.deleteBranch(id);
            if (response.success) {
                message.success('Đã vô hiệu hóa chi nhánh');
                fetchBranches();
            }
        } catch (error) {
            message.error('Không thể xóa chi nhánh');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const branchData = {
                ...values,
                operatingHours: values.operatingHours ? {
                    open: values.operatingHours[0].format('HH:mm'),
                    close: values.operatingHours[1].format('HH:mm')
                } : undefined
            };

            const response = editingBranch
                ? await branchService.updateBranch(editingBranch._id, branchData)
                : await branchService.createBranch(branchData);

            if (response.success) {
                message.success(editingBranch ? 'Cập nhật thành công' : 'Tạo chi nhánh thành công');
                setModalVisible(false);
                fetchBranches();
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>📍 Quản Lý Chi Nhánh</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        style={{ background: '#D4Af37', borderColor: '#D4Af37' }}
                    >
                        Thêm Chi Nhánh
                    </Button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {branches.map(branch => (
                            <Col xs={24} sm={12} lg={8} key={branch._id}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        border: `2px solid ${branch.status === 'active' ? '#52c41a' : '#d9d9d9'}`
                                    }}
                                    actions={[
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(branch)}
                                        >
                                            Sửa
                                        </Button>,
                                        <Popconfirm
                                            title="Vô hiệu hóa chi nhánh?"
                                            onConfirm={() => handleDelete(branch._id)}
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    ]}
                                >
                                    <div style={{ marginBottom: 16 }}>
                                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                                            {branch.name}
                                        </Title>
                                        <Tag color={branch.status === 'active' ? 'green' : 'default'}>
                                            {branch.status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'}
                                        </Tag>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        <Text>{branch.address}</Text>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                        <Text>{branch.phone}</Text>
                                    </div>

                                    {branch.email && (
                                        <div style={{ marginBottom: 8 }}>
                                            <MailOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                            <Text>{branch.email}</Text>
                                        </div>
                                    )}

                                    {branch.managerId && (
                                        <div style={{ marginTop: 12, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                            <UserOutlined style={{ marginRight: 8 }} />
                                            <Text strong>Quản lý: </Text>
                                            <Text>{branch.managerId.name}</Text>
                                            {branch.managerId.phone && (
                                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                                    ({branch.managerId.phone})
                                                </Text>
                                            )}
                                        </div>
                                    )}

                                    {branch.operatingHours && (
                                        <div style={{ marginTop: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Giờ mở cửa: {branch.operatingHours.open} - {branch.operatingHours.close}
                                            </Text>
                                        </div>
                                    )}
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Create/Edit Modal */}
                <Modal
                    title={editingBranch ? 'Sửa Chi Nhánh' : 'Thêm Chi Nhánh Mới'}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onOk={() => form.submit()}
                    okText={editingBranch ? 'Cập nhật' : 'Tạo'}
                    cancelText="Hủy"
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Tên Chi Nhánh"
                            rules={[{ required: true, message: 'Vui lòng nhập tên chi nhánh' }]}
                        >
                            <Input placeholder="VD: MIU SPA - Quận 1" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="Địa Chỉ"
                            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                        >
                            <Input.TextArea rows={2} placeholder="Địa chỉ đầy đủ" />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="phone"
                                    label="Số Điện Thoại"
                                    rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                                >
                                    <Input placeholder="0123456789" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                >
                                    <Input placeholder="branch@miuspa.com" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="operatingHours"
                            label="Giờ Hoạt Động"
                        >
                            <TimePicker.RangePicker
                                format="HH:mm"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Title level={5}>Thông Tin Quản Lý</Title>

                        <Form.Item
                            name="managerId"
                            label="Chọn Quản Lý"
                        >
                            <Select 
                                placeholder="Chọn Admin quản lý chi nhánh này"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {adminUsers.map(admin => (
                                    <Option key={admin._id} value={admin._id}>
                                        {admin.name} ({admin.phone})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default BranchManager;
