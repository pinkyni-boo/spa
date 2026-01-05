import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Sử dụng Link của React Router

const { Header } = Layout;
const { Title } = Typography;

const TopNavBar = () => {
  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        borderBottom: '1px solid #f5f3f0',
        padding: '0 20px',
        height: '64px'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className="material-symbols-outlined"
            style={{ color: '#D4AF37', fontSize: '24px' }}
          >
            spa
          </span>
          <Title
            level={4}
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '-0.015em',
              color: '#181611'
            }}
          >
            MIU SPA CENTER
          </Title>
        </div>

        {/* Desktop Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
          <Link to="/services" style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Services</Link>
          <Link to="#" style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Membership</Link>
          <Link to="#" style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>About</Link>
          <Link to="#" style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Contact</Link>

          <Button
            type="primary"
            style={{
              backgroundColor: '#D4AF37',
              borderColor: '#D4AF37',
              color: '#181611',
              fontWeight: 'bold',
              borderRadius: '8px',
              marginLeft: '16px'
            }}
          >
            Book Now
          </Button>
        </nav>

        {/* Mobile Menu Icon */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          className="show-mobile"
          style={{ display: 'none' }}
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}} />
    </Header>
  );
};

export default TopNavBar;