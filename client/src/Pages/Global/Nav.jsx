import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Sử dụng Link của React Router

const { Header } = Layout;
const { Title } = Typography;

const TopNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (e, path) => {
        if (location.pathname === path) {
            e.preventDefault(); // Stop React Router from doing anything
            
            // Scroll everything possible
            const scrollOptions = { top: 0, behavior: 'smooth' };
            window.scrollTo(scrollOptions);
            document.documentElement.scrollTo(scrollOptions);
            document.body.scrollTo(scrollOptions);
            
            // Try scrolling the root and layout specifically
            const root = document.getElementById('root');
            if (root) root.scrollTo(scrollOptions);
            
            const layout = document.querySelector('.ant-layout');
            if (layout) layout.scrollTo(scrollOptions);
        }
    };

    const handleLogoClick = () => {
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
            document.body.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    }

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
        <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={handleLogoClick}
        >
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
          <Link to="/services" onClick={(e) => handleNavClick(e, '/services')} style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Services</Link>
          <Link to="/combos" onClick={(e) => handleNavClick(e, '/combos')} style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Combos</Link>
          <Link to="/incentives" onClick={(e) => handleNavClick(e, '/incentives')} style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Incentives</Link>
          <Link to="/feedback" onClick={(e) => handleNavClick(e, '/feedback')} style={{ color: '#181611', fontSize: '14px', fontWeight: 500 }}>Feedback</Link>

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