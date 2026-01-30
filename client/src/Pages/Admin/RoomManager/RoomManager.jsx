import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, Select, InputNumber, Tag, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, ShopOutlined } from '@ant-design/icons';
import theme from '../../../theme';
import { resourceService } from '../../../services/resourceService';
import { branchService } from '../../../services/branchService'; // [NEW]

const { Title, Text } = Typography;
const { Option } = Select;

const RoomManager = () => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [branches, setBranches] = useState([]); // [NEW]
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null); // Nếu null là mode Add, có data là mode Edit
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchRooms = async () => {
    setLoading(true);
    const data = await resourceService.getAllRooms();
    if (data.success) {
        setRooms(data.rooms);
    } else {
        message.error('Không thể lấy danh sách phòng');
    }
    setLoading(false);
  };

  const fetchBranches = async () => {
      const res = await branchService.getAllBranches();
      if (res.success) {
          setBranches(res.branches || []);
      }
  };

  useEffect(() => {
    fetchRooms();
    fetchBranches();
  }, []);

  // 2. Handle Actions
  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({
        ...record,
        branchId: record.branchId?._id || record.branchId // Handle populated or ID
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      const res = await resourceService.deleteRoom(id);
      if(res.success) {
          message.success('Đã xóa phòng!');
          fetchRooms();
      } else {
          message.error(res.message);
      }
  };

  const handleSubmit = async (values) => {
      setSubmitting(true);
      
      let res;
      if (editingRoom) {
          res = await resourceService.updateRoom(editingRoom._id, values);
      } else {
          res = await resourceService.createRoom(values);
      }

      setSubmitting(false);

      if (res.success) {
          message.success(editingRoom ? 'Cập nhật thành công' : 'Thêm phòng thành công');
          setIsModalOpen(false);
          fetchRooms();
      } else {
          message.error(res.message);
      }
  };

  // 3. Columns
  const columns = [
    {
      title: 'Tên Phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ fontSize: '15px', color: '#333' }}>{text}</Text>
    },
    {
       title: 'Loại Phòng',
       dataIndex: 'type',
       key: 'type',
       render: (type) => {
           let color = 'default';
           if (type === 'VIP' || type === 'HEAD_SPA') color = 'gold';
           if (type === 'Couple' || type === 'BODY_SPA') color = 'blue';
           if (type === 'NAIL_SPA') color = 'magenta';
           
           const label = type === 'BODY_SPA' ? 'Body' : type === 'HEAD_SPA' ? 'Gội' : type === 'NAIL_SPA' ? 'Nail' : type;
           return <Tag color={color}>{label.toUpperCase()}</Tag>
       }
    },
    {
        title: 'Chi Nhánh',
        dataIndex: 'branchId',
        key: 'branchId',
        render: (branch) => branch ? <Tag icon={<ShopOutlined />} color="purple">{branch.name || 'Chi nhánh'}</Tag> : <Text type="secondary">Chưa gán</Text>
    },
    {
        title: 'Sức chứa',
        dataIndex: 'capacity',
        key: 'capacity',
        render: (val) => <Text style={{ color: '#333' }}>{val} giường</Text>
    },
    {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (active) => <Tag color={active ? 'success' : 'error'}>{active ? 'Sẵn sàng' : 'Bảo trì'}</Tag>
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (_, record) => (
            <Space>
                <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                <Popconfirm title="Xóa phòng này?" onConfirm={() => handleDelete(record._id)}>
                    <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        )
    }
  ];

  return (
    <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FA' }}>
         {/* Header */}
         <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                 <Title level={2} style={{ fontFamily: theme.fonts.heading, marginBottom: 0 }}>Quản Lý Phòng</Title>
                 <Text type="secondary">Thiết lập danh sách giường và phòng spa</Text>
            </div>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: theme.colors.primary[600] }}>
                Thêm Phòng Mới
            </Button>
         </div>

         {/* Table Card */}
         <Card bordered={false} style={{ borderRadius: theme.borderRadius.md, boxShadow: theme.shadows.soft }}>
             <Table 
                columns={columns} 
                dataSource={rooms} 
                rowKey="_id" 
                loading={loading}
             />
         </Card>

         {/* Modal Upsert */}
         <Modal
            title={editingRoom ? "Chỉnh sửa Phòng" : "Thêm Phòng Mới"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            className="room-manager-modal"
         >
             <style>{`
                 .room-manager-modal .ant-input { color: #000 !important; background: #fff !important; border-color: #d9d9d9 !important; }
                 .room-manager-modal .ant-input-number-input { color: #000 !important; }
                 .room-manager-modal .ant-select-selector { color: #000 !important; background: #fff !important; }
                 .room-manager-modal .ant-select-selection-item { color: #000 !important; }
             `}</style>
             <Form form={form} layout="vertical" onFinish={handleSubmit}>
                 <Form.Item name="name" label="Tên Phòng" rules={[{ required: true, message: 'Nhập tên phòng' }]}>
                     <Input prefix={<HomeOutlined />} placeholder="VD: Phòng Body, Phòng Gội..." size="large"/>
                 </Form.Item>

                 <Form.Item name="branchId" label="Chi Nhánh" rules={[{ required: true, message: 'Chọn chi nhánh' }]}>
                     <Select placeholder="Chọn chi nhánh" size="large">
                         {branches.map(b => (
                             <Option key={b._id} value={b._id}>{b.name}</Option>
                         ))}
                     </Select>
                 </Form.Item>

                 <Form.Item name="type" label="Loại phòng" rules={[{ required: true }]}>
                     <Select size="large">
                         <Option value="BODY_SPA">Body Spa</Option>
                         <Option value="HEAD_SPA">Head Spa (Gội đầu)</Option>
                         <Option value="NAIL_SPA">Nail Spa</Option>
                         <Option value="OTHER">Khác</Option>
                     </Select>
                 </Form.Item>

                 <Form.Item name="capacity" label="Sức chứa (Số giường)" rules={[{ required: true }]}>
                     <InputNumber min={1} max={10} style={{ width: '100%' }} size="large" />
                 </Form.Item>

                 <Form.Item name="description" label="Mô tả (Tùy chọn)">
                     <Input.TextArea rows={2} placeholder="Ghi chú về phòng..." size="large" />
                 </Form.Item>

                 {editingRoom && (
                     <Form.Item name="isActive" label="Trạng thái">
                         <Select size="large">
                             <Option value={true}>Sẵn sàng đón khách</Option>
                             <Option value={false}>Đang bảo trì / Dọn dẹp</Option>
                         </Select>
                     </Form.Item>
                 )}

                 <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
                     <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Hủy</Button>
                     <Button type="primary" htmlType="submit" loading={submitting}>Lưu Thông Tin</Button>
                 </Form.Item>
             </Form>
         </Modal>
    </div>
  );
};

export default RoomManager;
