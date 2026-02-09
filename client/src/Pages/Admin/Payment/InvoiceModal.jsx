import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Table, Button, Typography, InputNumber, Select, Divider, message, Tag, Switch, Slider } from 'antd';
import dayjs from 'dayjs';

import { adminBookingService } from '../../../services/adminBookingService';
import { promotionService } from '../../../services/promotionService'; // [NEW]

const { Title, Text } = Typography;

const InvoiceModal = ({ visible, onClose, booking, invoice, onSubmit }) => {
    // STATE
    const [items, setItems] = useState([]);

    // DISCOUNT & PROMOTION STATE
    const [discount, setDiscount] = useState(0); // Manual Discount (Legacy)
    const [promotions, setPromotions] = useState([]); // Suggested Promotions
    const [selectedPromotionId, setSelectedPromotionId] = useState(null); // Selected Coupon
    const [promotionDiscount, setPromotionDiscount] = useState(0); // Calculated Discount from Coupon

    // LOYALTY POINTS STATE
    const [customerPoints, setCustomerPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const POINT_VALUE = 1000; // 1 Point = 1,000 VND (Redemption Rate)

    const [taxRate, setTaxRate] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // RETAIL MODE STATE
    const [availableProducts, setAvailableProducts] = useState([]); // [NEW] Fetch from API
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState(0);
    const [newProductQty, setNewProductQty] = useState(1);

    // Initialization
    useEffect(() => {
        if (visible) {
            // Reset States
            setSelectedPromotionId(null);
            setPromotionDiscount(0);
            setUsePoints(false);
            setPointsToRedeem(0);
            setCustomerPoints(0);

            // Fetch Products for Retail Mode
            if (!invoice) {
                adminBookingService.getServices().then(data => {
                    // Filter only products (type='product')
                    // Note: If backend doesn't populate type correctly yet, stick to manual or filter by name convention?
                    // Assuming Service model updates logic works. 
                    // Fallback: If no type field, assume all services are selectable or check if 'duration' is 0 for products?
                    // Safe bet: Filter items with type === 'product'
                    if (Array.isArray(data)) {
                        const products = data.filter(s => s.type === 'product');
                        setAvailableProducts(products);
                    } else if (data.services) { // Handle potential pagination envelope
                         const products = data.services.filter(s => s.type === 'product');
                        setAvailableProducts(products);
                    }
                });
            }

            if (invoice) {
                // VIEW MODE
                setItems(invoice.items.map((item, i) => ({
                    key: i,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    total: item.subtotal || (item.price * item.qty),
                    type: item.type
                })));
                setDiscount(invoice.discount);
                setPaymentMethod(invoice.paymentMethod);
            } else if (booking) {
                // CREATE MODE (Load from Booking)
                const mainService = {
                    key: 'main',
                    name: booking.serviceId?.name || booking.serviceName || 'Dịch vụ chính',
                    qty: 1,
                    price: booking.serviceId?.price || 0,
                    total: booking.serviceId?.price || 0,
                    type: 'service'
                };
                
                const upsellItems = (booking.servicesDone || []).map((s, i) => ({
                    key: `upsell_${i}`,
                    name: s.name,
                    qty: s.qty,
                    price: s.price,
                    total: s.price * s.qty,
                    type: 'service'
                }));
                
                setItems([mainService, ...upsellItems]);
                setItems([mainService, ...upsellItems]);
                setDiscount(0);
                setPaymentMethod('cash');

                // [NEW] Fetch Customer Points
                if (booking.phone) {
                     fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/bookings/history/${booking.phone}`)
                        .then(res => res.json())
                        .then(data => {
                             // Backend returns { success, stats, history }
                            if (data.success && data.stats) {
                                setCustomerPoints(data.stats.loyaltyPoints || 0);
                            }
                        })
                        .catch(e => console.error("Error fetching points", e));
                }
            }
        }
    }, [visible, invoice, booking]);

    // [NEW] Suggest Promotions when subTotal changes
    // Calculate subTotal early for effect dependency
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);

    useEffect(() => {
        if (visible && !invoice && subTotal > 0) {
            promotionService.suggestPromotions(subTotal, booking?.branchId?._id || booking?.branchId)
                .then(res => {
                    if (res.success) {
                        setPromotions(res.promotions || []);
                    }
                });
        }
    }, [visible, subTotal, booking, invoice]);

    // HANDLER: Add Manual Product
    const handleAddProduct = () => {
        if (!newProductName || newProductPrice <= 0) {
            message.error("Vui lòng nhập tên và giá sản phẩm hợp lệ!");
            return;
        }
        
        const newItem = {
            key: `retail_${Date.now()}`,
            name: newProductName,
            qty: newProductQty,
            price: newProductPrice,
            total: newProductPrice * newProductQty,
            type: 'product' // Mark as retail product
        };
        
        setItems([...items, newItem]);
        setNewProductName('');
        setNewProductPrice(0);
        setNewProductQty(1);
        message.success("Đã thêm sản phẩm!");
    };

    // HANDLER: Remove Item (Optional, maybe for retail items only?)
    const handleRemoveItem = (key) => {
        setItems(items.filter(i => i.key !== key));
    };

    // CALCULATIONS
    // CALCULATIONS
    // const subTotal = items.reduce((sum, item) => sum + item.total, 0); // Already calculated above
    
    const pointsDiscount = usePoints ? (pointsToRedeem * POINT_VALUE) : 0;
    const totalDiscount = discount + promotionDiscount + pointsDiscount; // Combine Manual + Coupon + Points
    
    const taxAmount = Math.round(subTotal * (taxRate / 100));
    const finalTotal = Math.max(0, subTotal + taxAmount - totalDiscount); // Prevent negative total

    // LOGIC: Select Promotion
    const handleSelectPromotion = (promoId) => {
        setSelectedPromotionId(promoId);
        if (!promoId) {
            setPromotionDiscount(0);
            return;
        }
        
        const promo = promotions.find(p => p._id === promoId);
        if (promo) {
            let val = 0;
            if (promo.type === 'percentage') {
                val = Math.round((subTotal * promo.value) / 100);
            } else {
                val = promo.value;
            }
            // Cap at subtotal
            setPromotionDiscount(Math.min(val, subTotal));
            
            // [LOGIC] Check Conflict
            if (promo.allowCombine === false) { // Explicit check
                if (usePoints) {
                    setUsePoints(false);
                    message.warning(`Mã ${promo.code} không dùng chung với điểm tích lũy. Đã tắt dùng điểm.`);
                }
            }
            message.success(`Applied: ${promo.name}`);
        }
    };

    // QR CODE URL
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>
    // Sample: MB Bank (Bin 970422) - Acc: 000000
    const bankId = 'MB'; 
    const accountNo = '0359498968';
    const qrContent = `THANH TOAN DON ${booking ? booking._id.slice(-6).toUpperCase() : 'RETAIL'}`;
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact.png?amount=${finalTotal}&addInfo=${qrContent}`;


    const handlePayment = () => {
        const invoiceData = {
            bookingId: booking?._id || null, // Handle null if pure retail (future)
            customerName: booking?.customerName || 'Khách lẻ',
            phone: booking?.phone || '',
            items: items.map(i => ({
                itemId: i.key === 'main' ? booking?.serviceId?._id : null, 
                type: i.type,
                name: i.name,
                price: i.price,
                qty: i.qty,
                subtotal: i.total
            })),
            subTotal,
            discount: totalDiscount, // Total consolidated discount
            tax: taxAmount,
            finalTotal,
            paymentMethod,
            cashierName: 'Admin',
            // [NEW] Pass Promotion & Points Data
            promotionId: selectedPromotionId,
            pointsUsed: usePoints ? pointsToRedeem : 0
        };
        onSubmit(invoiceData);
    };

    const columns = [
        { title: 'Hạng mục', dataIndex: 'name', key: 'name', render: (t, r) => <span>{t} {r.type === 'product' && <Tag color="blue">SP</Tag>}</span> },
        { title: 'SL', dataIndex: 'qty', key: 'qty', width: 60 },
        { title: 'Đơn giá', dataIndex: 'price', key: 'price', render: (v) => v?.toLocaleString() },
        { title: 'Thành tiền', dataIndex: 'total', key: 'total', render: (v) => <strong>{v?.toLocaleString()}</strong> },
        { 
            title: '', 
            key: 'action', 
            width: 50,
            render: (_, record) => !invoice && (record.type === 'product' || record.key.toString().startsWith('retail')) && (
                 <Button type="text" danger size="small" onClick={() => handleRemoveItem(record.key)}>X</Button>
            )
        }
    ];

    const handlePrint = () => {
        // ... (Keep existing print logic logic but adapt to new state if needed, assuming generic Table data is enough)
        // For brevity, using same print logic as previous, referencing 'items' state
         const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Hóa Đơn - ${booking?.customerName || invoice?.customerName}</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; }
                        h2 { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .info { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { text-align: left; padding: 8px; border-bottom: 1px dotted #ccc; }
                        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                        .footer { margin-top: 40px; text-align: center; font-style: italic; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h2>MIU SPA INC.</h2>
                    <div class="info">
                        KH: ${booking?.customerName || invoice?.customerName}<br/>
                        SĐT: ${booking?.phone || invoice?.phone}<br/>
                        Ngày: ${dayjs().format('HH:mm DD/MM/YYYY')}
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Dịch vụ/SP</th>
                                <th>SL</th>
                                <th>Đ.Giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td>${item.price?.toLocaleString()}</td>
                                    <td>${item.total?.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        TỔNG: ${finalTotal.toLocaleString()} VND
                    </div>
                    <div class="footer">
                        Cảm ơn quý khách và hẹn gặp lại!<br/>
                        Hotline: 0909.123.456
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!booking && !invoice) return null;

    return (
        <Modal
            title={<Title level={4}>{invoice ? '📜 Chi Tiết Hóa Đơn' : '🧾 Thanh Toán (POS)'}</Title>}
            open={visible}
            onCancel={onClose}
            width={700}
            footer={invoice ? [
                 <Button key="close" onClick={onClose}>Đóng</Button>,
                 <Button key="print" type="primary" onClick={handlePrint}>In Hóa Đơn</Button>
            ] : [
                <Button key="cancel" onClick={onClose}>Hủy</Button>,
                <Button key="submit" type="primary" size="large" onClick={handlePayment} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                    Xác Nhận Thu {finalTotal.toLocaleString()} đ
                </Button>
            ]}
        >
            {/* 1. INFO HEADER */}
            <div style={{ marginBottom: 20, textAlign: 'center', background: '#f5f5f5', padding: 10, borderRadius: 8 }}>
                <Text type="secondary">Khách hàng:</Text> <Text strong style={{fontSize: 16}}>{booking?.customerName || invoice?.customerName}</Text>
                <Divider type="vertical" />
                <Divider type="vertical" />
                <Text type="secondary">SDT:</Text> <Text>{booking?.phone || invoice?.phone}</Text>
                 {/* [NEW] Show available points */}
                 {!invoice && customerPoints > 0 && (
                    <Tag color="gold" style={{ marginLeft: 10 }}>👑 {customerPoints.toLocaleString()} điểm</Tag>
                )}
            </div>

            {/* 2. ITEM TABLE */}
            <Table 
                dataSource={items} 
                columns={columns} 
                pagination={false} 
                size="small"
                bordered
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Tạm tính:</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1}><Text>{subTotal.toLocaleString()}</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            {/* 3. ADD PRODUCT (RETAIL) - ONLY IN CREATE MODE */}
            {!invoice && (
                <div style={{ marginTop: 15, padding: 10, border: '1px dashed #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
                    <Text strong style={{display:'block', marginBottom: 8}}>🛍️ Thêm Sản Phẩm (Bán Lẻ)</Text>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Select
                            showSearch
                            placeholder="Tìm sản phẩm..."
                            optionFilterProp="children"
                            style={{ flex: 2 }}
                            value={newProductName || undefined}
                            onChange={(value) => {
                                const productsToSearch = availableProducts.length > 0 ? availableProducts : [];
                                const product = productsToSearch.find(p => p.name === value);
                                setNewProductName(value);
                                if (product) setNewProductPrice(product.price);
                            }}
                            filterOption={(input, option) =>
                                (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {availableProducts.map(p => (
                                <Select.Option key={p._id || p.name} value={p.name}>
                                    {p.name} - {p.price?.toLocaleString()}đ
                                </Select.Option>
                            ))}
                        </Select>

                        <InputNumber 
                            placeholder="Giá"
                            value={newProductPrice} 
                            onChange={setNewProductPrice} 
                            style={{ flex: 1 }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                        <InputNumber 
                            placeholder="SL"
                            value={newProductQty} 
                            onChange={setNewProductQty} 
                            min={1}
                            style={{ width: 60 }} 
                        />
                        <Button type="primary" ghost onClick={handleAddProduct}>+ Thêm</Button>
                    </div>
                </div>
            )}

            {/* 4. TOTALS & PAYMENT & QR */}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                {/* LEFT: Payment Method & QR */}
                <div style={{ flex: 1, paddingRight: 20 }}>
                     <div style={{ marginBottom: 10 }}>
                        <Text>Hình thức thanh toán:</Text><br/>
                        <Select value={paymentMethod} onChange={setPaymentMethod} style={{ width: '100%', marginTop: 5 }} disabled={!!invoice}>
                            <Select.Option value="cash">💵 Tiền mặt</Select.Option>
                            <Select.Option value="banking">🏦 Chuyển khoản (VietQR)</Select.Option>
                            <Select.Option value="card">💳 Quẹt thẻ</Select.Option>
                        </Select>
                     </div>

                     {/* QR CODE DISPLAY */}
                     {paymentMethod === 'banking' && !invoice && (
                         <div style={{ textAlign: 'center', border: '1px solid #1890ff', padding: 10, borderRadius: 8, background: '#e6f7ff' }}>
                             <Text strong type="success">Quét mã để thanh toán</Text>
                             <img 
                                src={qrUrl} 
                                alt="VietQR" 
                                style={{ width: '100%', maxWidth: 200, marginTop: 10, borderRadius: 4 }} 
                             />
                             <div style={{fontSize: 12, marginTop: 5, color: '#666'}}>
                                MB Bank - 0359498968<br/>
                                Tự động nhập số tiền & nội dung
                             </div>
                         </div>
                     )}
                </div>

                {/* RIGHT: Totals & Discounts */}
                <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', borderLeft: '1px solid #eee', paddingLeft: 20 }}>
                     
                     {/* [NEW] PROMOTION SELECTOR */}
                     {!invoice && (
                        <div style={{ width: '100%', marginBottom: 8 }}>
                            <Text strong>🎟️ Ưu Đãi / Voucher:</Text>
                            <Select
                                placeholder="Chọn mã giảm giá..."
                                style={{ width: '100%', marginTop: 4 }}
                                allowClear
                                onChange={handleSelectPromotion}
                                value={selectedPromotionId}
                            >
                                {promotions.length === 0 ? (
                                     <Select.Option disabled key="none">Không có mã phù hợp</Select.Option>
                                ) : (
                                    promotions.map(p => (
                                        <Select.Option key={p._id} value={p._id}>
                                            <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{p.code}</span>
                                            {' - '}
                                            {p.name} ({p.type === 'percentage' ? `-${p.value}%` : `-${p.value.toLocaleString()}₫`})
                                            {!p.allowCombine && <Tag color="red" style={{marginLeft: 5}}>Riêng</Tag>}
                                        </Select.Option>
                                    ))
                                )}
                            </Select>
                            {promotionDiscount > 0 && (
                                <div style={{ color: 'green', fontSize: 12, textAlign: 'right', marginTop: 2 }}>
                                    - {promotionDiscount.toLocaleString()} ₫
                                </div>
                            )}
                        </div>
                     )}

                      {/* [NEW] LOYALTY POINTS */}
                      {/* Derived State for Conflict */}
                      {(() => {
                          const selectedPromo = promotions.find(p => p._id === selectedPromotionId);
                          const isConflict = selectedPromo && selectedPromo.allowCombine === false;
                          
                          return !invoice && customerPoints > 0 && (
                            <div style={{ width: '100%', background: isConflict ? '#f5f5f5' : '#fff7e6', padding: 8, borderRadius: 8, border: '1px solid #ffe7ba', opacity: isConflict ? 0.7 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong style={{ color: isConflict ? '#999' : '#d48806' }}>👑 Dùng điểm tích lũy</Text>
                                        {isConflict && <div style={{fontSize: 11, color: 'red'}}>Không áp dụng cùng mã này</div>}
                                    </div>
                                    <Switch size="small" checked={usePoints} onChange={setUsePoints} disabled={isConflict} />
                                </div>
                                
                                {usePoints && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                        <span>Dùng: <b>{pointsToRedeem}</b> điểm</span>
                                        <span>Giảm: <b>{(pointsToRedeem * POINT_VALUE).toLocaleString()}</b> ₫</span>
                                    </div>
                                    <Slider 
                                        min={0} 
                                        max={Math.min(customerPoints, Math.ceil(subTotal / POINT_VALUE))} // Cap at subtotal equivalent
                                        value={pointsToRedeem}
                                        onChange={setPointsToRedeem}
                                        step={1}
                                        trackStyle={{ backgroundColor: '#d48806' }}
                                        handleStyle={{ borderColor: '#d48806' }}
                                    />
                                    <InputNumber 
                                        size="small" 
                                        min={0} 
                                        max={customerPoints}
                                        value={pointsToRedeem} 
                                        onChange={setPointsToRedeem}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            )}
                        </div>
                          );
                      })()}

                     <Divider style={{ margin: '8px 0' }} />

                     <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Text>Giảm giá (VND):</Text>
                        <InputNumber 
                            min={0} 
                            value={discount} 
                            onChange={setDiscount} 
                            style={{ width: 110 }} 
                            disabled={!!invoice}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Text>Thuế (%):</Text>
                        <InputNumber min={0} max={100} value={taxRate} onChange={setTaxRate} style={{ width: 60 }} disabled={!!invoice} />
                    </div>

                    <Divider style={{ margin: '12px 0' }} />
                    
                    <div style={{ fontSize: 20 }}>
                        <Text strong>TỔNG CỘNG</Text><br/>
                        <Tag color="red" style={{ fontSize: 24, padding: '4px 12px', margin: 0, marginTop: 5 }}>
                            {finalTotal.toLocaleString()}
                        </Tag>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceModal;
