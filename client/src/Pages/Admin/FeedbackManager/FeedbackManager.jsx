import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Tag, Button, Space, Rate, Image, message, Popconfirm, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { feedbackService } from '../../../services/feedbackService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TabPane } = Tabs;

const FeedbackManager = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await feedbackService.getAllFeedbacks();
            if (response.success) {
                setFeedbacks(response.feedbacks);
            }
        } catch (error) {
            message.error('Không thể tải danh sách feedback');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleApprove = async (id) => {
        try {
            const response = await feedbackService.approveFeedback(id);
            if (response.success) {
                message.success('Đã duyệt feedback');
                fetchFeedbacks();
            }
        } catch (error) {
            message.error('Không thể duyệt feedback');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await feedbackService.rejectFeedback(id);
            if (response.success) {
                message.success('Đã từ chối feedback');
                fetchFeedbacks();
            }
        } catch (error) {
            message.error('Không thể từ chối feedback');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await feedbackService.deleteFeedback(id);
            if (response.success) {
                message.success('Đã xóa feedback');
                fetchFeedbacks();
            }
        } catch (error) {
            message.error('Không thể xóa feedback');
        }
    };

    const columns = [
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
            render: (comment) => (
                <div style={{ maxWidth: 300 }}>{comment}</div>
            )
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            width: 100,
            render: (images) => (
                images && images.length > 0 ? (
                    <Image.PreviewGroup>
                        <Image
                            src={images[0]}
                            width={60}
                            height={60}
                            style={{ objectFit: 'cover', borderRadius: 4 }}
                        />
                        {images.length > 1 && (
                            <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                                +{images.length - 1}
                            </span>
                        )}
                    </Image.PreviewGroup>
                ) : (
                    <span style={{ color: '#999', fontSize: 12 }}>Không có</span>
                )
            )
        },
        {
            title: 'Dịch vụ',
            key: 'service',
            render: (_, record) => record.serviceId?.name || '-'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const colors = {
                    pending: 'orange',
                    approved: 'green',
                    rejected: 'red'
                };
                const labels = {
                    pending: 'Chờ duyệt',
                    approved: 'Đã duyệt',
                    rejected: 'Từ chối'
                };
                return <Tag color={colors[status]}>{labels[status]}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => handleApprove(record._id)}
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            >
                                Duyệt
                            </Button>
                            <Button
                                danger
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => handleReject(record._id)}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    {record.status === 'approved' && (
                        <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => handleReject(record._id)}
                        >
                            Hủy duyệt
                        </Button>
                    )}
                    {record.status === 'rejected' && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record._id)}
                            style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        >
                            Duyệt
                        </Button>
                    )}
                    <Popconfirm
                        title="Xóa feedback này?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const filteredFeedbacks = feedbacks.filter(fb => {
        if (activeTab === 'all') return true;
        return fb.status === activeTab;
    });

    const pendingCount = feedbacks.filter(fb => fb.status === 'pending').length;
    const approvedCount = feedbacks.filter(fb => fb.status === 'approved').length;
    const rejectedCount = feedbacks.filter(fb => fb.status === 'rejected').length;

    return (
        <Layout style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>💬 Quản Lý Feedback</Title>
                </div>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ background: 'white', padding: '16px 24px 0', borderRadius: 12 }}>
                    <TabPane tab={`Tất cả (${feedbacks.length})`} key="all" />
                    <TabPane tab={`Chờ duyệt (${pendingCount})`} key="pending" />
                    <TabPane tab={`Đã duyệt (${approvedCount})`} key="approved" />
                    <TabPane tab={`Từ chối (${rejectedCount})`} key="rejected" />
                </Tabs>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={filteredFeedbacks}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    style={{ background: 'white', borderRadius: '0 0 12px 12px' }}
                />
            </div>
        </Layout>
    );
};

export default FeedbackManager;
