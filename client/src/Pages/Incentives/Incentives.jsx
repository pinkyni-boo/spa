import React from 'react';
import theme from '../../theme';

const offers = [
  {
    id: 1,
    title: "Chương Trình Member Mới",
    subtitle: "Welcome Privilege",
    description: "Giảm 20% cho lần trải nghiệm đầu tiên tại Miu Spa dành cho tất cả khách hàng mới.",
    validity: "Hết hạn: 31/12/2026",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop" // Hình spa thực tế
  },
  {
    id: 2,
    title: "Golden Hour – Giờ Vàng",
    subtitle: "Weekday Serenity",
    description: "Tặng gói xông hơi thảo dược khi sử dụng dịch vụ Body Therapy từ 10:00 - 14:00 (Thứ 2 - Thứ 6).",
    validity: "Áp dụng hàng tuần",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop" // Hình spa thực tế
  },
  {
    id: 3,
    title: "Ưu Đãi Sinh Nhật",
    subtitle: "Birthday Special",
    description: "Tặng suất massage mặt miễn phí cho khách hàng có sinh nhật trong tháng.",
    validity: "Áp dụng trong tháng sinh nhật",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Combo Bạn Thân",
    subtitle: "Bestie Combo",
    description: "Giảm thêm 10% khi đặt dịch vụ cho nhóm từ 2 người trở lên.",
    validity: "Áp dụng đến 31/12/2024",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop"
  }
];

const Incentives = () => {
  return (
    <section style={{
      padding: '80px 0',
      background: theme.colors.neutral[50],
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 64,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <span style={{
            color: theme.colors.primary[400],
            fontWeight: 'bold',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontSize: 12,
            marginBottom: 12
          }}>Exclusives</span>
          <h2 style={{
            fontSize: 40,
            fontFamily: theme.fonts.heading,
            color: theme.colors.neutral[800],
            marginBottom: 16,
            fontStyle: 'italic'
          }}>Ưu đãi </h2>
          <div style={{
            height: 2,
            width: 80,
            background: theme.colors.primary[400],
            opacity: 0.5,
            marginBottom: 0
          }} />
        </div>

        {/* Offers List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 48
        }}>
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              style={{
                display: 'flex',
                flexDirection: index % 2 !== 0 ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 48,
                flexWrap: 'wrap',
                background: theme.colors.neutral[100], // Nền vàng nhạt sang trọng
                borderRadius: theme.borderRadius.md,
                boxShadow: theme.shadows.soft,
                border: `1.5px solid ${theme.colors.primary[100]}`,
                padding: 32,
                minHeight: 280
              }}
            >
              {/* Image with Gold Border Detail */}
              <div style={{
                width: '100%',
                maxWidth: 320,
                flex: '1 1 220px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: theme.borderRadius.md,
                boxShadow: theme.shadows.soft,
                minHeight: 180,
                background: theme.colors.neutral[50]
              }}>
                <div style={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  right: -12,
                  bottom: -12,
                  border: `2px solid ${theme.colors.primary[100]}`,
                  borderRadius: theme.borderRadius.md,
                  zIndex: 1,
                  pointerEvents: 'none'
                }} />
                <img
                  src={offer.image}
                  alt={offer.title}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: theme.borderRadius.md,
                    filter: 'grayscale(20%)',
                    transition: 'filter 0.7s, transform 0.7s',
                    zIndex: 2,
                    position: 'relative',
                    display: 'block'
                  }}
                  onMouseOver={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseOut={e => { e.currentTarget.style.filter = 'grayscale(20%)'; e.currentTarget.style.transform = 'none'; }}
                />
              </div>

              {/* Text Content */}
              <div style={{
                width: '100%',
                maxWidth: 520,
                flex: '2 1 320px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                textAlign: 'left'
              }}>
                <span style={{
                  color: theme.colors.primary[600],
                  fontFamily: theme.fonts.sans,
                  fontSize: 14,
                  letterSpacing: 2,
                  textTransform: 'uppercase'
                }}>{offer.subtitle}</span>
                <h3 style={{
                  fontSize: 28,
                  fontFamily: theme.fonts.heading,
                  color: theme.colors.neutral[800],
                  margin: 0
                }}>{offer.title}</h3>
                <p style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.fonts.body,
                  fontWeight: 300,
                  lineHeight: 1.7,
                  maxWidth: 400,
                  margin: 0
                }}>
                  {offer.description}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: theme.colors.neutral[500],
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: theme.colors.primary[400] }}>event_available</span>
                  {offer.validity}
                </div>
                <div style={{ marginTop: 16 }}>
                  <button style={{
                    padding: '12px 32px',
                    border: `1.5px solid ${theme.colors.primary[400]}`,
                    color: theme.colors.primary[400],
                    background: theme.colors.neutral[50],
                    borderRadius: theme.borderRadius.md,
                    fontWeight: 'bold',
                    fontSize: 13,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = theme.colors.primary[400]; e.currentTarget.style.color = theme.colors.primary[800]; }}
                    onMouseOut={e => { e.currentTarget.style.background = theme.colors.neutral[50]; e.currentTarget.style.color = theme.colors.primary[400]; }}
                  >
                    Nhận Ưu Đãi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Incentives;