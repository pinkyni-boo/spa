import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, AutoComplete, Button, App, Tag } from 'antd';
import dayjs from 'dayjs';
import { adminBookingService } from '../../../services/adminBookingService';
import { resourceService } from '../../../services/resourceService';

const { Option } = Select;

// Max time slot: 19:30 (service can run until 20:30 at latest)
const TIME_SLOTS = [];
for (let i = 9; i <= 19; i++) {
    TIME_SLOTS.push(String(i).padStart(2, '0') + ':00');
    if (i !== 19) TIME_SLOTS.push(String(i).padStart(2, '0') + ':30');
}
TIME_SLOTS.push('19:30');

// Closing time = 20:30 in minutes from midnight
const CLOSING_MINUTES = 20 * 60 + 30;

const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const disabledDate = (current) => {
    const today = dayjs().startOf('day');
    const tomorrow = dayjs().startOf('day').add(1, 'day');
    return current < today || current > tomorrow.endOf('day');
};

const BookingCreateModal = ({ visible, onCancel, onCreate, branchId }) => {
    const [form] = Form.useForm();
    const [serviceList, setServiceList] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [timeOverrun, setTimeOverrun] = useState(false);
    const { message } = App.useApp();

    useEffect(() => {
        if (visible) {
            resourceService.getAllServices('service').then(data => {
                const raw = data.services || data.data || (Array.isArray(data) ? data : []);
                setServiceList(raw.filter(s => s.type === 'service'));
            });
        } else {
            form.resetFields();
            setTimeOverrun(false);
        }
    }, [visible, form]);

    const checkTimeOverrun = (timeVal, svcName) => {
        const t = timeVal || form.getFieldValue('time');
        const s = svcName || form.getFieldValue('serviceName');
        if (!t || !s) return false;
        const svc = serviceList.find(x => x.name === s);
        if (!svc?.duration) return false;
        const startMin = timeToMinutes(t);
        const endMin = startMin + svc.duration;
        if (endMin > CLOSING_MINUTES) {
            const endH = String(Math.floor(endMin / 60)).padStart(2, '0');
            const endM = String(endMin % 60).padStart(2, '0');
            message.error(
                `Dịch vụ "${svc.name}" (${svc.duration} phút) đặt lúc ${t} sẽ kết thúc lúc ${endH}:${endM}, vượt giờ làm việc (20:30). Vui lòng chọn giờ sớm hơn.`,
                6
            );
            setTimeOverrun(true);
            return true;
        }
        setTimeOverrun(false);
        return false;
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (checkTimeOverrun(values.time, values.serviceName)) return;
            const selectedService = serviceList.find(s => s.name === values.serviceName);
            onCreate({ ...values, serviceId: selectedService?._id || undefined });
            form.resetFields();
        } catch {
            // validation errors shown by Ant Design
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
                                                    {c.totalVisits > 5 && <Tag color="gold" style={{ marginLeft: 5 }}>VIP</Tag>}
                                                </span>
                                                <span style={{ color: '#888' }}>{c.phone}</span>
                                            </div>
                                        ),
                                        customer: c
                                    })));
                                }
                            }
                        }}
                        onSelect={(_value, option) => {
                            form.setFieldsValue({ customerName: option.customer.name });
                            message.success('Đã chọn: ' + option.customer.name + ' (' + option.customer.totalVisits + ' lần ghé)');
                        }}
                        options={customerOptions}
                    />
                </Form.Item>

                <Form.Item label="Tên" name="customerName" rules={[{ required: true, message: 'Nhập tên khách' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Dịch vụ" name="serviceName" rules={[{ required: true, message: 'Chọn dịch vụ' }]}>
                    <Select showSearch placeholder="Chọn dịch vụ" onChange={(val) => checkTimeOverrun(null, val)}>
                        {serviceList.map(s => <Option key={s._id} value={s.name}>{s.name}</Option>)}
                    </Select>
                </Form.Item>

                <Form.Item label="Ngày" name="date" rules={[{ required: true, message: 'Chọn ngày' }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Ngày dịch vụ" disabledDate={disabledDate} />
                </Form.Item>

                <Form.Item label="Giờ" name="time" rules={[{ required: true, message: 'Chọn giờ' }]}>
                    <Select placeholder="Chọn giờ" onChange={(val) => checkTimeOverrun(val, null)}>
                        {TIME_SLOTS.map(t => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                </Form.Item>

                <Button type="primary" htmlType="submit" block disabled={timeOverrun} style={timeOverrun ? {} : { background: '#D4AF37', borderColor: '#D4AF37' }}>
                    TẠO ĐƠN
                </Button>
            </Form>
        </Modal>
    );
};

export default BookingCreateModal;