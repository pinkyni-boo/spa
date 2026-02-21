import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ShoppingCartOutlined, WarningOutlined } from '@ant-design/icons';
import theme from '../../../theme';
import { resourceService } from '../../../services/resourceService';

const { Option } = Select;

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();

    const fetchProducts = async () => {
        setLoading(true);
        // [FIX] Use resourceService like ServiceManager
        const res = await resourceService.getAllServices('product');
        if (res && res.success) {
            setProducts(res.services || []);
        } else {
            message.error("Lỗi tải sản phẩm");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa sản phẩm này?")) return;
        
        setLoading(true);
        const res = await resourceService.deleteService(id);
        if (res.success) {
            message.success('Xóa sản phẩm thành công');
            fetchProducts();
        } else {
            message.error('Lỗi khi xóa');
        }
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleSubmit = async (values) => {
        // Force type='product'
        const payload = { ...values, type: 'product', duration: 0 }; 
        // Products don't have duration -> 0

        setLoading(true);
        try {
            let res;
            if (editingProduct) {
                // Update existing product
                res = await resourceService.updateService(editingProduct._id, payload);
            } else {
                // Create new product  
                res = await resourceService.createService(payload);
            }

            if (res.success) {
                message.success(editingProduct ? "Cập nhật thành công!" : "Thêm mới thành công!");
                setIsModalVisible(false);
                fetchProducts();
            } else {
                message.error('Có lỗi xảy ra: ' + (res.message || 'Unknown'));
            }
        } catch (error) {
            console.error('Error saving product:', error);
            message.error('Lỗi khi lưu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tên Sản Phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <strong>{text}</strong>
        },
        {
            title: 'Giá Bán',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString()} đ`
        },
        {
            title: 'Danh Mục',
            dataIndex: 'category',
            key: 'category',
            render: (cat) => <Tag color="blue">{cat || 'Other'}</Tag>
        },
        {
            title: 'Tồn Kho',
            dataIndex: 'stock',
            key: 'stock',
            align: 'center',
            render: (stock, record) => {
                if (stock === null || stock === undefined) return <Tag>Không quản lý</Tag>;
                const low = stock <= (record.lowStockAlert ?? 5);
                return (
                    <Tooltip title={low ? 'Sắc cảnh báo tồn kho thấp!' : ''}>
                        <Tag color={low ? 'red' : 'green'} icon={low ? <WarningOutlined /> : null}>
                            {stock} {record.stockUnit || 'cái'}
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record._id)} />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ShoppingCartOutlined style={{ fontSize: 24, color: theme.colors.primary[500] }} />
                    <h2 style={{ margin: 0, fontFamily: theme.fonts.heading }}>Quản Lý Sản Phẩm Bán Lẻ</h2>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm Sản Phẩm
                </Button>
            </div>

            <Table 
                dataSource={products} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editingProduct ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                    
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item label="Giá (VNĐ)" name="price" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                        <Form.Item label="Danh mục" name="category" style={{ flex: 1 }}>
                            <Select>
                                <Option value="Skincare">Mỹ phẩm (Skincare)</Option>
                                <Option value="Haircare">Dầu gội (Haircare)</Option>
                                <Option value="Voucher">Voucher / Thẻ</Option>
                                <Option value="Other">Khác</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item label="Mô tả" name="description"><Input.TextArea rows={2} /></Form.Item>
                    
                    <Form.Item label="Hình ảnh (URL)" name="image"><Input placeholder="https://..." /></Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item label="Tồn kho hiện tại" name="stock" tooltip="Để trống nếu không quản lý tồn" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="Không quản lý" />
                        </Form.Item>
                        <Form.Item label="Đơn vị" name="stockUnit" style={{ flex: 1 }}>
                            <Select defaultValue="cái">
                                <Option value="cái">cái</Option>
                                <Option value="chai">chai</Option>
                                <Option value="hộp">hộp</Option>
                                <Option value="tuúp">tuúp</Option>
                                <Option value="gói">gói</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Cảnh báo khi ≤" name="lowStockAlert" tooltip="Cảnh báo khi số lượng tồn bằng hoặc nhỏ hơn mức này" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} defaultValue={5} />
                        </Form.Item>
                    </div>

                    <Button type="primary" htmlType="submit" block>
                        {editingProduct ? "Cập nhật" : "Tạo Mới"}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductManager;
