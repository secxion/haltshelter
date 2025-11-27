import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Switch, message } from 'antd';
import { apiService } from '../../services/api';

const SponsorsManager = () => {
  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const res = await apiService.sponsors.getAll();
      const list = res?.data?.sponsors || res?.data || [];
      setSponsors(list);
    } catch (err) {
      console.error('Error fetching sponsors', err);
      message.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      website: record.website,
      logoUrl: record.logoUrl,
      featured: !!record.featured,
      notes: record.notes
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.sponsors.delete(id);
      message.success('Sponsor deleted');
      fetchSponsors();
    } catch (err) {
      console.error('Delete sponsor error', err);
      message.error('Failed to delete sponsor');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await apiService.sponsors.update(editing._id, values);
        message.success('Sponsor updated');
      } else {
        await apiService.sponsors.create(values);
        message.success('Sponsor created');
      }
      setModalVisible(false);
      fetchSponsors();
    } catch (err) {
      console.error('Save sponsor error', err);
      message.error('Failed to save sponsor');
    }
  };

  const cols = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Website', dataIndex: 'website', key: 'website', render: (v) => v || '—' },
    { title: 'Featured', dataIndex: 'featured', key: 'featured', render: (v) => (v ? 'Yes' : 'No') },
    { title: 'Actions', key: 'actions', render: (text, record) => (
      <div className="flex gap-2">
        <Button size="small" onClick={() => openEdit(record)}>Edit</Button>
        <Button size="small" danger onClick={() => handleDelete(record._id)}>Delete</Button>
      </div>
    ) }
  ];

  return (
    <Card title="Corporate Sponsors" extra={<Button type="primary" onClick={openCreate}>Add Sponsor</Button>}>
      <Table
        rowKey={(r) => r._id}
        columns={cols}
        dataSource={sponsors}
        loading={loading}
        pagination={{ pageSize: 6 }}
      />

      <Modal
        title={editing ? 'Edit Sponsor' : 'Create Sponsor'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="Logo URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SponsorsManager;
