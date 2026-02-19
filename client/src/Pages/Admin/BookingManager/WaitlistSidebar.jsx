import React, { useEffect, useState, useMemo } from 'react';
import { Card, Button, Typography, Tag, List, message, Input, Form, Modal, Select, Tooltip, TimePicker } from 'antd';
import { UserAddOutlined, DragOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, UserOutlined, LeftOutlined, SearchOutlined, AimOutlined } from '@ant-design/icons';
import { adminBookingService } from '../../../services/adminBookingService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

const WaitlistSidebar = ({ waitlist, setWaitlist, refreshTrigger, onDragStart, onCollapse, onHighlightRoom }) => {
    
    // UI Local State for Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    
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

    const filteredWaitlist = useMemo(() => {
        if (!waitlist) return [];
        if (!searchText.trim()) return waitlist;
        const q = searchText.toLowerCase();
        return waitlist.filter(item =>
            (item.customerName || '').toLowerCase().includes(q) ||
            (item.serviceName || '').toLowerCase().includes(q) ||
            (item.phone || '').includes(q)
        );
    }, [waitlist, searchText]);

    // last item = item cuối cùng trong danh sách gốc (mới nhất)
    const lastItemId = waitlist && waitlist.length > 0 ? waitlist[waitlist.length - 1]._id : null;

    return (
        <div style={{ padding: '16px', height: '100%', overflowY: 'auto' }}>
            <style>{`
                @keyframes waitlist-pulse {
                    0%, 100% { border-color: #faad14; box-shadow: 0 0 0 0 rgba(250,173,20,0); }
                    50% { border-color: #fa8c16; box-shadow: 0 0 0 4px rgba(250,173,20,0.35); }
                }
                .waitlist-last-item {
                    animation: waitlist-pulse 1.6s ease-in-out infinite;
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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

            {/* SEARCH BAR */}
            <Input
                placeholder="Tìm tên / dịch vụ / SĐT..."
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                allowClear
                size="small"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ marginBottom: 12 }}
            />

            {/* Custom List Rendering */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredWaitlist.map(item => (
                    <Card
                        key={item._id}
                        size="small"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className={item._id === lastItemId ? 'waitlist-last-item' : ''}
                        style={{ cursor: 'grab', borderColor: item._id === lastItemId ? '#faad14' : '#d9d9d9', userSelect: 'none' }}
                        hoverable
                    >
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <div style={{ flex: 1, minWidth: 0 }}>
                                <Text strong><UserOutlined/> {item.customerName}</Text>
                                <div style={{ fontSize: 12, color: '#888' }}>{item.serviceName} ({item.duration}p)</div>
                                {item.note && <div style={{ fontSize: 11, color: '#faad14' }}>Note: {item.note}</div>}
                                <div style={{ fontSize: 11, color: '#aaa' }}><ClockCircleOutlined/> Chờ: {dayjs(item.createdAt).fromNow(true)}</div>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 4 }}>
                                 <Tooltip title="Tìm phòng phù hợp trên lịch">
                                     <Button
                                         type="text"
                                         icon={<AimOutlined style={{ color: '#1890ff' }} />}
                                         size="small"
                                         onClick={(e) => { e.stopPropagation(); if (onHighlightRoom) onHighlightRoom(item); }}
                                     />
                                 </Tooltip>
                                 <Button 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    size="small"
                                    onClick={(e) => handleDelete(item._id, e)}
                                 />
                             </div>
                        </div>
                    </Card>
                ))}
                {filteredWaitlist.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#ccc', padding: '20px 0' }}>
                        {searchText ? 'Không tìm thấy khách phù hợp' : 'Chưa có khách chờ'}
                    </div>
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
