import React, { useState, useEffect } from 'react';
import { promotionService } from '../../services/promotionService';
import theme from '../../theme';
import dayjs from 'dayjs';

// Voucher Card Component - Thiết kế sang trọng
const VoucherCard = ({ offer, index }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      maxWidth: 600,
      height: 220,
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
      background: theme.colors.neutral[50],
      border: `1px solid ${theme.colors.primary[200]}`,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={e => { 
      e.currentTarget.style.transform = 'translateY(-6px)'; 
      e.currentTarget.style.boxShadow = '0 20px 50px rgba(212, 175, 55, 0.2)';
    }}
    onMouseOut={e => { 
      e.currentTarget.style.transform = 'none'; 
      e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.12)';
    }}
    >
      {/* Phần trái - Discount Badge */}
      <div style={{
        width: 160,
        background: `linear-gradient(145deg, ${theme.colors.primary[400]} 0%, ${theme.colors.primary[500]} 50%, ${theme.colors.primary[600]} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        color: theme.colors.neutral[50]
      }}>
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `radial-gradient(circle, ${theme.colors.neutral[50]} 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
        
        {/* Discount value */}
        <span style={{
          fontSize: 42,
          fontWeight: 'bold',
          fontFamily: theme.fonts.heading,
          lineHeight: 1,
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {offer.discount}
        </span>
        <span style={{
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 2,
          marginTop: 8,
          textTransform: 'uppercase',
          opacity: 0.9
        }}>
          {offer.discount.includes('%') ? 'GIẢM GIÁ' : 'ĐẶC BIỆT'}
        </span>
        
        {/* Code badge */}
        <div style={{
          marginTop: 16,
          padding: '6px 16px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: 1
        }}>
          {offer.code}
        </div>

        {/* Notch decorations */}
        <div style={{
          position: 'absolute',
          right: -12,
          top: 30,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: theme.colors.neutral[50]
        }} />
        <div style={{
          position: 'absolute',
          right: -12,
          bottom: 30,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: theme.colors.neutral[50]
        }} />
      </div>

      {/* Phần phải - Content */}
      <div style={{
        flex: 1,
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderLeft: `2px dashed ${theme.colors.primary[200]}`,
        background: theme.colors.neutral[50]
      }}>
        {/* Subtitle */}
        <span style={{
          fontSize: 11,
          color: theme.colors.primary[500],
          fontWeight: '600',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 6,
          fontFamily: theme.fonts.body
        }}>
          {offer.subtitle}
        </span>

        {/* Title */}
        <h3 style={{
          fontSize: 24,
          fontFamily: theme.fonts.heading,
          fontWeight: 600,
          color: theme.colors.neutral[800],
          margin: '0 0 12px 0'
        }}>
          {offer.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 14,
          color: theme.colors.text.secondary,
          fontFamily: theme.fonts.body,
          lineHeight: 1.6,
          margin: '0 0 16px 0',
          fontWeight: 300
        }}>
          {offer.description}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: 12,
            color: theme.colors.neutral[500],
            fontFamily: theme.fonts.body,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: theme.colors.primary[400] }}>
              schedule
            </span>
            {offer.validity}
          </span>
          
          <button style={{
            padding: '8px 20px',
            background: 'transparent',
            border: `1.5px solid ${theme.colors.primary[400]}`,
            color: theme.colors.primary[500],
            borderRadius: 6,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 1,
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: theme.fonts.body,
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { 
            e.currentTarget.style.background = theme.colors.primary[400]; 
            e.currentTarget.style.color = theme.colors.neutral[50]; 
          }}
          onMouseOut={e => { 
            e.currentTarget.style.background = 'transparent'; 
            e.currentTarget.style.color = theme.colors.primary[500]; 
          }}
          >
            Nhận ngay
          </button>
        </div>
      </div>
    </div>
  );
};

const Incentives = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await promotionService.getActivePromotions();
        if (response.success) {
          // Transform promotions to match VoucherCard format
          const transformedPromotions = response.promotions.map(promo => ({
            id: promo._id,
            title: promo.name.toUpperCase(),
            subtitle: promo.isFlashSale ? "⚡ Flash Sale" : "Special Offer",
            description: `Giảm ${promo.type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString()} VNĐ`}${promo.minOrderValue > 0 ? ` cho đơn từ ${promo.minOrderValue.toLocaleString()} VNĐ` : ''}`,
            validity: `HSD: ${dayjs(promo.endDate).format('DD/MM/YYYY')}`,
            discount: promo.type === 'percentage' ? `${promo.value}%` : `${(promo.value / 1000).toFixed(0)}K`,
            code: promo.code,
            isFlashSale: promo.isFlashSale,
            flashSaleStock: promo.flashSaleStock
          }));
          setPromotions(transformedPromotions);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <section style={{
        padding: '80px 0 100px',
        background: `linear-gradient(180deg, ${theme.colors.neutral[100]} 0%, ${theme.colors.neutral[50]} 100%)`,
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: `4px solid ${theme.colors.primary[200]}`,
            borderTop: `4px solid ${theme.colors.primary[500]}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ 
            marginTop: 20, 
            color: theme.colors.text.secondary,
            fontFamily: theme.fonts.body 
          }}>Đang tải ưu đãi...</p>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '80px 0 100px',
      background: `linear-gradient(180deg, ${theme.colors.neutral[100]} 0%, ${theme.colors.neutral[50]} 100%)`,
    }}>
      <div style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 60,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          
          <span style={{
            color: theme.colors.primary[500],
            fontWeight: '600',
            letterSpacing: 3,
            textTransform: 'uppercase',
            fontSize: 12,
            marginBottom: 12,
            fontFamily: theme.fonts.body
          }}>Exclusive Offers</span>
          <h2 style={{
            fontSize: 42,
            fontFamily: theme.fonts.heading,
            color: theme.colors.neutral[800],
            margin: '0 0 16px 0',
            fontWeight: 500
          }}>Ưu Đãi Đặc Biệt</h2>
          <div style={{
            height: 3,
            width: 60,
            background: theme.colors.primary[400],
            borderRadius: 2
          }} />
        </div>

        {/* Vouchers Grid */}
        {promotions.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: 32,
            justifyItems: 'center'
          }}>
            {promotions.map((offer, index) => (
              <VoucherCard key={offer.id} offer={offer} index={index} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: theme.colors.text.secondary
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 60, opacity: 0.3 }}>
              inbox
            </span>
            <p style={{ marginTop: 16, fontFamily: theme.fonts.body }}>
              Hiện chưa có ưu đãi nào
            </p>
          </div>
        )}

        {/* Note */}
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          padding: '20px 24px',
          background: theme.colors.primary[50],
          borderRadius: 8,
          maxWidth: 500,
          margin: '48px auto 0'
        }}>
          
        </div>
      </div>
    </section>
  );
};

export default Incentives;