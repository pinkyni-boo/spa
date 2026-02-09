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
    PictureOutlined,
    SmileOutlined // [NEW] For Customers
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
        // GROUP 1: VẬN HÀNH (Daily Operations - Việc hàng ngày)
        {
            key: 'grp_operation',
            label: 'Vận Hành',
            type: 'group', // Use AntD Group type for cleaner look, or SubMenu
            children: [
                {
                    key: '/admin/bookings',
                    icon: <CalendarOutlined />, // Moved icon here
                    label: 'Đặt Lịch (Booking)',
                },
                {
                    key: '/admin/rooms',
                    icon: <HomeOutlined />,
                    label: 'Sơ Đồ Phòng',
                },
                // { key: '/admin/waitlist', icon: <ClockCircleOutlined />, label: 'Hàng Chờ' }, // Future
            ]
        },
        // GROUP 2: QUẢN LÝ (Management - Cài đặt tài nguyên)
        {
            key: 'grp_management', 
            label: 'Quản Lý',
            type: 'group',
            children: [
                {
                    key: '/admin/services',
                    icon: <SkinOutlined />,
                    label: 'Dịch Vụ',
                },
                {
                    key: '/admin/staff',
                    icon: <UserOutlined />,
                    label: 'Nhân Viên',
                },
                {
                    key: '/admin/customers',
                    icon: <SmileOutlined />, // Changed icon
                    label: 'Khách Hàng',
                },
                {
                    key: '/admin/products',
                    icon: <ShopOutlined />,
                    label: 'Sản Phẩm',
                },
                {
                    key: '/admin/promotions',
                    icon: <GiftOutlined />,
                    label: 'Khuyến Mãi (Voucher)',
                },
                {
                    key: '/admin/gallery', // [RESTORED]
                    icon: <PictureOutlined />,
                    label: 'Thư Viện Ảnh',
                },
            ]
        },
        // GROUP 3: HỆ THỐNG (System - Cấu hình cao cấp)
        {
            key: 'grp_system',
            label: 'Hệ Thống',
            type: 'group',
            children: [
                {
                    key: '/admin/reports',
                    icon: <PieChartOutlined />,
                    label: 'Báo Cáo',
                },
                {
                    key: '/admin/branches',
                    icon: <ShopOutlined />,
                    label: 'Chi Nhánh',
                },
                {
                    key: '/admin/accounts',
                    icon: <SafetyCertificateOutlined />,
                    label: 'Tài Khoản',
                },
                {
                    key: '/admin/feedbacks',
                    icon: <MessageOutlined />,
                    label: 'Phản Hồi',
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
