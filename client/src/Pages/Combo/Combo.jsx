import React, { useState } from 'react';
import theme from '../../theme';

const comboTabs = [
  { key: 'signature', label: 'Signature Therapies', href: '#signature' },
  { key: 'facial', label: 'Facial Care', href: '#facial' },
  { key: 'body', label: 'Body Therapy', href: '#body' },
  { key: 'combos', label: 'Special Packages', href: '#combos' },
];

const combos = [
  {
    id: 1,
    tab: 'signature',
    tag: "Relaxation",
    title: "The Miu Escape",
    features: [
      "Body Massage (60 Mins)",
      "Basic Facial Cleanse",
      "Herbal Foot Bath",
      "Tea & Snacks"
    ],
    originalPrice: "1.200k",
    discountPrice: "990k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 2,
    tab: 'signature',
    tag: "Signature",
    title: "Royal Signature Therapy",
    features: [
      "Aromatherapy Massage (75 Mins)",
      "Signature Herbal Compress",
      "Head & Scalp Massage"
    ],
    originalPrice: "1.500k",
    discountPrice: "1.200k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 3,
    tab: 'facial',
    tag: "Facial",
    title: "Gold Facial Glow",
    features: [
      "24k Gold Facial Mask",
      "Deep Cleansing",
      "Hydrating Serum",
      "Face Massage"
    ],
    originalPrice: "1.000k",
    discountPrice: "850k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 4,
    tab: 'facial',
    tag: "Premium",
    title: "Luxury Rejuvenation",
    features: [
      "Anti-aging Facial",
      "Collagen Infusion",
      "Eye Treatment",
      "Neck & Shoulder Massage"
    ],
    originalPrice: "1.800k",
    discountPrice: "1.400k",
    isPremium: true,
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 5,
    tab: 'body',
    tag: "Body",
    title: "Deep Tissue Therapy",
    features: [
      "Deep Tissue Massage (90 Mins)",
      "Hot Stone Application",
      "Muscle Relief Balm"
    ],
    originalPrice: "1.400k",
    discountPrice: "1.100k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 6,
    tab: 'body',
    tag: "Body",
    title: "Detox Body Ritual",
    features: [
      "Body Scrub",
      "Detox Wrap",
      "Aromatherapy Massage"
    ],
    originalPrice: "1.600k",
    discountPrice: "1.250k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 7,
    tab: 'combos',
    tag: "Premium",
    title: "Golden Luxury",
    features: [
      "Hot Stone Massage (90 Mins)",
      "24k Gold Anti-Aging Mask",
      "Body Scrub & Wrap",
      "Private VIP Room"
    ],
    originalPrice: "2.500k",
    discountPrice: "1.890k",
    isPremium: true,
    images: [
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    id: 8,
    tab: 'combos',
    tag: "Couple",
    title: "Couple Retreat",
    features: [
      "Couple Massage (60 Mins)",
      "Romantic Candle Setup",
      "Fruit Platter & Tea"
    ],
    originalPrice: "2.200k",
    discountPrice: "1.700k",
    isPremium: false,
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop"
    ]
  }
];

const ComboHeader = ({ activeTab, setActiveTab }) => (
  <>
    {/* Hero Section */}
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '50vh',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClF6Er7i3kIhq_i9uREW9_DFO35QxKG-3uanvnx-FnKf4BUkf0GIvtzoCcUlbdEnKOixaOWNWjSM9Yt5i9EeMwXeafu1oCWzysK0NAp6usmDQ1WUUtiJU90Wyi1co2kv6BWbu_ItbbfIqugXnkpgZ-gdsurEsTAsb7FpFEIFtVCRzWZOsuYHoWHjxiPOg8fdeVYAuA9DHvyBqYDPk_EfXZ17DNscLYsKC0wJ9ba_IDPlImmAf-Jj6mBZ-n5sLZJkBmc_FdkZFIkTw')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 1,
        }}
        aria-label="Serene spa room with dim lighting, candles, and soft towels in a luxury minimalist setting"
      />
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(1px)',
          zIndex: 2,
        }}
      />
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
          padding: '0 16px',
        }}
      >
        <h1
          style={{
            color: theme.colors.neutral[50],
            fontSize: 48,
            fontFamily: theme.fonts.heading,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            margin: 0,
          }}
        >
          Bảng Giá 
        </h1>
        <div
          style={{
            height: 2,
            width: 96,
            background: theme.colors.primary[400],
            marginBottom: 8,
          }}
        />
        <h2
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: 1,
            maxWidth: 600,
            margin: 0,
            fontFamily: theme.fonts.body,
          }}
        >
          Experience the pinnacle of minimalist luxury and relaxation.
        </h2>
      </div>
    </section>

    {/* Intro Section */}
    <section
      style={{
        padding: '64px 16px',
        background: theme.colors.neutral[50],
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 40,
            color: theme.colors.primary[400],
            opacity: 0.8,
          }}
        >
          self_improvement
        </span>
        <p
          style={{
            color: theme.colors.text.secondary,
            fontSize: 18,
            fontWeight: 300,
            lineHeight: 1.7,
            fontFamily: theme.fonts.body,
            margin: 0,
          }}
        >
          We believe in the art of healing through touch and tranquility. Our pricing reflects our commitment to using only premium organic products and providing an atmosphere of absolute serenity.
        </p>
      </div>
    </section>

    {/* Tabs Navigation */}
    <div
      style={{
        position: 'sticky',
        top: 72,
        zIndex: 40,
        background: theme.colors.neutral[100],
        backdropFilter: 'blur(4px)',
        borderBottom: `1px solid ${theme.colors.neutral[300]}`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 16px',
          overflowX: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: 32,
            minWidth: 'max-content',
            justifyContent: 'center',
          }}
        >
          {comboTabs.map((tab) => (
            <a
              key={tab.key}
              href={tab.href}
              onClick={e => {
                e.preventDefault();
                setActiveTab(tab.key);
                // Scroll đến section nếu cần
                const el = document.getElementById(tab.key);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 16,
                paddingBottom: 12,
                borderBottom: `2px solid ${
                  activeTab === tab.key
                    ? theme.colors.primary[400]
                    : 'transparent'
                }`,
                color:
                  activeTab === tab.key
                    ? theme.colors.primary[400]
                    : theme.colors.text.secondary,
                fontWeight: 'bold',
                fontSize: 14,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
                background: 'none',
                textDecoration: 'none',
              }}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </>
);

const Combo = () => {
  const [activeTab, setActiveTab] = useState('signature');
  const filteredCombos = combos.filter(combo => combo.tab === activeTab);

  return (
    <>
      <ComboHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <section
        id={activeTab}
        style={{
          width: '100%',
          maxWidth: 1200,
          margin: '40px auto 0 auto',
          padding: '0 24px',
          scrollMarginTop: 160
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
          maxWidth: 1200,
          margin: '0 auto'
        }}>
          {filteredCombos.map((combo, idx) => (
            <div
              key={combo.id}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '9/16',
                minHeight: 420,
                maxWidth: 400,
                margin: '0 auto',
                borderRadius: 32,
                overflow: 'hidden',
                boxShadow: combo.isPremium ? theme.shadows.elegant : theme.shadows.soft,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                background: '#222', // fallback
              }}
            >
              {/* Phối nhiều ảnh làm nền */}
              {combo.images.map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: idx === 0 ? 'center' : idx === 1 ? 'top right' : 'bottom left',
                    opacity: idx === 0 ? 0.7 : 0.25,
                    filter: idx === 0 ? 'none' : 'blur(2px)',
                    zIndex: 1 + idx,
                    transition: 'opacity 0.3s'
                  }}
                />
              ))}
              {/* Overlay làm mờ nền cho chữ nổi bật */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(28,31,26,0.85) 60%, rgba(28,31,26,0.2) 100%)',
                  zIndex: 10
                }}
              />
              {/* Nội dung card */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 20,
                  padding: '32px 28px 24px 28px',
                  color: combo.isPremium ? theme.colors.primary[400] : theme.colors.neutral[50],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}
              >
                {/* Tag badge */}
                <div style={{
                  background: combo.isPremium ? theme.colors.primary[800] : theme.colors.primary[100],
                  color: theme.colors.primary[400],
                  padding: '4px 18px',
                  borderRadius: 18,
                  fontWeight: 'bold',
                  fontSize: 13,
                  letterSpacing: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {combo.isPremium && (
                    <span className="material-symbols-outlined" style={{
                      fontSize: 16,
                      color: theme.colors.primary[400]
                    }}>star</span>
                  )}
                  {combo.tag}
                </div>
                <h3 style={{
                  fontSize: 24,
                  fontFamily: theme.fonts.heading,
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: 12,
                  color: theme.colors.primary[400]
                }}>
                  {combo.title}
                </h3>
                <ul style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 16,
                  margin: 0,
                  marginBottom: 18,
                  color: theme.colors.neutral[50],
                  fontFamily: theme.fonts.body,
                  listStyle: 'disc inside',
                  padding: 0
                }}>
                  {combo.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                {/* Giá nổi bật */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 18,
                  marginTop: 8,
                  justifyContent: 'flex-start'
                }}>
                  <span style={{
                    color: theme.colors.neutral[300],
                    textDecoration: 'line-through',
                    fontSize: 20,
                    fontWeight: 400
                  }}>
                    {combo.originalPrice}
                  </span>
                  <span style={{
                    fontSize: 48,
                    fontFamily: theme.fonts.heading,
                    fontWeight: 'bold',
                    color: theme.colors.primary[400],
                    letterSpacing: 2,
                    lineHeight: 1
                  }}>
                    {combo.discountPrice}
                  </span>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 18,
                    textTransform: 'uppercase',
                    fontSize: 15,
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    border: `1.5px solid ${theme.colors.primary[400]}`,
                    background: theme.colors.primary[400],
                    color: theme.colors.primary[800],
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: theme.fonts.body,
                    marginTop: 8
                  }}
                >
                  Book This Package
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Combo;