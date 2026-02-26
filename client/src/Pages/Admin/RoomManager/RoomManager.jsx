import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, Select, InputNumber, Tag, Space, App, Popconfirm, Divider, List, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, ShopOutlined, BarsOutlined } from '@ant-design/icons';
import theme from '../../../theme';
import { resourceService } from '../../../services/resourceService';
import { branchService } from '../../../services/branchService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const { Title, Text } = Typography;
const { Option } = Select;

const RoomManager = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [branches, setBranches] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);

  // Room Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Bed Modal State
  const [isBedModalOpen, setIsBedModalOpen] = useState(false);
  const [bedModalRoom, setBedModalRoom] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [bedForm] = Form.useForm();
  const [bedSubmitting, setBedSubmitting] = useState(false);

  // 1. Fetch Data
  const fetchAll = async () => {
    setLoading(true);
    const [roomsData, bedsData] = await Promise.all([
      resourceService.getAllRooms(),
      resourceService.getAllBeds()
    ]);
    if (roomsData.success) setRooms(roomsData.rooms);
    if (bedsData.success) setBeds(bedsData.beds || []);
    setLoading(false);
  };

  const fetchBranches = async () => {
    const res = await branchService.getAllBranches();
    if (res.success) setBranches(res.branches || []);
  };

  const fetchServiceCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services?type=service`);
      const data = await res.json();
      if (data.success && data.services) {
        const cats = [...new Set(data.services.map(s => s.category).filter(c => c && c !== 'Other'))];
        setServiceCategories(cats.sort());
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchAll();
    fetchBranches();
    fetchServiceCategories();
  }, []);

  // Helper: beds for a specific room
  const bedsForRoom = (roomId) =>
    beds
      .filter(b => {
        const bRoomId = b.roomId?._id || b.roomId;
        return bRoomId === roomId;
      })
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // -------------------------------------------------------
  // ROOM ACTIONS
  // -------------------------------------------------------
  const handleAdd = () => { setEditingRoom(null); form.resetFields(); setIsModalOpen(true); };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue({ ...record, branchId: record.branchId?._id || record.branchId });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const res = await resourceService.deleteRoom(id);
    if (res.success) { message.success('Da xoa phong!'); fetchAll(); }
    else message.error(res.message);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const res = editingRoom
      ? await resourceService.updateRoom(editingRoom._id, values)
      : await resourceService.createRoom(values);
    setSubmitting(false);
    if (res.success) {
      message.success(editingRoom ? 'Cập nhật thành công' : 'Thêm phòng thành công');
      setIsModalOpen(false);
      fetchAll();
    } else message.error(res.message);
  };

  // -------------------------------------------------------
  // BED ACTIONS
  // -------------------------------------------------------
  const openBedManager = (room) => {
    setBedModalRoom(room);
    setEditingBed(null);
    bedForm.resetFields();
    setIsBedModalOpen(true);
  };

  const handleEditBed = (bed) => {
    setEditingBed(bed);
    bedForm.setFieldsValue({ name: bed.name, sortOrder: bed.sortOrder });
  };

  const handleDeleteBed = async (bedId) => {
    const res = await resourceService.deleteBed(bedId);
    if (res.success) { message.success('Đã xóa giường'); fetchAll(); }
    else message.error(res.message);
  };

  const handleBedSubmit = async (values) => {
    setBedSubmitting(true);
    let res;
    if (editingBed) {
      res = await resourceService.updateBed(editingBed._id, values);
    } else {
      res = await resourceService.createBed({
        ...values,
        roomId: bedModalRoom._id,
        branchId: bedModalRoom.branchId?._id || bedModalRoom.branchId
      });
    }
    setBedSubmitting(false);
    if (res.success) {
      message.success(editingBed ? 'Cập nhật giường thành công' : 'Thêm giường thành công');
      setEditingBed(null);
      bedForm.resetFields();
      fetchAll();
    } else message.error(res.message);
  };

  // -------------------------------------------------------
  // COLUMNS
  // -------------------------------------------------------
  const columns = [
    {
      title: 'Tên Phòng',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ fontSize: '15px', color: '#333' }}>{text}</Text>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colorMap = { BODY_SPA: 'blue', HEAD_SPA: 'gold', NAIL_SPA: 'purple', OTHER: 'default' };
        const labelMap = { BODY_SPA: 'Body Spa', HEAD_SPA: 'Head Spa', NAIL_SPA: 'Nail Spa', OTHER: 'Khác' };
        return <Tag color={colorMap[type] || 'default'}>{labelMap[type] || type || '—'}</Tag>;
      }
    },
    {
      title: 'Chi Nhánh',
      dataIndex: 'branchId',
      key: 'branchId',
      render: (branch) => branch
        ? <Tag icon={<ShopOutlined />} color="purple">{branch.name || 'Chi nhánh'}</Tag>
        : <Text type="secondary">Chưa gán</Text>
    },
    {
      title: 'Giường',
      dataIndex: '_id',
      key: 'beds',
      render: (id) => {
        const roomBeds = bedsForRoom(id);
        return roomBeds.length > 0
          ? <Tag color="green"><BarsOutlined /> {roomBeds.length} giường</Tag>
          : <Tag color="orange">Chưa có</Tag>;
      }
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
        <Space wrap>
          <Button size="small" icon={<BarsOutlined />} onClick={() => openBedManager(record)}>Giường</Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Xoa phong nay?" onConfirm={() => handleDelete(record._id)}>
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const currentRoomBeds = bedModalRoom ? bedsForRoom(bedModalRoom._id) : [];

  return (
    <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FA' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ fontFamily: theme.fonts.heading, marginBottom: 0 }}>
            Quản Lý Phòng &amp; Giường
          </Title>
          <Text type="secondary">Thiết lập phòng và từng giường — dữ liệu dùng cho lịch đặt chỗ</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: theme.colors.primary[600] }}>
          Thêm Phòng Mới
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: theme.borderRadius.md, boxShadow: theme.shadows.soft }}>
        <Table columns={columns} dataSource={rooms} rowKey="_id" loading={loading} />
      </Card>

      {/* ---- ROOM MODAL ---- */}
      <Modal
        title={editingRoom ? 'Chỉnh sửa Phòng' : 'Thêm Phòng Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="room-manager-modal"
      >
        <style>{`.room-manager-modal .ant-input,.room-manager-modal .ant-input-number-input{color:#000!important;background:#fff!important}.room-manager-modal .ant-select-selector,.room-manager-modal .ant-select-selection-item{color:#000!important;background:#fff!important}`}</style>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên Phòng" rules={[{ required: true, message: 'Nhập tên phòng' }]}>
            <Input prefix={<HomeOutlined />} placeholder="VD: Phong Body, Phong Goi..." size="large" />
          </Form.Item>
          <Form.Item name="branchId" label="Chi Nhánh" rules={[{ required: true, message: 'Chọn chi nhánh' }]}>
            <Select placeholder="Chọn chi nhánh" size="large">
              {branches.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Loại phòng" rules={[{ required: true, message: 'Chọn loại phòng' }]}>
            <Select size="large" placeholder="Chọn loại phòng">
              <Option value="BODY_SPA">Body Spa</Option>
              <Option value="HEAD_SPA">Head Spa (Gội đầu)</Option>
              <Option value="NAIL_SPA">Nail Spa</Option>
              <Option value="OTHER">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="capacity" label="Capacity (để Auto-create giường)" initialValue={1}>
            <InputNumber min={1} max={20} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={2} size="large" />
          </Form.Item>
          {editingRoom && (
            <Form.Item name="isActive" label="Trạng thái">
              <Select size="large">
                <Option value={true}>Sẵn sàng</Option>
                <Option value={false}>Bảo trì</Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item style={{ marginTop: 20, textAlign: 'right' }}>
            <Button onClick={() => setIsModalOpen(false)} style={{ marginRight: 8 }}>Huỷ</Button>
            <Button type="primary" htmlType="submit" loading={submitting}>Lưu</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* ---- BED MANAGER MODAL ---- */}
      <Modal
        title={<span><BarsOutlined /> Giường trong phòng: <b>{bedModalRoom?.name}</b></span>}
        open={isBedModalOpen}
        onCancel={() => { setIsBedModalOpen(false); setEditingBed(null); bedForm.resetFields(); }}
        footer={null}
        width={560}
        className="bed-manager-modal"
      >
        <style>{`.bed-manager-modal .ant-input,.bed-manager-modal .ant-input-number-input{color:#000!important;background:#fff!important}`}</style>

        <List
          size="small"
          dataSource={currentRoomBeds}
          locale={{ emptyText: 'Chưa có giường nào' }}
          renderItem={(bed) => (
            <List.Item
              actions={[
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEditBed(bed)} />,
                <Popconfirm title="Xoa giuong nay?" onConfirm={() => handleDeleteBed(bed._id)}>
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ]}
            >
              <Badge color={bed.isActive ? 'green' : 'red'} />
              <Text strong style={{ marginLeft: 8 }}>{bed.name}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>thứ tự {bed.sortOrder}</Text>
            </List.Item>
          )}
        />

        <Divider>{editingBed ? `Sửa: ${editingBed.name}` : '+ Thêm giường mới'}</Divider>

        <Form form={bedForm} layout="inline" onFinish={handleBedSubmit} style={{ gap: 8 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Nhập tên' }]} style={{ flex: 1, minWidth: 150 }}>
            <Input placeholder="VD: Giường 1, Giường VIP..." />
          </Form.Item>
          <Form.Item name="sortOrder" initialValue={currentRoomBeds.length + 1} style={{ width: 80 }}>
            <InputNumber min={1} placeholder="Thu tu" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={bedSubmitting} icon={editingBed ? <EditOutlined /> : <PlusOutlined />}>
              {editingBed ? 'Lưu' : 'Thêm'}
            </Button>
            {editingBed && (
              <Button style={{ marginLeft: 4 }} onClick={() => { setEditingBed(null); bedForm.resetFields(); }}>Huỷ</Button>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManager;

