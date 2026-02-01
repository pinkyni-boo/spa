import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Space, Divider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    CalendarOutlined,
    HomeOutlined,
    UserOutlined,
    SkinOutlined,
    ShopOutlined,
    EnvironmentOutlined,
    GiftOutlined,
    MessageOutlined,
    PieChartOutlined,
    SafetyCertificateOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined,
    PictureOutlined // [NEW]
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Load user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Failed to parse user data', e);
            }
        }
    }, []);

    const menuItems = [
        {
            key: '/admin/accounts',
            icon: <SafetyCertificateOutlined />,
            label: 'Tài Khoản',
            // Role check logic would hide this for non-owners later
        },
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng Quan',
        },
        {
            key: '/admin/bookings',
            icon: <CalendarOutlined />,
            label: 'Đặt Lịch',
        },
        {
            key: '/admin/rooms',
            icon: <HomeOutlined />,
            label: 'Phòng',
        },
        {
            key: '/admin/staff',
            icon: <UserOutlined />,
            label: 'Nhân Viên',
        },
        {
            key: '/admin/services',
            icon: <SkinOutlined />,
            label: 'Dịch Vụ',
        },
        {
            key: '/admin/branches',
            icon: <EnvironmentOutlined />,
            label: 'Chi Nhánh',
        },
        {
            key: '/admin/promotions',
            icon: <GiftOutlined />,
            label: 'Ưu Đãi',
        },
        {
            key: '/admin/feedbacks',
            icon: <MessageOutlined />,
            label: 'Feedback',
        },
        {
            key: '/admin/reports',
            icon: <PieChartOutlined />,
            label: 'Báo Cáo',
        },
        {
            key: '/admin/customers',
            icon: <UserOutlined />,
            label: 'Lịch Sử Khách',
        },
        {
            key: '/admin/products',
            icon: <ShopOutlined />,
            label: 'Sản Phẩm',
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
        // Mobile auto-close logic could go here if managed by parent
        if (window.innerWidth < 768) {
             setCollapsed(true);
        }
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            collapsedWidth="80"
            width={250}
            style={{
                height: '100vh',
                position: 'sticky',
                top: 0,
                left: 0,
                background: '#fff',
                borderRight: '1px solid #f0f0f0',
                zIndex: 1000,
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
            }}
        >
            {/* Logo Area & Toggle */}
            <div style={{ 
                height: 64, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: collapsed ? 'center' : 'space-between',
                padding: collapsed ? 0 : '0 16px 0 24px',
                borderBottom: '1px solid #f0f0f0',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
            }}>
                {collapsed ? (
                    <Button 
                        type="text" 
                        icon={<MenuUnfoldOutlined />} 
                        onClick={() => setCollapsed(false)}
                        style={{ color: '#D4Af37' }}
                    />
                ) : (
                    <>
                        <Title level={4} style={{ margin: 0, color: '#D4Af37', fontFamily: "'Playfair Display', serif" }}>
                            MIU SPA
                        </Title>
                        <Button 
                            type="text" 
                            icon={<MenuFoldOutlined />} 
                            onClick={() => setCollapsed(true)}
                            style={{ color: '#999' }}
                        />
                    </>
                )}
            </div>

            {/* Menu */}
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ borderRight: 0, marginTop: 10 }}
                theme="light"
            />
            
            {/* Footer / User Info & Logout */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #f0f0f0',
                background: '#fafafa',
                padding: collapsed ? '12px 0' : '12px 16px'
            }}>
                {!collapsed && currentUser && (
                    <div style={{ marginBottom: 8 }}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Avatar 
                                    style={{ backgroundColor: currentUser.role === 'owner' ? '#D4Af37' : '#52c41a' }}
                                    icon={<UserOutlined />}
                                    size="small"
                                />
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#262626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {currentUser.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                        {currentUser.role === 'owner' ? '👑 OWNER' : '🔑 ADMIN'}
                                    </div>
                                </div>
                            </div>
                        </Space>
                    </div>
                )}
                <Button 
                    type="text" 
                    icon={<LogoutOutlined />}
                    danger
                    block={!collapsed}
                    onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                        window.location.reload(); // Force reload to clear state
                    }}
                    style={{ 
                        width: collapsed ? '100%' : 'auto',
                        justifyContent: collapsed ? 'center' : 'flex-start'
                    }}
                >
                    {!collapsed && 'Đăng xuất'}
                </Button>
            </div>
        </Sider>
    );
};

export default AdminSidebar;
