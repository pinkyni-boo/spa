import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, AutoComplete, Button, message, Tag } from 'antd';
import { adminBookingService } from '../../../services/adminBookingService';

const { Option } = Select;

// Constants from original file
const SERVICES_LIST = ["Massage Body Thụy Điển", "Chăm sóc da mặt chuyên sâu", "Gội đầu dưỡng sinh"];
const TIME_SLOTS = [];
for (let i = 9; i <= 18; i++) { TIME_SLOTS.push(`${i}:00`); if(i!==18) TIME_SLOTS.push(`${i}:30`); }

const BookingCreateModal = ({ visible, onCancel, onCreate }) => {
    const [form] = Form.useForm();
    const [customerOptions, setCustomerOptions] = useState([]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onCreate(values);
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
            destroyOnClose
            className="booking-create-modal" // Keep class for style hook
        >
             <Form form={form} onFinish={handleSubmit} layout="vertical">
                {/* CUSTOMER SEARCH (CRM) */}
                <Form.Item label="SĐT" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                    <AutoComplete
                        placeholder="Nhập SĐT để tìm khách quen..."
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
                                        customer: c // Keep full obj
                                    })));
                                }
                            }
                        }}
                        onSelect={(value, option) => {
                            // Autofill
                            form.setFieldsValue({ customerName: option.customer.name });
                            message.success(`Đã chọn: ${option.customer.name} (${option.customer.totalVisits} lần ghé)`);
                        }}
                        options={customerOptions}
                    />
                </Form.Item>

                <Form.Item label="Tên" name="customerName" rules={[{ required: true }]}>
                    <Input /> 
                </Form.Item>
                
                <Form.Item label="Dịch vụ" name="serviceName" rules={[{ required: true }]}>
                     <Select>{SERVICES_LIST.map(s=><Option key={s} value={s}>{s}</Option>)}</Select>
                </Form.Item>
                <Form.Item label="Ngày" name="date" rules={[{ required: true }]}><DatePicker style={{width:'100%'}}/></Form.Item>
                <Form.Item label="Giờ" name="time" rules={[{ required: true }]}>
                     <Select>{TIME_SLOTS.map(t=><Option key={t} value={t}>{t}</Option>)}</Select>
                </Form.Item>
                <Button type="primary" htmlType="submit" block>TẠO</Button>
             </Form>
        </Modal>
    );
};

export default BookingCreateModal;
