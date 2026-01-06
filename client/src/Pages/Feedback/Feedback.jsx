import React, { useRef } from 'react';
import { Typography, Row, Col, Rate, Image, Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import royalLuxuryTheme from '../../theme';

const { Title, Text, Paragraph } = Typography;

const Feedback = () => {
  // 1. Dữ liệu Feedback
  const feedbacks = [
    {
      id: 1,
      name: "Nguyễn Thu Hà",
      service: "Liệu trình Trẻ hóa Da Gold 24K",
      rating: 5,
      comment: "Không gian sang trọng tuyệt đối. Cảm giác da căng bóng ngay sau buổi đầu tiên. Rất hài lòng với sự chuyên nghiệp này.",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      name: "Trần Bảo Ngọc",
      service: "Massage Thư giãn Hoàng Gia",
      rating: 5,
      comment: "Dịch vụ đẳng cấp, nhân viên chu đáo nhẹ nhàng. Một trải nghiệm trọn vẹn sự thư thái tại MIU SPA.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      name: "Lê Minh Anh",
      service: "Tắm trắng Huyết Yến",
      rating: 5,
      comment: "Da bật tông rõ rệt. Không gian MIU SPA thực sự khiến mình choáng ngợp vì sự tinh tế và ấm cúng.",
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      name: "Phạm Thanh Hằng",
      service: "Chăm sóc da chuyên sâu",
      rating: 5,
      comment: "Sản phẩm xịn, kỹ thuật viên tay nghề cao. Luôn an tâm khi gửi gắm làn da của mình tại đây.",
      image: "https://images.unsplash.com/photo-1600334089648-b0d9c3024ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    }
  ];

  // 2. Dữ liệu Ảnh Hoạt động (Gallery)
  const activityImages = [
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ];

  // 3. Dữ liệu Ảnh Banner Carousel
  const bannerImages = [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Relaxation
    "https://images.unsplash.com/photo-1552693673-1bf958298935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Interior
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80", // Treatment
  ];

  // Colors & Theme constants
  const royalCream = royalLuxuryTheme.colors.primary[50]; // Silk White / Cream Yellow (#FDFBF0)
  const goldAccent = royalLuxuryTheme.colors.primary[400];
  const deepGold = royalLuxuryTheme.colors.primary[600];
  const textMain = royalLuxuryTheme.colors.text.main;

  // Custom Arrows for Feedback Carousel
  // Sử dụng div thay vì Button Antd để tránh xung đột style của slick-carousel
  const SlickArrowLeft = ({ currentSlide, slideCount, style, onClick, className }) => (
    <div
      // className={className} <--- BỎ dòng này để không nhận style mặc định (có dấu >) của slick
      onClick={onClick}
      style={{
        ...style,
        position: 'absolute',
        left: '-45px', // Đẩy ra xa khung nội dung
        top: '50%',
        zIndex: 20,
        transform: 'translateY(-50%)',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${deepGold}`,
        borderRadius: '50%',
        color: deepGold,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = deepGold;
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.borderColor = deepGold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.color = deepGold;
      }}
    >
      <LeftOutlined style={{ fontSize: '18px', display: 'block' }} />
    </div>
  );

  const SlickArrowRight = ({ currentSlide, slideCount, style, onClick, className }) => (
    <div
      // className={className} <--- BỎ dòng này
      onClick={onClick}
      style={{
        ...style,
        position: 'absolute',
        right: '-45px', // Đẩy ra xa khung nội dung
        top: '50%',
        zIndex: 20,
        transform: 'translateY(-50%)',
        backgroundColor: '#FFFFFF',
        border: `1px solid ${deepGold}`,
        borderRadius: '50%',
        color: deepGold,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = deepGold;
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.borderColor = deepGold;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.color = deepGold;
      }}
    >
      <RightOutlined style={{ fontSize: '18px', display: 'block' }} />
    </div>
  );

  const styles = {
    pageContainer: {
      backgroundColor: '#FEFEFA', // Slightly warm web background
      fontFamily: royalLuxuryTheme.fonts.body,
      paddingBottom: '100px',
    },
    
    // --- TOP SECTION: BANNER CAROUSEL ---
    bannerContainer: {
      position: 'relative',
      width: '100%',
      height: '500px',
      overflow: 'hidden',
    },
    bannerSlide: {
      position: 'relative',
      height: '500px',
      width: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    bannerOverlay: {
      position: 'absolute',
      top: 0, 
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.35)', // Dark overlay for text readability
    },
    // Static Text Layer (Nằm đè lên trên Carousel)
    staticBannerContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 10, // Higher than carousel
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none', // Allow clicking through if needed
    },
    bannerTitle: {
      color: '#FFFFFF',
      fontFamily: royalLuxuryTheme.fonts.heading,
      fontSize: '56px',
      textTransform: 'uppercase',
      letterSpacing: '4px',
      fontWeight: 500,
      textShadow: '0 4px 20px rgba(0,0,0,0.4)',
      textAlign: 'center',
      marginBottom: '16px',
      borderBottom: `2px solid ${royalLuxuryTheme.colors.primary[400]}`,
      paddingBottom: '12px',
      display: 'inline-block'
    },
    
    // --- MIDDLE SECTION: FEEDBACK CAROUSEL ---
    feedbackSection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '80px 40px 0', // Top padding = Separation
    },
    sectionDecor: {
      textAlign: 'center',
      marginBottom: '50px',
    },
    decorText: {
      fontFamily: royalLuxuryTheme.fonts.subheading,
      fontSize: '20px',
      fontStyle: 'italic',
      color: royalLuxuryTheme.colors.text.secondary,
    },
    // Horizontal Card Style
    card: {
      display: 'flex',
      flexDirection: 'row', // Horizontal
      backgroundColor: royalCream, // Selected Option 1
      borderRadius: '4px',
      border: `1px solid ${royalLuxuryTheme.colors.primary[50]}`, // Very subtle border
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      margin: '0 15px', // Gutter
      height: '260px',
      transition: 'transform 0.3s ease',
    },
    cardImageCol: {
      width: '35%',
      height: '100%',
      position: 'relative',
    },
    cardContentCol: {
      width: '65%',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start', // Left align
      textAlign: 'left',
    },
    customerName: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      color: textMain,
      fontSize: '22px',
      marginBottom: '4px',
      marginTop: '8px',
    },
    serviceText: {
      fontFamily: royalLuxuryTheme.fonts.sans,
      color: deepGold,
      fontSize: '11px',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      marginBottom: '16px',
    },
    commentText: {
      fontFamily: royalLuxuryTheme.fonts.body,
      color: royalLuxuryTheme.colors.text.secondary,
      fontSize: '15px',
      lineHeight: '1.6',
      fontStyle: 'italic',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    },

    // --- BOTTOM SECTION: GALLERY ---
    gallerySection: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '100px 20px 0', // Separation from feedback
    },
    galleryHeader: {
      textAlign: 'center',
      marginBottom: '60px',
      position: 'relative',
    },
    galleryTitle: {
      fontFamily: royalLuxuryTheme.fonts.heading,
      fontSize: '36px',
      color: textMain,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '10px',
    },
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* 1. HERO BANNER CAROUSEL */}
      <div style={styles.bannerContainer}>
        {/* Static Overlay Text */}
        <div style={styles.staticBannerContent}>
          <Title level={1} style={styles.bannerTitle}>
            Hình Ảnh & Khách Hàng 
          </Title>
        </div>

        {/* Carousel Background */}
        <Carousel autoplay autoplaySpeed={3000} effect="fade" dots={false}>
          {bannerImages.map((img, index) => (
            <div key={index}>
              <div 
                style={{
                  ...styles.bannerSlide,
                  backgroundImage: `url("${img}")`,
                }}
              >
                <div style={styles.bannerOverlay} />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 2. FEEDBACK CAROUSEL (SEPARATED) */}
      <div style={styles.feedbackSection}>
        <div style={styles.sectionDecor}>
          <Text style={styles.decorText}>- Những chia sẻ chân thành từ khách hàng thân thiết -</Text>
        </div>

        <Carousel 
          autoplay 
          autoplaySpeed={4000} 
          arrows 
          prevArrow={<SlickArrowLeft />} 
          nextArrow={<SlickArrowRight />}
          slidesToShow={2}
          slidesToScroll={1}
          responsive={[
            { breakpoint: 992, settings: { slidesToShow: 1 } }
          ]}
          dots={false}
          draggable
        >
          {feedbacks.map((item) => (
            <div key={item.id} style={{ padding: '10px 0' }}> 
              <div style={styles.card}>
                {/* Left Image */}
                <div style={styles.cardImageCol}>
                   <Image 
                     src={item.image} 
                     preview={false} 
                     width="100%" 
                     height="100%" 
                     style={{ objectFit: 'cover' }} 
                   />
                </div>
                {/* Right Content */}
                <div style={styles.cardContentCol}>
                  <Rate disabled defaultValue={item.rating} style={{ color: goldAccent, fontSize: '14px' }} />
                  <Title level={4} style={styles.customerName}>
                    {item.name}
                  </Title>
                  <Text style={styles.serviceText}>{item.service}</Text>
                  <Paragraph style={styles.commentText}>
                    "{item.comment}"
                  </Paragraph>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 3. ACTIVITY GALLERY */}
      <div style={styles.gallerySection}>
        <div style={styles.galleryHeader}>
           <Title level={2} style={styles.galleryTitle}>
             Không gian 
             <span style={{ color: goldAccent, fontWeight: 300 }}> & Dịch vụ</span>
           </Title>
           <div style={{ width: '80px', height: '2px', backgroundColor: deepGold, margin: '20px auto 0' }}></div>
        </div>
       
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
             <Image src={activityImages[0]} height={320} width="100%"  style={{ objectFit: 'cover', borderRadius: '4px', marginBottom: '24px', boxShadow: royalLuxuryTheme.shadows.soft }} />
             <Image src={activityImages[1]} height={420} width="100%" style={{ objectFit: 'cover', borderRadius: '4px', boxShadow: royalLuxuryTheme.shadows.soft }} />
          </Col>
          <Col xs={24} md={8} style={{ marginTop: '50px' }}> {/* Staggered Offset */}
             <Image src={activityImages[2]} height={300} width="100%" style={{ objectFit: 'cover', borderRadius: '4px', marginBottom: '24px', boxShadow: royalLuxuryTheme.shadows.soft }} />
             <Image src={activityImages[4]} height={450} width="100%" style={{ objectFit: 'cover', borderRadius: '4px', boxShadow: royalLuxuryTheme.shadows.soft }} />
          </Col>
          <Col xs={24} md={8}>
             <Image src={activityImages[3]} height={380} width="100%" style={{ objectFit: 'cover', borderRadius: '4px', marginBottom: '24px', boxShadow: royalLuxuryTheme.shadows.soft }} />
             <Image src={activityImages[5]} height={360} width="100%" style={{ objectFit: 'cover', borderRadius: '4px', boxShadow: royalLuxuryTheme.shadows.soft }} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Feedback;
