import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Typography, Modal, Form, Input, Select, Tag, Space, message, Switch, TimePicker, Divider, Row, Col } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import theme from '../../../theme';
import { resourceService } from '../../../services/resourceService';
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

// Dựa theo service.json hoặc constants
const PREDEFINED_SKILLS = [
  "Massage Body Thụy Điển", 
  "Chăm sóc da mặt chuyên sâu", 
  "Gội đầu dưỡng sinh",
  "Massage Thái",
  "Trị liệu cổ vai gáy"
];

const StaffManager = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Staff
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

  useEffect(() => {
    fetchStaff();
  }, []);

  // 2. Open Modal
  const handleEdit = (record) => {
    setEditingStaff(record);
    
    // Prepare Shifts Data for Form
    // Default shift nếu chưa có: 9h-18h các ngày
    let shiftsForm = {};
    DAYS_OF_WEEK.forEach(d => {
        const existShift = record.shifts?.find(s => s.dayOfWeek === d.val);
        shiftsForm[`shift_${d.val}_active`] = existShift ? !existShift.isOff : true;
        shiftsForm[`shift_${d.val}_start`] = existShift ? dayjs(existShift.startTime, 'HH:mm') : dayjs('09:00', 'HH:mm');
        shiftsForm[`shift_${d.val}_end`] = existShift ? dayjs(existShift.endTime, 'HH:mm') : dayjs('18:00', 'HH:mm');
    });

    form.setFieldsValue({
        skills: record.skills || [],
        isActive: record.isActive,
        ...shiftsForm
    });
    
    setIsModalOpen(true);
  };

  // 3. Submit
  const handleSubmit = async (values) => {
      setSubmitting(true);
      
      // Convert Form Data back to Schema
      const shifts = DAYS_OF_WEEK.map(d => ({
          dayOfWeek: d.val,
          isOff: !values[`shift_${d.val}_active`],
          startTime: values[`shift_${d.val}_start`].format('HH:mm'),
          endTime: values[`shift_${d.val}_end`].format('HH:mm')
      }));

      const updateData = {
          skills: values.skills,
          isActive: values.isActive,
          shifts: shifts
      };

      const res = await resourceService.updateStaff(editingStaff._id, updateData);
      setSubmitting(false);

      if (res.success) {
          message.success('Cập nhật nhân viên thành công');
          setIsModalOpen(false);
          fetchStaff();
      } else {
          message.error('Lỗi cập nhật');
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
        title: 'Kỹ năng (Skills)',
        dataIndex: 'skills',
        key: 'skills',
        render: (skills) => (
            <div>
                {skills && skills.length > 0 ? skills.map(s => (
                    <Tag key={s} color="blue">{s}</Tag>
                )) : <Text type="secondary">Chưa có kỹ năng</Text>}
            </div>
        )
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
         <div style={{ marginBottom: '24px' }}>
             <Title level={2} style={{ fontFamily: theme.fonts.heading, marginBottom: 0 }}>Quản Lý Nhân Sự</Title>
             <Text type="secondary">Thiết lập Ca làm việc (Shifts) và Kỹ năng (Skills)</Text>
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
            title={`Thiết lập: ${editingStaff?.name}`}
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
                 
                 <Form.Item name="isActive" label="Trạng thái làm việc" valuePropName="checked">
                     <Switch checkedChildren="Đang làm" unCheckedChildren="Đã nghỉ" />
                 </Form.Item>

                 <Form.Item name="skills" label="Kỹ năng tay nghề">
                     <Select mode="multiple" placeholder="Chọn các dịch vụ nhân viên này làm được" size="large">
                         {PREDEFINED_SKILLS.map(s => <Option key={s} value={s}>{s}</Option>)}
                     </Select>
                 </Form.Item>

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
