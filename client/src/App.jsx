import React from 'react';
import { Layout, Card, Tabs, Typography } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Footer from './component/Global/Footer.jsx';
import Nav from './component/Global/Nav.jsx';
import ServicePage from './component/Service/Services.jsx';

const { Content } = Layout;
const { Title } = Typography;

const Home = () => (
  <Content style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px 20px'
  }}>
    <Card
      style={{
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderRadius: '12px'
      }}
    >
      <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
        My SPA Project
      </Title>
      <Tabs
        defaultActiveKey="1"
        centered
        items={[
          { key: '1', label: 'Đăng Nhập', children: <div style={{ padding: '20px 0' }}><p style={{ textAlign: 'center' }}>Nội dung Form login</p></div> },
          { key: '2', label: 'Đăng Ký', children: <div style={{ padding: '20px 0' }}><p style={{ textAlign: 'center' }}>Nội dung Form register</p></div> },
        ]}
      />
    </Card>
  </Content>
);

const App = () => (
  <BrowserRouter>
    <Layout style={{ minHeight: '100vh', backgroundColor: '#ffffffff' }}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<ServicePage />} />
        {/* Thêm các route khác nếu cần */}
      </Routes>
      <Footer />
    </Layout>
  </BrowserRouter>
);

export default App;