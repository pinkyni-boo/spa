import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    navigate('/admin/dashboard');
                }
            } catch (e) {
                // Invalid user data, clear it
                localStorage.removeItem('user');
            }
        }
    }, [navigate]);

    const onFinish = async (values) => {
        // Validate input
        if (!values.username || !values.password) {
            message.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            
            const data = await res.json();
            
            if (data.success) {
                message.success(`Chào mừng ${data.user.name}! 👋`);
                // Save user info (with Role and Branches)
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token); // [NEW] Save token
                navigate('/admin/dashboard');
                window.location.reload(); // Force App.jsx to re-check Auth
            } else {
                // Specific error messages
                if (data.message.includes('không tồn tại')) {
                    message.error('❌ Tài khoản không tồn tại!');
                } else if (data.message.includes('Sai mật khẩu')) {
                    message.error('❌ Mật khẩu không đúng!');
                } else if (data.message.includes('bị khóa')) {
                    message.error('🔒 Tài khoản đã bị khóa. Liên hệ quản trị viên!');
                } else {
                    message.error(data.message || 'Đăng nhập thất bại');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('⚠️ Lỗi kết nối server. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: '#f0f2f5',
            backgroundImage: 'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
            backgroundSize: 'cover'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 8 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: '#D4Af37', fontFamily: "'Playfair Display', serif" }}>MIU SPA</Title>
                    <Typography.Text type="secondary">Đăng nhập quản trị viên</Typography.Text>
                </div>
                
                <Form
                    name="login"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
