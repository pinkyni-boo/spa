import React, { useRef, useState, useEffect } from 'react';
import { Typography, Row, Col, Rate, Image, Carousel, Button, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { feedbackService } from '../../services/feedbackService';
import { galleryService } from '../../services/galleryService'; // [NEW]
import royalLuxuryTheme from '../../theme';

const { Title, Text, Paragraph } = Typography;

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [results, setResults] = useState([]); // [NEW] Before/After
  const [facilityImages, setFacilityImages] = useState([]); // [NEW] Space
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Approved Feedbacks
        const fbRes = await feedbackService.getApprovedFeedbacks();
        if (fbRes.success) {
           const transformed = fbRes.feedbacks.map(fb => ({
             id: fb._id,
             name: fb.customerName,
             service: fb.serviceId?.name || 'Dịch vụ tại MIU SPA',
             rating: fb.rating,
             comment: fb.comment,
             image: fb.images?.[0] || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
           }));
           setFeedbacks(transformed);
        }

        // 2. Fetch Gallery (Results & Facility)
        const galleryRes = await galleryService.getAllGalleryItems();
        if (galleryRes.success) {
            const resultItems = galleryRes.gallery.filter(i => i.type === 'result');
            const facilityItems = galleryRes.gallery.filter(i => i.type === 'facility');
            
            setResults(resultItems);
            
            // If Admin has uploaded facility images, use them. Otherwise fallback to placeholders.
            if (facilityItems.length > 0) {
                setFacilityImages(facilityItems.map(i => i.imageUrl));
            } else {
                setFacilityImages([
                    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ]);
            }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. Banner Images (Static for now)
  const bannerImages = [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  ];

  // Theme Colors
  const royalCream = royalLuxuryTheme.colors.primary[50]; 
  const goldAccent = royalLuxuryTheme.colors.primary[400];
  const deepGold = royalLuxuryTheme.colors.primary[600];
  const textMain = royalLuxuryTheme.colors.text.main;

  // Components & Styles
  const SlickArrowLeft = ({ onClick, style }) => (
    <div onClick={onClick} style={{ ...style, position: 'absolute', left: '-45px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, backgroundColor: '#FFF', border: `1px solid ${deepGold}`, borderRadius: '50%', color: deepGold, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <LeftOutlined style={{ fontSize: '18px' }} />
    </div>
  );

  const SlickArrowRight = ({ onClick, style }) => (
    <div onClick={onClick} style={{ ...style, position: 'absolute', right: '-45px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, backgroundColor: '#FFF', border: `1px solid ${deepGold}`, borderRadius: '50%', color: deepGold, width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <RightOutlined style={{ fontSize: '18px' }} />
    </div>
  );

  const styles = {
    pageContainer: { backgroundColor: '#FEFEFA', fontFamily: royalLuxuryTheme.fonts.body, paddingBottom: '100px' },
    bannerContainer: { position: 'relative', width: '100%', height: '400px', overflow: 'hidden' },
    bannerSlide: { position: 'relative', height: '400px', width: '100%', backgroundSize: 'cover', backgroundPosition: 'center' },
    bannerOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)' },
    staticBannerContent: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
    bannerTitle: { color: '#FFFFFF', fontFamily: royalLuxuryTheme.fonts.heading, fontSize: '48px', textTransform: 'uppercase', letterSpacing: '4px', borderBottom: `2px solid ${goldAccent}`, paddingBottom: '12px' },
    
    section: { maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 0' },
    sectionHeader: { textAlign: 'center', marginBottom: '50px' },
    sectionTitle: { fontFamily: royalLuxuryTheme.fonts.heading, fontSize: '32px', color: textMain, textTransform: 'uppercase', letterSpacing: '2px' },
    divider: { width: '80px', height: '2px', backgroundColor: deepGold, margin: '16px auto' },

    // Result Card
    resultCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px' },
    comparisonContainer: { display: 'flex', height: '250px', borderBottom: '1px solid #f0f0f0' },
    imageHalf: { flex: 1, position: 'relative' },
    imageLabel: { position: 'absolute', bottom: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 12px', fontSize: '12px' },
    resultContent: { padding: '20px', textAlign: 'center' },

    // Feedback Card
    feedbackCard: { display: 'flex', flexDirection: 'row', backgroundColor: royalCream, borderRadius: '4px', border: `1px solid ${royalLuxuryTheme.colors.primary[50]}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', margin: '0 15px', height: '260px', overflow: 'hidden' },
    cardImageCol: { width: '35%', height: '100%', position: 'relative' },
    cardContentCol: { width: '65%', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' },
    
    // Gallery
    galleryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* 1. HERO BANNER */}
      <div style={styles.bannerContainer}>
        <div style={styles.staticBannerContent}>
          <Title level={1} style={styles.bannerTitle}>Kết Quả & Đánh Giá</Title>
        </div>
        <Carousel autoplay autoplaySpeed={3000} effect="fade" dots={false}>
          {bannerImages.map((img, index) => (
            <div key={index}>
              <div style={{ ...styles.bannerSlide, backgroundImage: `url("${img}")` }}>
                <div style={styles.bannerOverlay} />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 2. REAL RESULTS (BEFORE/AFTER) - FROM GALLERY API */}
      {results.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Title level={2} style={styles.sectionTitle}>Kết Quả Điều Trị Thực Tế</Title>
            <div style={styles.divider}></div>
            <Text type="secondary">Hình ảnh thực tế từ khách hàng tại MIU SPA</Text>
          </div>
          
          <Row gutter={[24, 24]}>
            {results.map(item => (
              <Col xs={24} sm={12} md={8} key={item._id}>
                <div style={styles.resultCard}>
                  <div style={styles.comparisonContainer}>
                    <div style={{ ...styles.imageHalf, borderRight: '1px solid white' }}>
                      <Image src={item.beforeImage} height="100%" width="100%" style={{ objectFit: 'cover' }} preview={false} />
                      <div style={{ ...styles.imageLabel, left: 0 }}>TRƯỚC</div>
                    </div>
                    <div style={styles.imageHalf}>
                      <Image src={item.afterImage} height="100%" width="100%" style={{ objectFit: 'cover' }} preview={false} />
                      <div style={{ ...styles.imageLabel, right: 0 }}>SAU</div>
                    </div>
                  </div>
                  <div style={styles.resultContent}>
                    <Title level={5} style={{ margin: '0 0 8px', color: deepGold }}>{item.title}</Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>{item.description}</Text>
                    {item.serviceId && <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 600 }}>Dịch vụ: {item.serviceId.name}</div>}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 3. CUSTOMER REVIEWS - FROM FEEDBACK API */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Title level={2} style={styles.sectionTitle}>Khách Hàng Nói Gì</Title>
          <div style={styles.divider}></div>
        </div>

        <Carousel 
          autoplay autoplaySpeed={4000} arrows 
          prevArrow={<SlickArrowLeft />} nextArrow={<SlickArrowRight />}
          slidesToShow={2} slidesToScroll={1}
          responsive={[{ breakpoint: 992, settings: { slidesToShow: 1 } }]}
          dots={false} draggable
        >
          {feedbacks.map((item) => (
            <div key={item.id} style={{ padding: '10px 0' }}> 
              <div style={styles.feedbackCard}>
                <div style={styles.cardImageCol}>
                   <Image src={item.image} preview={false} width="100%" height="100%" style={{ objectFit: 'cover' }} />
                </div>
                <div style={styles.cardContentCol}>
                  <Rate disabled defaultValue={item.rating} style={{ color: goldAccent, fontSize: '14px' }} />
                  <Title level={4} style={{ fontFamily: royalLuxuryTheme.fonts.heading, color: textMain, fontSize: '22px', margin: '8px 0 4px' }}>
                    {item.name}
                  </Title>
                  <Text style={{ color: deepGold, fontSize: '11px', textTransform: 'uppercase', marginBottom: '16px' }}>{item.service}</Text>
                  <Paragraph style={{ fontStyle: 'italic', fontSize: '15px', color: '#666' }} ellipsis={{ rows: 3 }}>
                    "{item.comment}"
                  </Paragraph>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 4. FACILITY GALLERY - FROM GALLERY API */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <Title level={2} style={styles.sectionTitle}>Không Gian Thư Giãn</Title>
          <div style={styles.divider}></div>
        </div>
       
        <div style={{ columns: '3 250px', gap: '16px' }}>
           {facilityImages.map((img, idx) => (
              <div key={idx} style={{ marginBottom: '16px', breakInside: 'avoid' }}>
                 <Image src={img} width="100%" style={{ borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
