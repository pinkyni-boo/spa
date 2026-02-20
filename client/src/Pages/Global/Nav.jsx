import React, { useState } from 'react';
import { Layout, Button, Typography, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '../../component/Booking/BookingContext';

const { Header } = Layout;
const { Title } = Typography;

const NAV_LINKS = [
    { to: '/services',   label: 'Dịch Vụ' },
    { to: '/combos',     label: 'Combo' },
    { to: '/incentives', label: 'Ưu Đãi' },
    { to: '/feedback',   label: 'Phản Hồi' },
];

const TopNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { openBooking } = useBooking();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNavClick = (e, path) => {
        setMobileOpen(false);
        if (location.pathname === path) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const linkStyle = (path) => ({
        color: location.pathname === path ? '#D4AF37' : '#181611',
        fontSize: '14px',
        fontWeight: location.pathname === path ? 600 : 500,
        textDecoration: 'none',
        borderBottom: location.pathname === path ? '2px solid #D4AF37' : '2px solid transparent',
        paddingBottom: '2px',
        transition: 'all 0.2s',
    });

    return (
        <>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(6px)',
                    borderBottom: '1px solid #f0ece6',
                    padding: '0 24px',
                    height: '64px',
                    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                }}
            >
                <div style={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    {/* Logo */}
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={handleLogoClick}
                    >
                        <span className="material-symbols-outlined" style={{ color: '#D4AF37', fontSize: '26px' }}>
                            spa
                        </span>
                        <Title level={4} style={{ margin: 0, fontSize: '17px', fontWeight: 700, letterSpacing: '0.03em', color: '#181611' }}>
                            MIU SPA
                        </Title>
                    </div>

                    {/* Desktop nav */}
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="nav-desktop">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link key={to} to={to} onClick={(e) => handleNavClick(e, to)} style={linkStyle(to)}>
                                {label}
                            </Link>
                        ))}
                        <Button
                            type="primary"
                            style={{
                                backgroundColor: '#D4AF37',
                                borderColor: '#D4AF37',
                                color: '#181611',
                                fontWeight: 700,
                                borderRadius: '6px',
                                height: '36px',
                                padding: '0 20px',
                            }}
                            onClick={openBooking}
                        >
                            Đặt Lịch
                        </Button>
                    </nav>

                    {/* Mobile hamburger */}
                    <Button
                        type="text"
                        icon={<MenuOutlined style={{ fontSize: 20 }} />}
                        className="nav-mobile-btn"
                        onClick={() => setMobileOpen(true)}
                        style={{ display: 'none' }}
                    />
                </div>
            </Header>

            {/* Mobile Drawer */}
            <Drawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                placement="right"
                width={260}
                closeIcon={<CloseOutlined />}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: '#D4AF37', fontSize: '20px' }}>spa</span>
                        <span style={{ fontWeight: 700, color: '#181611' }}>MIU SPA</span>
                    </div>
                }
                styles={{ body: { padding: '16px 0' } }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {NAV_LINKS.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={(e) => handleNavClick(e, to)}
                            style={{
                                display: 'block',
                                padding: '12px 24px',
                                color: location.pathname === to ? '#D4AF37' : '#181611',
                                fontWeight: location.pathname === to ? 600 : 500,
                                fontSize: '15px',
                                background: location.pathname === to ? '#fdf8ec' : 'transparent',
                                borderLeft: location.pathname === to ? '3px solid #D4AF37' : '3px solid transparent',
                                textDecoration: 'none',
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                    <div style={{ padding: '16px 24px' }}>
                        <Button
                            type="primary"
                            block
                            style={{ backgroundColor: '#D4AF37', borderColor: '#D4AF37', color: '#181611', fontWeight: 700, height: 40 }}
                            onClick={() => { setMobileOpen(false); openBooking(); }}
                        >
                            Đặt Lịch Ngay
                        </Button>
                    </div>
                </div>
            </Drawer>

            <style>{`
                @media (max-width: 768px) {
                    .nav-desktop { display: none !important; }
                    .nav-mobile-btn { display: flex !important; }
                }
            `}</style>
        </>
    );
};

export default TopNavBar;