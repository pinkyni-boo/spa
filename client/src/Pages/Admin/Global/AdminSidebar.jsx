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
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng Quan',
        },
        // Core Function (Priority)
        {
            key: '/admin/bookings',
            icon: <CalendarOutlined />,
            label: 'Đặt Lịch (Booking)',
        },
        {
            type: 'divider',
        },
        // GROUP 1: VẬN HÀNH (SubMenu)
        {
            key: 'grp_operation',
            label: 'Vận Hành',
            icon: <HomeOutlined />,
            children: [
                {
                    key: '/admin/rooms',
                    label: 'Phòng & Giường',
                },
                {
                    key: '/admin/staff',
                    label: 'Nhân Viên',
                },
            ]
        },
        // GROUP 2: KINH DOANH (SubMenu)
        {
            key: 'grp_business',
            label: 'Kinh Doanh',
            icon: <ShopOutlined />,
            children: [
                {
                    key: '/admin/services',
                    label: 'Dịch Vụ',
                },
                {
                    key: '/admin/products',
                    label: 'Sản Phẩm',
                },
                {
                    key: '/admin/promotions',
                    label: 'Ưu Đãi',
                },
                {
                    key: '/admin/customers',
                    label: 'Khách Hàng',
                },
            ]
        },
        // GROUP 3: HỆ THỐNG (SubMenu)
        {
            key: 'grp_system',
            label: 'Hệ Thống',
            icon: <EnvironmentOutlined />,
            children: [
                {
                    key: '/admin/reports',
                    label: 'Báo Cáo',
                },
                {
                    key: '/admin/branches',
                    label: 'Chi Nhánh',
                },
                {
                    key: '/admin/accounts',
                    label: 'Tài Khoản',
                },
                {
                    key: '/admin/feedbacks',
                    label: 'Feedback',
                },
            ]
        },
    ];

    const [openKeys, setOpenKeys] = useState(['grp_operation']); // Default open one group
    const rootSubmenuKeys = ['grp_operation', 'grp_business', 'grp_system'];

    const onOpenChange = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const handleMenuClick = ({ key }) => {
        navigate(key);
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
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
                background: '#fff', // Restored background
                borderRight: '1px solid #f0f0f0', // Restored border
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
            }}
        >
            {/* Flex Container for Structure */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                {/* 1. Header (Flag) */}
                <div style={{ 
                    height: 64, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: collapsed ? 0 : '0 16px 0 24px',
                    borderBottom: '1px solid #f0f0f0',
                    flexShrink: 0 
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

                {/* 2. Scrollable Menu Area */}
                <div style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    overflowX: 'hidden',
                    paddingTop: 10,
                    paddingBottom: 10,
                    // Custom Scrollbar
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d9d9d9 transparent'
                }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        openKeys={openKeys}
                        onOpenChange={onOpenChange}
                        items={menuItems}
                        onClick={handleMenuClick}
                        style={{ borderRight: 0 }}
                        theme="light"
                    />
                </div>

                {/* 3. Footer (User) */}
                <div style={{
                    borderTop: '1px solid #f0f0f0',
                    background: '#fafafa',
                    padding: collapsed ? '12px 0' : '12px 16px',
                    flexShrink: 0
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
                            window.location.reload(); 
                        }}
                        style={{ 
                            width: collapsed ? '100%' : 'auto',
                            justifyContent: collapsed ? 'center' : 'flex-start'
                        }}
                    >
                        {!collapsed && 'Đăng xuất'}
                    </Button>
                </div>
            </div>
        </Sider>
    );
};

export default AdminSidebar;
