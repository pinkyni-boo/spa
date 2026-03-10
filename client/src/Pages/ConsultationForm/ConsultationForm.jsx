import React, { useState, useEffect } from 'react';
import {
    Form, Input, Select, Button, Card, Typography, App,
    Row, Col, Result, Space
} from 'antd';
import {
    PhoneOutlined, UserOutlined, MessageOutlined,
    CalendarOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api.js';
import { getCachedBranches, hasBranchesCache, loadBranches } from '../../services/publicBranchService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ConsultationForm = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [branches, setBranches] = useState(() => getCachedBranches());
    const [branchesLoading, setBranchesLoading] = useState(() => !hasBranchesCache());
    const [services, setServices] = useState([]);

    useEffect(() => {
        let mounted = true;

        loadBranches()
            .then((nextBranches) => {
                if (!mounted) return;
                setBranches(nextBranches);
            })
            .catch(() => {})
            .finally(() => {
                if (mounted) setBranchesLoading(false);
            });

        // Lấy danh sách dịch vụ
        fetch(`${API_URL}/api/services?type=service`)
            .then(r => r.json())
            .then(d => { if (d.success) setServices(d.services || []); })
            .catch(() => {});

        return () => {
            mounted = false;
        };
    }, []);

    // Unique categories from services
    const categories = [...new Set(services.map(s => s.category).filter(c => c && c !== 'Other'))].sort();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/consultations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, source: 'website' }),
            });
            const data = await res.json();
            if (data.success) {
                message.open({
                    type: 'success',
                    content: 'Gửi yêu cầu tư vấn thành công!',
                    duration: 1.5,
                });
                setTimeout(() => setSubmitted(true), 250);
            } else {
                const detail = Array.isArray(data.errors) && data.errors.length
                    ? data.errors.join(' | ')
                    : (data.message || 'Gửi thất bại. Vui lòng thử lại.');
                message.error(detail);
            }
        } catch (e) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh', background: 'linear-gradient(135deg, #f5e6c8 0%, #fff9f0 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
            }}>
                <Result
                    icon={<CheckCircleOutlined style={{ color: '#D4AF37' }} />}
                    title="Yêu cầu đã được gửi!"
                    subTitle="Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất (trong vòng 24 giờ)."
                    extra={[
                        <Button
                            key="back"
                            type="primary"
                            style={{ background: '#D4AF37', borderColor: '#D4AF37' }}
                            onClick={() => { form.resetFields(); setSubmitted(false); }}
                        >
                            Gửi yêu cầu khác
                        </Button>,
                        <Button key="home" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5e6c8 0%, #fff9f0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 16px',
        }}>
            <Card
                className="light-form"
                style={{
                    width: '100%', maxWidth: 580,
                    borderRadius: 16, boxShadow: '0 8px 32px rgba(212,175,55,0.15)',
                    border: '1px solid #f0e0b0',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>✨</div>
                    <Title level={2} style={{ margin: 0, color: '#8B6914', fontFamily: "'Playfair Display', serif" }}>
                        Đặt Lịch Tư Vấn
                    </Title>
                    <Text type="secondary">
                        Để lại thông tin — chuyên viên của chúng tôi sẽ liên hệ tư vấn miễn phí
                    </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="customerName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#D4AF37' }} />}

                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                    { pattern: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' },
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined style={{ color: '#D4AF37' }} />}
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="email" label="Email (không bắt buộc)">
                        <Input placeholder="example@email.com" size="large" />
                    </Form.Item>

                    <Form.Item name="serviceInterest" label="Dịch vụ quan tâm">
                        <Select placeholder="Chọn dịch vụ hoặc nhóm dịch vụ" size="large" allowClear>
                            {categories.map(cat => (
                                <Option key={cat} value={cat}>{cat}</Option>
                            ))}
                            {services.map(s => (
                                <Option key={s._id} value={s.name}>{s.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="preferredDate" label="Thời gian thuận tiện">
                        <Select placeholder="Chọn thời gian" size="large" allowClear>
                            <Option value="Sáng trong tuần (8h-12h)">Sáng trong tuần (8h–12h)</Option>
                            <Option value="Chiều trong tuần (13h-17h)">Chiều trong tuần (13h–17h)</Option>
                            <Option value="Tối trong tuần (17h-20h)">Tối trong tuần (17h–20h)</Option>
                            <Option value="Cuối tuần sáng">Cuối tuần — Sáng</Option>
                            <Option value="Cuối tuần chiều">Cuối tuần — Chiều</Option>
                            <Option value="Linh hoạt">Linh hoạt, bất kỳ lúc nào</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="preferredBranch" label="Chi nhánh gần nhất">
                        <Select
                            size="large"
                            allowClear
                            loading={branchesLoading}
                            placeholder={
                                branchesLoading
                                    ? 'Đang tải chi nhánh...'
                                    : branches.length > 0
                                    ? 'Chọn chi nhánh'
                                    : 'Chưa có chi nhánh'
                            }
                            disabled={branchesLoading || branches.length === 0}
                        >
                            {branches.map(b => (
                                <Option key={b._id} value={b._id}>{b.name} — {b.address}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="concern"
                        label="Nội dung cần tư vấn"
                        rules={[
                            { required: true, message: 'Vui lòng mô tả vấn đề cần tư vấn' },
                            { min: 5, message: 'Nội dung tư vấn tối thiểu 5 ký tự' },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #D4AF37, #f0c84a)',
                                border: 'none',
                                height: 50,
                                fontSize: 16,
                                fontWeight: 600,
                                borderRadius: 8,
                            }}
                        >
                            <MessageOutlined /> Gửi Yêu Cầu Tư Vấn
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        🔒 Thông tin của bạn được bảo mật hoàn toàn
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default ConsultationForm;
