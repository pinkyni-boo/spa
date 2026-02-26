import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, AutoComplete, Button, App, Tag } from 'antd';
import { adminBookingService } from '../../../services/adminBookingService';

const { Option } = Select;

// Time slots 09:00–21:00 (zero-padded to match HH:mm Joi pattern)
const TIME_SLOTS = [];
for (let i = 9; i <= 21; i++) { TIME_SLOTS.push(`${String(i).padStart(2,'0')}:00`); if(i!==21) TIME_SLOTS.push(`${String(i).padStart(2,'0')}:30`); }

const BookingCreateModal = ({ visible, onCancel, onCreate }) => {
    const [form] = Form.useForm();
    const [customerOptions, setCustomerOptions] = useState([]);
    // Store full service objects { _id, name } to send serviceId to server
    const [serviceList, setServiceList] = useState([]);
    const { message } = App.useApp();

    useEffect(() => {
        if (!visible) return;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        fetch(`${API_URL}/api/services`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(r => r.json())
            .then(data => {
                const raw = data.services || data.data || (Array.isArray(data) ? data : []);
                const list = raw.filter(s => s.type === 'service');
                setServiceList(list);
            })
            .catch(() => {});
    }, [visible]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Find serviceId from the selected service name
            const selectedService = serviceList.find(s => s.name === values.serviceName);
            onCreate({
                ...values,
                serviceId: selectedService?._id || undefined
            });
            form.resetFields();
        } catch {
            // validation error handled by Ant Design form
        }
    };

    return (
        <Modal
            title="Tạo Đơn Đặt Lịch Mới"
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnHidden
            className="booking-create-modal"
        >
             <Form form={form} onFinish={handleSubmit} layout="vertical">
                {/* CUSTOMER SEARCH (CRM) */}
                <Form.Item label="SĐT" name="phone">
                    <AutoComplete
                        placeholder="Nhập SĐT để tìm khách quen (tùy chọn)..."
                        onSearch={async (value) => {
                            if (value.length > 2) {
                                const res = await adminBookingService.searchCustomers(value);
                                if (res.success) {
                                    setCustomerOptions(res.customers.map(c => ({
                                        value: c.phone,
                                        label: (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>
                                                    <strong>{c.name}</strong>
                                                    {c.totalVisits > 5 && <Tag color="gold" style={{marginLeft: 5}}>VIP</Tag>}
                                                </span>
                                                <span style={{ color: '#888' }}>{c.phone}</span>
                                            </div>
                                        ),
                                        customer: c
                                    })));
                                }
                            }
                        }}
                        onSelect={(value, option) => {
                            form.setFieldsValue({ customerName: option.customer.name });
                            message.success(`Đã chọn: ${option.customer.name} (${option.customer.totalVisits} lần ghé)`);
                        }}
                        options={customerOptions}
                    />
                </Form.Item>

                <Form.Item label="Tên" name="customerName" rules={[{ required: true, message: 'Nhập tên khách' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Dịch vụ" name="serviceName" rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
                    <Select showSearch placeholder="Chọn dịch vụ">
                        {serviceList.map(s => <Option key={s._id} value={s.name}>{s.name}</Option>)}
                    </Select>
                </Form.Item>

                <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày dịch vụ" />
                </Form.Item>

                <Form.Item label="Giờ" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                    <Select placeholder="Chọn giờ">
                        {TIME_SLOTS.map(t => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" block style={{ background: '#D4AF37', borderColor: '#D4AF37' }}>
                    TẠO ĐƠN
                </Button>
             </Form>
        </Modal>
    );
};

export default BookingCreateModal;
