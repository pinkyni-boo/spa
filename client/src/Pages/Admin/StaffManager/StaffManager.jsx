import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, Select, Tag, Space, message, Switch, TimePicker, Divider, Row, Col } from 'antd';
import { EditOutlined, UserOutlined, PhoneOutlined, ShopOutlined, PlusOutlined } from '@ant-design/icons';
import theme from '../../../theme';
import { resourceService } from '../../../services/resourceService';
import { branchService } from '../../../services/branchService'; // [NEW]
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const DAYS_OF_WEEK = [
  { val: 1, label: 'Thứ 2' },
  { val: 2, label: 'Thứ 3' },
  { val: 3, label: 'Thứ 4' },
  { val: 4, label: 'Thứ 5' },
  { val: 5, label: 'Thứ 6' },
  { val: 6, label: 'Thứ 7' },
  { val: 0, label: 'Chủ Nhật' },
];

const StaffManager = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [branches, setBranches] = useState([]); // [NEW]
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Staff & Branches
  const fetchStaff = async () => {
    setLoading(true);
    const res = await resourceService.getAllStaff();
    if (res.success) {
        setStaffList(res.staff);
    } else {
        message.error('Lỗi tải danh sách nhân viên');
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
    fetchStaff();
    fetchBranches();
  }, []);

  // 2. Handle Add New Staff
  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    
    // Set default shifts for new staff (Mon-Sat, 9-18)
    let defaultShifts = {};
    DAYS_OF_WEEK.forEach(d => {
        defaultShifts[`shift_${d.val}_active`] = d.val !== 0; // Sunday off
        defaultShifts[`shift_${d.val}_start`] = dayjs('09:00', 'HH:mm');
        defaultShifts[`shift_${d.val}_end`] = dayjs('18:00', 'HH:mm');
    });
    
    form.setFieldsValue({
        isActive: true,
        ...defaultShifts
    });
    
    setIsModalOpen(true);
  };

  // 3. Open Modal for Edit
  const handleEdit = (record) => {
    setEditingStaff(record);
    
    // Prepare Shifts Data for Form
    let shiftsForm = {};
    DAYS_OF_WEEK.forEach(d => {
        const existShift = record.shifts?.find(s => s.dayOfWeek === d.val);
        shiftsForm[`shift_${d.val}_active`] = existShift ? !existShift.isOff : true;
        shiftsForm[`shift_${d.val}_start`] = existShift ? dayjs(existShift.startTime, 'HH:mm') : dayjs('09:00', 'HH:mm');
        shiftsForm[`shift_${d.val}_end`] = existShift ? dayjs(existShift.endTime, 'HH:mm') : dayjs('18:00', 'HH:mm');
    });

    form.setFieldsValue({
        name: record.name,        // [NEW]
        phone: record.phone,      // [NEW]
        branchId: record.branchId?._id || record.branchId, // [NEW] - Handle populated or ID
        role: record.role || 'ktv', // [NEW] Load role
        isActive: record.isActive,
        ...shiftsForm
    });
    
    setIsModalOpen(true);
  };

  // 3. Submit (Create or Update)
  const handleSubmit = async (values) => {
      setSubmitting(true);
      
      const shifts = DAYS_OF_WEEK.map(d => ({
          dayOfWeek: d.val,
          isOff: !values[`shift_${d.val}_active`],
          startTime: values[`shift_${d.val}_start`]?.format('HH:mm') || '09:00',
          endTime: values[`shift_${d.val}_end`]?.format('HH:mm') || '18:00'
      }));

      const staffData = {
          name: values.name,
          phone: values.phone,
          branchId: values.branchId,
          role: values.role || 'ktv', // [NEW] Include role
          isActive: values.isActive,
          shifts: shifts
      };

      let res;
      if (editingStaff) {
          // Update existing staff
          res = await resourceService.updateStaff(editingStaff._id, staffData);
      } else {
          // Create new staff
          res = await resourceService.createStaff(staffData);
      }
      
      setSubmitting(false);

      if (res.success) {
          message.success(editingStaff ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công');
          setIsModalOpen(false);
          fetchStaff();
      } else {
          message.error(res.message || 'Lỗi thao tác');
      }
  };

  const columns = [
    {
        title: 'Nhân viên',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <Space><UserOutlined /><Text strong>{text}</Text></Space>
    },
    {
        title: 'SĐT',
        dataIndex: 'phone',
        key: 'phone',
        render: (text) => text ? <Space><PhoneOutlined />{text}</Space> : <Text type="secondary">---</Text>
    },
    {
        title: 'Chi Nhánh',
        dataIndex: 'branchId',
        key: 'branchId',
        render: (branch) => branch ? <Tag icon={<ShopOutlined />} color="gold">{branch.name || 'Chi nhánh'}</Tag> : <Text type="secondary">Chưa gán</Text>
    },
    {
        title: 'Chức vụ',
        dataIndex: 'role',
        key: 'role',
        render: (role) => {
            const roleConfig = {
                ktv: { color: 'default', text: 'KTV' },
                admin: { color: 'blue', text: 'ADMIN (Quản lý)' },
                owner: { color: 'gold', text: 'OWNER' }
            };
            const config = roleConfig[role] || roleConfig.ktv;
            return <Tag color={config.color}>{config.text}</Tag>;
        }
    },
    {
        title: 'Trạng thái',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (active) => <Tag color={active ? 'success' : 'default'}>{active ? 'Đang làm việc' : 'Nghỉ việc'}</Tag>
    },
    {
        title: '',
        key: 'action',
        render: (_, record) => (
            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Thiết lập</Button>
        )
    }
  ];

  return (
     <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FA' }}>
         <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                 <Title level={2} style={{ fontFamily: theme.fonts.heading, marginBottom: 0 }}>Quản Lý Nhân Sự</Title>
                 <Text type="secondary">Thiết lập Ca làm việc và Thông tin nhân viên</Text>
             </div>
             <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: theme.colors.primary[600] }}>
                 Thêm Nhân Viên
             </Button>
         </div>

         <Card bordered={false} style={{ borderRadius: theme.borderRadius.md }}>
             <Table 
                columns={columns} 
                dataSource={staffList} 
                rowKey="_id" 
                loading={loading}
             />
         </Card>

         <Modal
            title={editingStaff ? `Thiết lập: ${editingStaff.name}` : "Thêm Nhân Viên Mới"}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            width={700}
            className="staff-manager-modal"
         >
             <style>{`
                 .staff-manager-modal .ant-input { color: #000 !important; }
                 .staff-manager-modal .ant-select-selector { color: #000 !important; }
                 .staff-manager-modal .ant-picker-input > input { color: #000 !important; }
             `}</style>
             <Form form={form} layout="vertical" onFinish={handleSubmit}>
                 
                 <Row gutter={16}>
                     <Col span={12}>
                        <Form.Item name="name" label="Tên nhân viên" rules={[{ required: true }]}>
                            <Input prefix={<UserOutlined />} />
                        </Form.Item>
                     </Col>
                     <Col span={12}>
                        <Form.Item name="phone" label="Số điện thoại">
                            <Input prefix={<PhoneOutlined />} />
                        </Form.Item>
                     </Col>
                 </Row>

                 <Row gutter={16}>
                     <Col span={12}>
                        <Form.Item name="branchId" label="Chi Nhánh Làm Việc">
                             <Select placeholder="Chọn chi nhánh">
                                 {branches.map(b => (
                                     <Option key={b._id} value={b._id}>{b.name}</Option>
                                 ))}
                             </Select>
                        </Form.Item>
                     </Col>
                     <Col span={12}>
                        <Form.Item name="role" label="Chức vụ" initialValue="ktv">
                             <Select>
                                 <Option value="ktv">KTV (Nhân viên)</Option>
                                 <Option value="admin">ADMIN (Quản lý)</Option>
                                 <Option value="owner">OWNER (Chủ)</Option>
                             </Select>
                        </Form.Item>
                     </Col>
                     <Col span={12}>
                        <Form.Item name="isActive" label="Trạng thái làm việc" valuePropName="checked">
                             <Switch checkedChildren="Đang làm" unCheckedChildren="Đã nghỉ" />
                        </Form.Item>
                     </Col>
                 </Row>

                 <Divider>Ca Làm Việc (Shifts)</Divider>
                 <Text type="secondary" style={{ display: 'block', marginBottom: 15 }}>Chọn ngày làm việc và giờ bắt đầu/kết thúc.</Text>

                 {DAYS_OF_WEEK.map(day => (
                     <div key={day.val} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                         <div style={{ width: 80, fontWeight: 600 }}>{day.label}</div>
                         <Form.Item name={`shift_${day.val}_active`} valuePropName="checked" style={{ marginBottom: 0 }}>
                             <Switch size="small" />
                         </Form.Item>
                         
                         <Form.Item 
                            noStyle 
                            shouldUpdate={(prev, curr) => prev[`shift_${day.val}_active`] !== curr[`shift_${day.val}_active`]}
                         >
                             {({ getFieldValue }) => {
                                 const isActive = getFieldValue(`shift_${day.val}_active`);
                                 return isActive ? (
                                     <Space>
                                         <Form.Item name={`shift_${day.val}_start`} style={{ marginBottom: 0 }} initialValue={dayjs('09:00', 'HH:mm')}>
                                             <TimePicker format="HH:mm" style={{ width: 100 }} allowClear={false} />
                                         </Form.Item>
                                         <Text>-</Text>
                                         <Form.Item name={`shift_${day.val}_end`} style={{ marginBottom: 0 }} initialValue={dayjs('18:00', 'HH:mm')}>
                                            <TimePicker format="HH:mm" style={{ width: 100 }} allowClear={false} />
                                         </Form.Item>
                                     </Space>
                                 ) : <Text type="secondary" italic>Nghỉ</Text>;
                             }}
                         </Form.Item>
                     </div>
                 ))}

                 <div style={{ textAlign: 'right', marginTop: 20 }}>
                     <Button type="primary" htmlType="submit" loading={submitting}>Lưu Cài Đặt</Button>
                 </div>
             </Form>
         </Modal>
    </div>
  );
};

export default StaffManager;
