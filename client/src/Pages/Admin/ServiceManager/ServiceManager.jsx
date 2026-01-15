import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tag } from 'antd';
import { resourceService } from '../../../services/resourceService';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const ServiceManager = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [form] = Form.useForm();

    const fetchServices = async () => {
        setLoading(true);
        const res = await resourceService.getAllServices('service');
        if (res.success) {
            setServices(res.services);
        } else {
            message.error('Không thể tải danh sách dịch vụ');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleAdd = () => {
        setEditingService(null);
        form.resetFields();
        // Set default Break Time
        form.setFieldsValue({ breakTime: 30, duration: 60 }); 
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingService(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        const res = await resourceService.deleteService(id);
        if (res.success) {
            message.success('Xóa dịch vụ thành công');
            fetchServices();
        } else {
            message.error('Lỗi khi xóa');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            let res;
            if (editingService) {
                res = await resourceService.updateService(editingService._id, values);
            } else {
                res = await resourceService.createService(values);
            }

            if (res.success) {
                message.success(editingService ? 'Cập nhật thành công' : 'Thêm mới thành công');
                setIsModalVisible(false);
                fetchServices();
            } else {
                message.error('Có lỗi xảy ra: ' + res.message);
            }
        } catch (info) {
            console.log('Validate Failed:', info);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên Dịch Vụ',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => <Tag color="blue">{cat}</Tag>
        },
        {
            title: 'Giá (VND)',
            dataIndex: 'price',
            key: 'price',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'duration',
            key: 'duration',
            render: (val) => <Tag color="green">{val}p</Tag>
        },
        {
            title: 'Nghỉ/Dọn (phút)',
            dataIndex: 'breakTime',
            key: 'breakTime',
            render: (val) => <Tag color="orange">{val || 30}p</Tag> // Show default if missing
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record._id)}>
                         <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </div>
            ),
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{display:'flex', gap: 10, alignItems:'center'}}>
                    <h2>Quản Lý Dịch Vụ (Service Menu)</h2>
                    <Button onClick={async () => {
                        if(window.confirm('Xóa hết dịch vụ cũ và tạo mẫu mới?')) {
                            setLoading(true);
                            console.log("Sending Seed Request...");
                            
                            const res = await resourceService.seedServices();
                            console.log("Seed Response:", res);

                            if (res.success) {
                                message.success("Đã tạo lại dữ liệu mẫu!");
                                await fetchServices();
                            } else {
                                message.error("Lỗi tạo mẫu: " + (res.message || 'Unknown'));
                                console.error(res);
                            }
                            setLoading(false);
                        }
                    }}>↻ Reset Data</Button>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm Dịch Vụ
                </Button>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={services} 
                rowKey="_id" 
                loading={loading}
            />

            <Modal
                title={editingService ? "Sửa Dịch Vụ" : "Thêm Dịch Vụ Mới"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên Dịch Vụ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    
                    <Form.Item name="price" label="Giá Tiền (VND)" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item name="duration" label="Thời gian làm (phút)" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item 
                            name="breakTime" 
                            label="Thời gian Nghỉ/Dọn (phút)" 
                            rules={[{ required: true }]} 
                            style={{ flex: 1 }}
                            tooltip="Thời gian để nhân viên dọn dẹp phòng, thay ga giường trước khi đón khách tiếp theo."
                        >
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Body">Massage Body</Option>
                            <Option value="Face">Chăm sóc Face</Option>
                            <Option value="Head">Gội đầu (Head)</Option>
                            <Option value="Combo">Combo</Option>
                            <Option value="Other">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceManager;
