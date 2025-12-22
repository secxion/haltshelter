import React, { useState, useEffect } from 'react';
import { Card, Button, Form, message } from 'antd';
import { apiService } from '../../services/api';

const StatsManager = () => {
  const [stats, setStats] = useState({
    animalsRescued: 5,
    adoptionsThisMonth: 3,
    activeVolunteers: 1,
    livesTransformed: 1900
  });
  const [statsId, setStatsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.stats.get();
      console.debug('Stats GET response:', response);
      // Support response shapes: { stats: {...} } or direct object
      const fetched = response?.data?.stats ?? response?.data ?? null;
      if (fetched) {
        // Store the _id if present for updates
        if (fetched._id) {
          setStatsId(fetched._id);
          // Remove _id and __v from display stats
          const { _id, __v, ...displayStats } = fetched;
          setStats(displayStats);
        } else {
          setStats(fetched);
        }
      } else {
        console.warn('Unexpected stats response shape', response);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to load current stats');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // Only send the stats fields we actually want to update
      const updateData = {
        animalsRescued: stats.animalsRescued,
        adoptionsThisMonth: stats.adoptionsThisMonth,
        activeVolunteers: stats.activeVolunteers,
        livesTransformed: stats.livesTransformed
      };
      const response = await apiService.stats.update(updateData);
      console.debug('Stats UPDATE response:', response);
      message.success('Stats updated successfully');
      // Update local state with returned stats if present
      const updated = response?.data?.stats ?? response?.data ?? null;
      if (updated) {
        // Remove _id and __v from display stats
        const { _id, __v, ...displayStats } = updated;
        setStats(displayStats);
        if (_id) setStatsId(_id);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
      message.error('Failed to update stats');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    // Ensure number is not negative
    const numValue = Math.max(0, parseInt(value) || 0);
    setStats(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  return (
    <Card 
      title="Manage Homepage Statistics" 
      loading={loading}
      extra={
        <Button 
          type="primary" 
          onClick={handleSubmit} 
          loading={saving}
        >
          Save Changes
        </Button>
      }
    >
      <Form layout="vertical">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="Animals Rescued">
            <input
              type="number"
              value={stats.animalsRescued}
              onChange={(e) => handleChange('animalsRescued', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </Form.Item>

          <Form.Item label="Adoptions This Year">
            <input
              type="number"
              value={stats.adoptionsThisMonth}
              onChange={(e) => handleChange('adoptionsThisMonth', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </Form.Item>

          <Form.Item label="Active Volunteers">
            <input
              type="number"
              value={stats.activeVolunteers}
              onChange={(e) => handleChange('activeVolunteers', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </Form.Item>

          <Form.Item label="Lives Transformed">
            <input
              type="number"
              value={stats.livesTransformed}
              onChange={(e) => handleChange('livesTransformed', e.target.value)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </Form.Item>
        </div>

        <div className="mt-4 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">About These Statistics</h4>
          <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
            <li>Animals Rescued: Total number of animals taken into care</li>
            <li>Adoptions This Year: Successful adoptions in the current year</li>
            <li>Active Volunteers: Current number of active volunteers</li>
            <li>Lives Transformed: Total impact (animals + families helped)</li>
          </ul>
        </div>
      </Form>
    </Card>
  );
};

export default StatsManager;