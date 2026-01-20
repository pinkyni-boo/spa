import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Table, Button, Modal, Form, Input, Select, Tag, Popconfirm, message, Space, Row, Col } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { userService } from '../../../services/userService';
import { branchService } from '../../../services/branchService';

const { Title } = Typography;
const { Option } = Select;

const AccountManager = () => {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();
    const [role, setRole] = useState('admin');

    useEffect(() => {
        fetchUsers();
        fetchBranches();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userService.getAllUsers();
            if (res.success) setUsers(res.users);
        } catch (error) {
            message.error('Lỗi tải danh sách tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const res = await branchService.getAllBranches();
            if (res.success) setBranches(res.branches);
        } catch (error) {
            console.error('Lỗi tải chi nhánh', error);
        }
    };

    const handleCreate = () => {
        setIsEditing(false);
        setSelectedUser(null);
        form.resetFields();
        setRole('admin');
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setIsEditing(true);
        setSelectedUser(record);
        setRole(record.role);
        form.setFieldsValue({
            ...record,
            managedBranches: record.managedBranches ? record.managedBranches.map(b => b._id || b) : []
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await userService.deleteUser(id);
            message.success('Xóa tài khoản thành công');
            fetchUsers();
        } catch (error) {
            message.error('Không thể xóa tài khoản');
        }
    };

    const onFinish = async (values) => {
        try {
            if (isEditing) {
                await userService.updateUser(selectedUser._id, values);
                message.success('Cập nhật thành công');
            } else {
                await userService.createUser(values);
                message.success('Tạo tài khoản thành công');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'Tên hiển thị',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                let color = 'blue';
                let text = 'Nhân viên';
                if (role === 'owner') { color = 'gold'; text = 'OWNER (Chủ)'; }
                if (role === 'admin') { color = 'green'; text = 'ADMIN (Quản lý)'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Chi nhánh quản lý',
            dataIndex: 'managedBranches',
            key: 'managedBranches',
            render: (branches, record) => {
                if (record.role === 'owner') return <Tag color="gold">TẤT CẢ CHI NHÁNH</Tag>;
                if (!branches || branches.length === 0) return <span style={{ color: '#ccc' }}>--</span>;
                return (
                    <Space size={[0, 8]} wrap>
                        {branches.map(b => (
                            <Tag key={b._id} color="cyan">{b.name}</Tag>
                        ))}
                    </Space>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (active) => active ? <Tag color="success">Hoạt động</Tag> : <Tag color="error">Đã khóa</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record._id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Title level={2}><SafetyCertificateOutlined /> Quản Lý Tài Khoản & Phân Quyền</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
                        Tạo tài khoản mới
                    </Button>
                </div>

                <Card>
                    <Table 
                        columns={columns} 
                        dataSource={users} 
                        rowKey="_id" 
                        loading={loading}
                    />
                </Card>

                <Modal
                    title={isEditing ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="name" label="Tên hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                            <Input placeholder="VD: Nguyễn Văn A" />
                        </Form.Item>

                        <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập Username' }]}>
                            <Input placeholder="VD: admin_cn1" disabled={isEditing} />
                        </Form.Item>

                        <Form.Item 
                            name="password" 
                            label={isEditing ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"} 
                            rules={[{ required: !isEditing, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu..." />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                                    <Select onChange={(val) => setRole(val)}>
                                        <Option value="owner">OWNER (Toàn quyền)</Option>
                                        <Option value="admin">ADMIN (Quản lý chi nhánh)</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="isActive" label="Trạng thái" valuePropName="checked" initialValue={true}>
                                    <Select>
                                        <Option value={true}>Hoạt động</Option>
                                        <Option value={false}>Đã khóa</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {role === 'admin' && (
                            <Form.Item 
                                name="managedBranches" 
                                label="Chi nhánh quản lý" 
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 chi nhánh' }]}
                                help="Admin chỉ thấy dữ liệu của các chi nhánh được chọn"
                            >
                                <Select mode="multiple" placeholder="Chọn chi nhánh...">
                                    {branches.map(b => (
                                        <Option key={b._id} value={b._id}>{b.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                         
                         <Form.Item name="phone" label="Số điện thoại liên hệ">
                            <Input />
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {isEditing ? "Cập nhật" : "Tạo mới"}
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default AccountManager;
