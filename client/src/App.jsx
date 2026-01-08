import React from 'react';
import { Layout, Card, Tabs, Typography } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

const { Content } = Layout;
const { Title } = Typography;

const App = () => (
  <BookingProvider>
    <BrowserRouter>
      <ScrollToTop />
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
        </Routes>
        <Booking />
        <Contact /> 
        <Footer />
      </Layout>
    </BrowserRouter>
  </BookingProvider>
);

export default App;