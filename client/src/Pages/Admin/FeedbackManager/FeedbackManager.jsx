import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Tag, Button, Space, Rate, Image, App, Popconfirm, Tabs, Card, Row, Col, Modal, Form, Input, Select, Upload } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, EditOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { feedbackService } from '../../../services/feedbackService';
import { galleryService } from '../../../services/galleryService'; // [NEW]
import { resourceService } from '../../../services/resourceService'; // For services list
import dayjs from 'dayjs';
import theme from '../../../theme';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const FeedbackManager = () => {
    const { message } = App.useApp();
    // --- STATE ---
    const [feedbacks, setFeedbacks] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]); // [NEW] Gallery Data
    const [services, setServices] = useState([]); // [NEW] For dropdown
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews', 'result', 'facility'

    // Modal State for Gallery
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const typeValue = Form.useWatch('type', form);

    // --- FETCH DATA ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const [fbRes, galRes, svcRes] = await Promise.all([
                feedbackService.getAllFeedbacks(),
                galleryService.getAllGalleryItems(),
                resourceService.getAllServices('service')
            ]);

            if (fbRes.success) setFeedbacks(fbRes.feedbacks);
            if (galRes.success) setGalleryItems(galRes.gallery);
            if (svcRes.success) setServices(svcRes.services);
            
        } catch (error) {
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- FEEDBACK ACTIONS ---
    const handleApprove = async (id) => {
        try {
            const response = await feedbackService.approveFeedback(id);
            if (response.success) {
                message.success('Đã duyệt feedback');
                fetchData();
            }
        } catch (error) {
            message.error('Lỗi khi duyệt');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await feedbackService.rejectFeedback(id);
            if (response.success) {
                message.success('Đã từ chối feedback');
                fetchData();
            }
        } catch (error) {
            message.error('Lỗi khi từ chối');
        }
    };

    const handleDeleteFeedback = async (id) => {
        try {
            const response = await feedbackService.deleteFeedback(id);
            if (response.success) {
                message.success('Đã xóa feedback');
                fetchData();
            }
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    // --- GALLERY ACTIONS ---
    const handleAddGallery = () => {
        setEditingItem(null);
        form.resetFields();
        // Default to the current gallery tab content, or 'result' if on reviews tab
        const defaultType = activeTab === 'reviews' ? 'result' : activeTab;
        form.setFieldsValue({ type: defaultType }); 
        setIsModalVisible(true);
    };

    const handleEditGallery = (record) => {
        setEditingItem(record);
        
        // Helper to format initial fileList for Upload component
        const getInitialFileList = (url) => url ? [{ uid: '-1', name: 'image.png', status: 'done', url }] : [];

        form.setFieldsValue({
            ...record,
            beforeImage: getInitialFileList(record.beforeImage),
            afterImage: getInitialFileList(record.afterImage),
            imageUrl: getInitialFileList(record.imageUrl)
        });
        setIsModalVisible(true);
    };

    const handleDeleteGallery = async (id) => {
        const res = await galleryService.deleteGalleryItem(id);
        if (res.success) {
            message.success("Xóa ảnh thành công");
            fetchData();
        } else {
            message.error("Lỗi khi xóa ảnh");
        }
    };

    const handleSubmitGallery = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('type', values.type);
            formData.append('description', values.description || '');
            if (values.serviceId) formData.append('serviceId', values.serviceId);

            // Helper to append file or existing URL
            const appendImage = (fieldName, fileList) => {
                if (fileList && fileList.length > 0) {
                    const file = fileList[0];
                    if (file.originFileObj) {
                        // New file uploaded
                        formData.append(fieldName, file.originFileObj);
                    } else if (file.url) {
                        // Existing URL kept
                        formData.append(fieldName, file.url);
                    }
                }
            };

            if (values.type === 'result') {
                appendImage('beforeImage', values.beforeImage);
                appendImage('afterImage', values.afterImage);
            } else {
                appendImage('imageUrl', values.imageUrl);
            }

            let res;
            if (editingItem) {
                res = await galleryService.updateGalleryItem(editingItem._id, formData);
            } else {
                res = await galleryService.createGalleryItem(formData);
            }

            if (res.success) {
                message.success(editingItem ? "Cập nhật thành công!" : "Thêm ảnh thành công!");
                setIsModalVisible(false);
                fetchData();
            } else {
                message.error("Có lỗi xảy ra: " + res.message);
            }
        } catch (error) {
            console.error(error);
            message.error("Lỗi hệ thống");
        } finally {
            setLoading(false);
        }
    };

    // Helper for Form Item to normalize file list
    const normFile = (e) => {
        if (Array.isArray(e)) return e;
        return e?.fileList;
    };

    // --- COLUMNS FOR FEEDBACK TABLE ---
    const feedbackColumns = [
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.customerName}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{record.customerPhone}</div>
                </div>
            )
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 120,
            render: (rating) => <Rate disabled value={rating} style={{ fontSize: 14 }} />
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            ellipsis: true,
            render: (comment) => <div style={{ maxWidth: 300 }}>{comment}</div>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const colors = { pending: 'orange', approved: 'green', rejected: 'red' };
                const labels = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };
                return <Tag color={colors[status]}>{labels[status]}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            width: 110,
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    {record.status === 'pending' && (
                        <>
                            <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record._id)} style={{ background: '#52c41a', borderColor: '#52c41a' }} />
                            <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleReject(record._id)} />
                        </>
                    )}
                    <Popconfirm title="Xóa?" onConfirm={() => handleDeleteFeedback(record._id)}>
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // --- RENDER GALLERY ITEMS ---
    const renderGalleryGrid = (type) => {
        const items = galleryItems.filter(i => i.type === type);
        
        if (items.length === 0) {
            return <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>Chưa có hình ảnh. <Button type="link" onClick={handleAddGallery}>Thêm ngay</Button></div>;
        }

        return (
            <Row gutter={[24, 24]}>
                {items.map(item => (
                    <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
                        <Card
                            hoverable
                            size="small"
                            cover={
                                type === 'result' ? (
                                    <div style={{ display: 'flex', height: 180, borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ flex: 1, position: 'relative', borderRight: '1px solid white' }}>
                                            <Image src={item.beforeImage} height="100%" width="100%" style={{ objectFit: 'cover' }} preview={false} />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', fontSize: 10 }}>BEFORE</div>
                                        </div>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <Image src={item.afterImage} height="100%" width="100%" style={{ objectFit: 'cover' }} preview={false}/>
                                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 6px', fontSize: 10 }}>AFTER</div>
                                        </div>
                                    </div>
                                ) : (
                                    <Image src={item.imageUrl || item.beforeImage} height={180} style={{ objectFit: 'cover' }} />
                                )
                            }
                            actions={[
                                <EditOutlined key="edit" onClick={() => handleEditGallery(item)} />,
                                <Popconfirm title="Xóa ảnh này?" onConfirm={() => handleDeleteGallery(item._id)}>
                                    <DeleteOutlined key="delete" style={{ color: 'red' }} />
                                </Popconfirm>
                            ]}
                        >
                            <Card.Meta
                                title={<div style={{ fontSize: 14 }}>{item.title}</div>}
                                description={
                                    <div style={{ fontSize: 12 }}>
                                        {item.serviceId && <div style={{ color: theme.colors.primary[500], marginBottom: 2 }}>{item.serviceId.name}</div>}
                                        <div style={{ color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</div>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                {/* ... (Header & Tabs code unchanged) ... */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>💬 Quản Lý Feedback & Hình Ảnh</Title>
                    {activeTab !== 'reviews' && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddGallery}>
                            Thêm Ảnh Mới
                        </Button>
                    )}
                </div>

                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab} 
                    style={{ background: 'white', padding: '16px 24px', borderRadius: '12px 12px 0 0' }}
                    type="card"
                >
                    <TabPane tab="⭐ Đánh Giá Khách Hàng" key="reviews">
                        <Table
                            columns={feedbackColumns}
                            dataSource={feedbacks}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                    <TabPane tab="📸 Kết Quả Điều Trị" key="result">
                        {renderGalleryGrid('result')}
                    </TabPane>
                    <TabPane tab="🏠 Không Gian Spa" key="facility">
                        {renderGalleryGrid('facility')}
                    </TabPane>
                </Tabs>

                {/* MODAL FORM FOR GALLERY */}
                <Modal
                    title={editingItem ? "Chỉnh sửa hình ảnh" : "Thêm hình ảnh mới"}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={700}
                >
                    <Form form={form} layout="vertical" onFinish={handleSubmitGallery} initialValues={{ type: 'result' }}>
                        <Form.Item name="type" label="Loại hình ảnh" rules={[{ required: true }]}>
                            <Select onChange={(val) => form.setFieldValue('type', val)}>
                                <Option value="result">Kết quả điều trị (Before/After)</Option>
                                <Option value="facility">Không gian Spa</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
                            <Input placeholder="VD: Trị mụn sau 1 liệu trình" />
                        </Form.Item>

                        <Form.Item noStyle shouldUpdate>
                            {() => (
                                form.getFieldValue('type') === 'result' ? (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item 
                                                name="beforeImage" 
                                                label="Ảnh Trước" 
                                                valuePropName="fileList" 
                                                getValueFromEvent={normFile}
                                                rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
                                            >
                                                <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                                                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                                </Upload>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item 
                                                name="afterImage" 
                                                label="Ảnh Sau" 
                                                valuePropName="fileList" 
                                                getValueFromEvent={normFile}
                                                rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
                                            >
                                                <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                                                    <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                                </Upload>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Form.Item 
                                        name="imageUrl" 
                                        label="Hình Ảnh" 
                                        valuePropName="fileList" 
                                        getValueFromEvent={normFile}
                                        rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
                                    >
                                        <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                                        </Upload>
                                    </Form.Item>
                                )
                            )}
                        </Form.Item>

                        <Form.Item noStyle shouldUpdate>
                            {() => form.getFieldValue('type') === 'result' && (
                                <Form.Item name="serviceId" label="Dịch vụ liên quan">
                                    <Select allowClear>
                                        {services.map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
                                    </Select>
                                </Form.Item>
                            )}
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả ngắn">
                            <TextArea rows={2} />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" block loading={loading}>
                            {editingItem ? "Lưu Thay Đổi" : "Tạo Mới"}
                        </Button>
                    </Form>
                </Modal>
            </div>
        </Layout>
    );
};

export default FeedbackManager;
