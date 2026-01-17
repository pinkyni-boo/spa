import React, { useState } from 'react';
import { Layout, Card, Tabs, Typography, Button } from 'antd';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import Footer from './Pages/Global/Footer.jsx';
import Nav from './Pages/Global/Nav.jsx';
import ScrollToTop from './Pages/Global/ScrollToTop.jsx';
import ServicePage from './Pages/Service/Services.jsx';
import CombosPage from './Pages/Combo/Combo.jsx';
import Incentives from './Pages/Incentives/Incentives.jsx';
import Feedback from './Pages/Feedback/Feedback.jsx';
import About from './Pages/About.jsx';
import Policies from './Pages/Policies.jsx';
import Careers from './Pages/Careers.jsx';
import Training from './Pages/Training.jsx';
import Home from './Pages/Home.jsx';
import Booking from './component/Booking/Booking.jsx';
import Detail from './component/Service/Detail.jsx';
import { BookingProvider } from './component/Booking/BookingContext.jsx';
import Contact from './component/Contact/Contact.jsx';
import Dashboard from './Pages/Admin/Dashboard/Dashboard.jsx';
import BookingManager from './Pages/Admin/BookingManager/BookingManager.jsx';
import RoomManager from './Pages/Admin/RoomManager/RoomManager.jsx';
import StaffManager from './Pages/Admin/StaffManager/StaffManager.jsx';
import ServiceManager from './Pages/Admin/ServiceManager/ServiceManager.jsx';
import BranchManager from './Pages/Admin/BranchManager/BranchManager.jsx';
import PromotionManager from './Pages/Admin/PromotionManager/PromotionManager.jsx';
import FeedbackManager from './Pages/Admin/FeedbackManager/FeedbackManager.jsx';
import ProductManager from './Pages/Admin/Services/ProductManager.jsx';
import AdminSidebar from './Pages/Admin/Global/AdminSidebar.jsx';

const { Content, Header } = Layout;
const { Title } = Typography;

const MainContent = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const [collapsed, setCollapsed] = useState(false);

    if (isAdmin) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <Layout>
                    <Content style={{ margin: 0, minHeight: 280, background: '#f0f2f5', overflow: 'hidden' }}>
                        <Routes>
                            <Route path="/admin" element={<Dashboard />} />
                            <Route path="/admin/dashboard" element={<Dashboard />} />
                            <Route path="/admin/bookings" element={<BookingManager />} />
                            <Route path="/admin/rooms" element={<RoomManager />} />
                            <Route path="/admin/staff" element={<StaffManager />} />
                            <Route path="/admin/services" element={<ServiceManager />} />
                            <Route path="/admin/branches" element={<BranchManager />} />
                            <Route path="/admin/promotions" element={<PromotionManager />} />
                            <Route path="/admin/feedbacks" element={<FeedbackManager />} />
                            <Route path="/admin/products" element={<ProductManager />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // Public Layout
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#ffffffff' }}>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/service/:id" element={<Detail />} />
          <Route path="/combos" element={<CombosPage />} />
          <Route path="/incentives" element={<Incentives />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/training" element={<Training />} />
          
          {/* Admin routes need to be here too essentially for router matching, 
              BUT since we check 'isAdmin' above and return early, 
              we technically don't reach here if path is /admin. 
              Efficiency: Good. 
          */}
        </Routes>
        <Booking />
        <Contact />
        <Footer />
      </Layout>
    );
};

const App = () => (
  <BookingProvider>
    <BrowserRouter>
      <ScrollToTop />
      <MainContent />
    </BrowserRouter>
  </BookingProvider>
);

export default App;

