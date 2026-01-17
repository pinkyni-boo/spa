import React, { useState } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
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
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    LogoutOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
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
            
            {/* Footer / Logout */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
            }}>
                 {/* Optional: Add logout or toggle button here if needed */}
            </div>
        </Sider>
    );
};

export default AdminSidebar;
