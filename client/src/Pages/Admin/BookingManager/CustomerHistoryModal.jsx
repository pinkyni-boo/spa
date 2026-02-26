import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Typography, App } from 'antd';
import dayjs from 'dayjs';
import { adminBookingService } from '../../../services/adminBookingService';

const { Text } = Typography;

const CustomerHistoryModal = ({ visible, onClose, customerPhone, customerName }) => {
    const { message } = App.useApp();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && customerPhone) {
            fetchHistory();
        }
    }, [visible, customerPhone]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await adminBookingService.getCustomerHistory(customerPhone);
            // Sort Descending (Newest first)
            const sorted = Array.isArray(data) ? data.sort((a,b) => new Date(b.startTime) - new Date(a.startTime)) : [];
            setHistory(sorted);
        } catch (error) {
            message.error('Lỗi tải lịch sử');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'serviceId',
            key: 'serviceId',
            render: (s) => s?.name || '---'
        },
        {
            title: 'KTV',
            dataIndex: 'staffId',
            key: 'staffId',
            render: (s) => s?.name || '---'
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            render: (p) => p ? `${p.toLocaleString()} đ` : '-'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                let color = 'default';
                if(s==='completed') color='green';
                if(s==='cancelled') color='red';
                if(s==='processing') color='blue';
                return <Tag color={color}>{s.toUpperCase()}</Tag>;
            }
        }
    ];

    return (
        <Modal
            title={<>📜 Lịch sử khách hàng: <Text strong>{customerName || customerPhone}</Text></>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={750}
        >
            <Table 
                dataSource={history} 
                columns={columns} 
                rowKey="_id" 
                loading={loading}
                pagination={{ pageSize: 5 }}
                size="small"
            />
        </Modal>
    );
};

export default CustomerHistoryModal;
