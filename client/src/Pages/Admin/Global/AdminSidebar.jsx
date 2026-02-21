import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Space, Divider, Badge, notification } from 'antd';
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
    SmileOutlined, // [OLD] For Customers
    SettingOutlined, // [NEW] For Management group
    ControlOutlined, // [NEW] For System group
    TeamOutlined, // [NEW] For Customers
    ShoppingOutlined, // [NEW] For Products
    BarChartOutlined, // [NEW] For Reports
    FileTextOutlined, // [NEW] For System Logs
    CommentOutlined,  // [NEW] For Consultations
    BellOutlined,     // [NEW] For notification
    DollarCircleOutlined // [NEW] For Invoices
} from '@ant-design/icons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const { Sider } = Layout;
const { Title } = Typography;

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const prevCountRef = useRef(null);
    const [notifApi, notifHolder] = notification.useNotification();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
        }
    }, []);

    // Poll pending consultations every 10s
    useEffect(() => {
        const fetchPending = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/api/consultations?status=pending&limit=1`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    const count = data.total || 0;
                    // Notify if count increased
                    if (prevCountRef.current !== null && count > prevCountRef.current) {
                        const diff = count - prevCountRef.current;
                        notifApi.info({
                            message: 'Tư vấn mới!',
                            description: `Có ${diff} yêu cầu tư vấn mới cần xử lý.`,
                            icon: <BellOutlined style={{ color: '#D4AF37' }} />,
                            placement: 'topRight',
                            duration: 6,
                            onClick: () => navigate('/admin/consultations'),
                        });
                    }
                    prevCountRef.current = count;
                    setPendingCount(count);
                }
            } catch (_) {}
        };

        fetchPending();
        const interval = setInterval(fetchPending, 5000);

        // Listen for immediate refresh triggered by ConsultationManager
        window.addEventListener('consultation-updated', fetchPending);

        return () => {
            clearInterval(interval);
            window.removeEventListener('consultation-updated', fetchPending);
        };
    }, []);

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng Quan',
        },
        // Đặt Lịch - Flat Item (không có group)
        {
            key: '/admin/bookings',
            icon: <CalendarOutlined />,
            label: 'Đặt Lịch',
        },
        // GROUP 1: QUẢN LÝ (Management - Cài đặt tài nguyên)
        {
            key: 'grp_management', 
            label: 'Quản Lý',
            icon: <SettingOutlined />,
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
                    key: '/admin/rooms',
                    icon: <HomeOutlined />,
                    label: 'Phòng',
                },
                {
                    key: '/admin/customers',
                    icon: <TeamOutlined />,
                    label: 'Khách Hàng',
                },
                {
                    key: '/admin/products',
                    icon: <ShoppingOutlined />,
                    label: 'Sản Phẩm',
                },
                {
                    key: '/admin/consultations',
                    icon: <Badge count={pendingCount} size="small" offset={[4, -2]}><CommentOutlined /></Badge>,
                    label: (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            Tư Vấn
                            {pendingCount > 0 && (
                                <Badge count={pendingCount} size="small" style={{ backgroundColor: '#faad14' }} />
                            )}
                        </span>
                    ),
                },
                {
                    key: '/admin/promotions',
                    icon: <GiftOutlined />,
                    label: 'Khuyến Mãi',
                },
            ]
        },
        // GROUP 2: HỆ THỐNG (System - Cấu hình cao cấp)
        {
            key: 'grp_system',
            label: 'Hệ Thống',
            icon: <ControlOutlined />,
            children: [
                {
                    key: '/admin/reports',
                    icon: <BarChartOutlined />,
                    label: 'Báo Cáo',
                },
                {
                    key: '/admin/branches',
                    icon: <EnvironmentOutlined />,
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
                {
                    key: '/admin/invoices',
                    icon: <DollarCircleOutlined />,
                    label: 'Hóa Đơn',
                },
                {
                    key: '/admin/system-logs',
                    icon: <FileTextOutlined />,
                    label: 'Nhật Ký',
                },
            ]
        },
    ];

    // Accordion behavior: Only one submenu open at a time
    const [openKeys, setOpenKeys] = useState(['grp_management']); // Default open Quản Lý
    const rootSubmenuKeys = ['grp_management', 'grp_system'];

    const onOpenChange = (keys) => {
        // Find the latest opened key
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        
        // If it's not a root submenu, allow normal behavior
        if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            setOpenKeys(keys);
        } else {
            // Accordion: only allow one root submenu open
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
        <>
        {notifHolder}
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
                            <Title level={4} style={{ margin: 0, color: '#D4Af37', fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700 }}>
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
        </>
    );
};

export default AdminSidebar;
