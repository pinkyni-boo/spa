import React, { useState } from 'react';
import theme from '../../theme';

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);

  const contactItems = [
    {
      icon: 'call',
      label: 'Hotline',
      value: '0987 654 321',
      href: 'tel:+84987654321',
      color: theme.colors.primary[400]
    },
    {
      icon: 'chat',
      label: 'Zalo',
      value: 'Miu Spa',
      href: 'https://zalo.me/0987654321',
      color: '#0068FF'
    },
    {
      icon: 'facebook',
      label: 'Facebook',
      value: 'Miu Spa Center',
      href: 'https://facebook.com/miuspa',
      color: '#1877F2',
      isBrand: true
    }
  ];

  return (
    <>
      {/* CSS Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5); }
          70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }

        .contact-btn:hover .phone-icon {
          animation: shake 0.5s ease-in-out;
        }

        .contact-btn {
          animation: pulse 2s infinite;
        }

        .contact-item:hover {
          transform: translateX(-5px);
          background: ${theme.colors.primary[50]} !important;
        }
      `}</style>

      {/* Container */}
      <div style={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12
      }}>
        
        {/* Contact Options Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          transition: 'all 0.3s ease',
          marginBottom: 8
        }}>
          {contactItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="contact-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                background: theme.colors.neutral[50],
                borderRadius: 50,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                border: `1px solid ${theme.colors.neutral[200]}`
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.isBrand ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ) : (
                  <span className="material-symbols-outlined" style={{ 
                    fontSize: 20, 
                    color: 'white' 
                  }}>
                    {item.icon}
                  </span>
                )}
              </div>
              
              {/* Text */}
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 11,
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fonts.body,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 14,
                  color: theme.colors.neutral[800],
                  fontFamily: theme.fonts.body,
                  fontWeight: 600
                }}>
                  {item.value}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Main Button */}
        <button
          className="contact-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[500]} 100%)`,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          <span 
            className="material-symbols-outlined phone-icon" 
            style={{ 
              fontSize: 28, 
              color: 'white',
              transition: 'transform 0.3s ease',
              transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)'
            }}
          >
            {isOpen ? 'close' : 'call'}
          </span>
        </button>
      </div>
    </>
  );
};

export default Contact;
