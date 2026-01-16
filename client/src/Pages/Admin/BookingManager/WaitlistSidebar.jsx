import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Tag, List, message, Input, Form, Modal, Select, Tooltip, TimePicker } from 'antd';
import { UserAddOutlined, DragOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons';
import { adminBookingService } from '../../../services/adminBookingService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

const WaitlistSidebar = ({ waitlist, setWaitlist, refreshTrigger, onDragStart, onCollapse }) => {
    
    // UI Local State for Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    
    // 1. INIT
    const fetchWaitlist = async () => {
        const res = await adminBookingService.getWaitlist();
        if(res.success) setWaitlist(res.items || []);
    };

    useEffect(() => {
        fetchWaitlist();
    }, [refreshTrigger]);

    // 2. ADD TO WAITLIST
    const handleAdd = async (values) => {
        // Format Dayjs to HH:mm string if present
        const payload = {
            ...values,
            preferredTime: values.preferredTime ? values.preferredTime.format('HH:mm') : null
        };

        const res = await adminBookingService.addToWaitlist(payload);
        if (res.success) {
            message.success('Đã thêm vào hàng chờ!');
            setIsModalVisible(false);
            form.resetFields();
            fetchWaitlist();
        } else {
            message.error('Lỗi thêm hàng chờ!');
        }
    };

    // 3. DELETE
    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent drag start when clicking delete
        if(window.confirm('Xóa khách này khỏi hàng chờ?')) {
            await adminBookingService.deleteWaitlist(id);
            fetchWaitlist();
            message.success('Đã xóa!');
        }
    };

    // 4. DRAG HANDLER
    const handleDragStart = (e, item) => {
        // Set drag data
        e.dataTransfer.setData('text/plain', JSON.stringify(item));
        e.dataTransfer.effectAllowed = 'copy';
        
        // Notify Parent
        if(onDragStart) onDragStart(item);
    };

    return (
        <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {onCollapse && (
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<LeftOutlined />} 
                            onClick={onCollapse}
                            title="Thu gọn"
                        />
                    )}
                    <Typography.Text strong style={{ fontSize: 16 }}>Hàng Chờ ({waitlist?.length || 0})</Typography.Text>
                </div>
                <Button size="small" type="primary" onClick={() => setIsModalVisible(true)} icon={<PlusOutlined />}>Thêm</Button>
            </div>

            {/* Custom List Rendering - Replaces deprecated AntD List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {waitlist && waitlist.map(item => (
                    <Card
                        key={item._id}
                        size="small"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        style={{ cursor: 'grab', borderColor: '#d9d9d9', userSelect: 'none' }}
                        hoverable
                    >
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                             <div>
                                <Text strong><UserOutlined/> {item.customerName}</Text>
                                <div style={{ fontSize: 12, color: '#888' }}>{item.serviceName} ({item.duration}p)</div>
                                {item.note && <div style={{ fontSize: 11, color: '#faad14' }}>Note: {item.note}</div>}
                                <div style={{ fontSize: 11, color: '#aaa' }}><ClockCircleOutlined/> Chờ: {dayjs(item.createdAt).fromNow(true)}</div>
                             </div>
                             <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                size="small"
                                onClick={(e) => handleDelete(item._id, e)}
                             />
                        </div>
                    </Card>
                ))}
                {(!waitlist || waitlist.length === 0) && (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '20px 0' }}>Chưa có khách chờ</div>
                )}
            </div>

            {/* MODAL ADD */}
            <Modal
                title="Thêm Khách Vào Hàng Chờ"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                className="waitlist-modal"
            >
                <style>{`
                    .waitlist-modal .ant-input, 
                    .waitlist-modal .ant-input-number-input,
                    .waitlist-modal .ant-select-selection-item,
                    .waitlist-modal .ant-select-selector {
                        color: #000000 !important;
                        background-color: #ffffff !important;
                        border: 1px solid #d9d9d9 !important;
                    }
                    .waitlist-modal textarea {
                        color: #000000 !important;
                        background-color: #ffffff !important;
                    }
                `}</style>
                <Form form={form} layout="vertical" onFinish={handleAdd}>
                    <Form.Item label="Tên khách" name="customerName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="SĐT" name="phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Dịch vụ quan tâm" name="serviceName" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Massage Body Thụy Điển">Massage Body Thụy Điển</Select.Option>
                            <Select.Option value="Chăm sóc da mặt chuyên sâu">Chăm sóc da mặt chuyên sâu</Select.Option>
                            <Select.Option value="Gội đầu dưỡng sinh">Gội đầu dưỡng sinh</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Giờ mong muốn" name="preferredTime" rules={[{ required: true, message: 'Vui lòng chọn giờ!' }]}>
                         <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="note">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Lưu vào Hàng Chờ</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default WaitlistSidebar;
