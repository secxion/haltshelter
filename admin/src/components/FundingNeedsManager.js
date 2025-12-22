import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, InputNumber, Select, Switch, message, Popconfirm, Tag, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import { apiService } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const FundingNeedsManager = () => {
  const [fundingNeeds, setFundingNeeds] = useState([]);
  const [impactStats, setImpactStats] = useState({
    rescuedThisMonth: 0,
    adoptionsThisMonth: 0,
    medicalTreatments: 0,
    spayNeuterCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingStats, setSavingStats] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch funding needs
      const needsRes = await apiService.admin.getFundingNeeds();
      setFundingNeeds(needsRes.data?.fundingNeeds || []);
      
      // Fetch impact stats
      const statsRes = await apiService.admin.getImpactStats();
      if (statsRes.data?.stats) {
        setImpactStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'regular',
      isActive: true,
      priority: 0,
      currentAmount: 0
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await apiService.admin.deleteFundingNeed(id);
      message.success('Funding need deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      message.error('Failed to delete');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingItem) {
        await apiService.admin.updateFundingNeed(editingItem._id, values);
        message.success('Funding need updated');
      } else {
        await apiService.admin.createFundingNeed(values);
        message.success('Funding need created');
      }
      
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      message.error(error.response?.data?.error || 'Failed to save');
    }
  };

  const handleImpactStatsChange = (field, value) => {
    setImpactStats(prev => ({
      ...prev,
      [field]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleSaveImpactStats = async () => {
    setSavingStats(true);
    try {
      await apiService.admin.updateImpactStats(impactStats);
      message.success('Impact stats updated');
    } catch (error) {
      console.error('Error saving impact stats:', error);
      message.error('Failed to save impact stats');
    } finally {
      setSavingStats(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <span className="font-semibold">{text}</span>
          {!record.isActive && <Tag color="red" className="ml-2">Inactive</Tag>}
        </div>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'emergency' ? 'red' : 'blue'}>
          {type === 'emergency' ? '🚨 Emergency' : '📋 Regular'}
        </Tag>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        const percent = Math.min(100, Math.round((record.currentAmount / record.goalAmount) * 100));
        return (
          <div style={{ width: 150 }}>
            <Progress 
              percent={percent} 
              size="small" 
              status={percent >= 100 ? 'success' : 'active'}
            />
            <div className="text-xs text-gray-500">
              ${record.currentAmount.toLocaleString()} / ${record.goalAmount.toLocaleString()}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (p) => <span className="font-mono">{p}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this funding need?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Impact Stats Section */}
      <Card 
        title={<span><DollarOutlined className="mr-2" />Donate Page - Recent Impact Stats</span>}
        extra={
          <Button type="primary" onClick={handleSaveImpactStats} loading={savingStats}>
            Save Impact Stats
          </Button>
        }
      >
        <p className="text-gray-600 mb-4">
          These stats are shown on the Donate page under "Recent Impact"
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Animals Rescued This Month
            </label>
            <InputNumber
              value={impactStats.rescuedThisMonth}
              onChange={(v) => handleImpactStatsChange('rescuedThisMonth', v)}
              min={0}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Successful Adoptions
            </label>
            <InputNumber
              value={impactStats.adoptionsThisMonth}
              onChange={(v) => handleImpactStatsChange('adoptionsThisMonth', v)}
              min={0}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical Treatments Provided
            </label>
            <InputNumber
              value={impactStats.medicalTreatments}
              onChange={(v) => handleImpactStatsChange('medicalTreatments', v)}
              min={0}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Community Pets Spayed/Neutered
            </label>
            <InputNumber
              value={impactStats.spayNeuterCount}
              onChange={(v) => handleImpactStatsChange('spayNeuterCount', v)}
              min={0}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Funding Needs Section */}
      <Card 
        title="Current Funding Needs"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add Funding Need
          </Button>
        }
      >
        <p className="text-gray-600 mb-4">
          Manage the funding needs shown on the Donate page. Emergency needs appear when users select "Emergency Fund".
        </p>
        <Table
          dataSource={fundingNeeds}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingItem ? 'Edit Funding Need' : 'Add Funding Need'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="e.g., Winter Shelter Upgrades" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea 
              placeholder="e.g., Heating system and insulation improvements" 
              maxLength={500}
              rows={3}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="goalAmount"
              label="Goal Amount ($)"
              rules={[{ required: true, message: 'Please enter goal amount' }]}
            >
              <InputNumber min={1} className="w-full" placeholder="15000" />
            </Form.Item>

            <Form.Item
              name="currentAmount"
              label="Current Amount ($)"
            >
              <InputNumber min={0} className="w-full" placeholder="0" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="regular">📋 Regular</Option>
                <Option value="emergency">🚨 Emergency</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority (higher = shown first)"
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FundingNeedsManager;
