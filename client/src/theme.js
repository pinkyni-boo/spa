export const royalLuxuryTheme = {
  colors: {
    // === VÀNG GOLD HOÀNG GIA (Từ Champagne đến Metallic Gold) ===
    primary: {
      50: '#FDFBF0',  // Silk White (Trắng tơ lụa)
      100: '#F9F1D2', // Champagne Gold (Vàng Champagne nhạt)
      200: '#F3E5AB', // Soft Gold
      300: '#E6D281', // Classic Gold
      400: '#D4AF37', // Gold Metallic (Màu chủ đạo quý tộc)
      500: '#C5A02B', // Deep Gold
      600: '#AA8400', // Muted Gold (Vàng trầm sang trọng)
      700: '#8A6D00', // Bronze Gold
      800: '#695300', // Antique Gold
      900: '#483900', // Dark Gold
    },

    // === TRẮNG TINH KHÔI & BONE (Nền chủ đạo) ===
    neutral: {
      50: '#FFFFFF',  // Pure White (Trắng tinh khôi)
      100: '#FBFBF9', // Off-White/Bone (Màu nền body sang trọng)
      200: '#F5F5F0', // Alabaster (Màu đá cẩm thạch trắng)
      300: '#E8E8E1', // Platinum Grey nhạt
      400: '#D1D1CB',
      500: '#A1A19A',
      600: '#71716A',
      700: '#41413C',
      800: '#1C1F1A', // Graphite/Obsidian (Đen chì huyền bí cho text/nút)
      900: '#0A0A0A', // Deep Black
    },

    // === MÀU NHẤN & TYPOGRAPHY ===
    text: {
      main: '#1C1F1A',      // Obsidian Black (Chữ chính sắc nét)
      secondary: '#626262', // Graphite Grey (Mô tả nhẹ nhàng)
      gold: '#AA8400',      // Gold Accent (Nhấn mạnh từ ngữ quý phái)
      light: '#F5F5F5',     // Text trên nền tối
    }
  },

  fonts: {
    heading: "'Be Vietnam Pro', sans-serif",
    subheading: "'Be Vietnam Pro', sans-serif",
    body: "'Be Vietnam Pro', sans-serif",
    sans: "'Be Vietnam Pro', sans-serif"
  },

  shadows: {
    soft: '0 2px 12px rgba(28, 31, 26, 0.05)',
    elegant: '0 8px 30px rgba(212, 175, 55, 0.08)', // Bóng đổ ánh kim nhẹ
    royal: '0 15px 45px rgba(0, 0, 0, 0.1)',
  },

  borderRadius: {
    none: '0px', // Luxury thường dùng góc vuông sắc sảo
    sm: '2px',   // Bo góc cực nhẹ tạo cảm giác thủ công cao cấp
    md: '4px',
  },

  gradients: {
    champagne: 'linear-gradient(135deg, #FBFBF9 0%, #F9F1D2 100%)',
    royalGold: 'linear-gradient(135deg, #D4AF37 0%, #AA8400 100%)',
    obsidian: 'linear-gradient(135deg, #1C1F1A 0%, #0A0A0A 100%)',
  }
};

export default royalLuxuryTheme;