import React, { useState, useEffect } from 'react';
import { apiService, handleApiError, authHelpers } from '../services/api';

const Settings = () => {

  // State
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [org, setOrg] = useState({ name: '', contact: '', address: '', logo: '' });
  const [adminKey, setAdminKey] = useState('********');
  const [notifications, setNotifications] = useState({ email: true, system: true });
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authHelpers.getUser();

  // Fetch all settings on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        // Admin profile
        if (user && user.id) {
          const res = await apiService.users.getById(user.id);
          setProfile({ name: res.data.firstName + ' ' + res.data.lastName, email: res.data.email });
        }
        // Org info
        const orgRes = await apiService.orgSettings.get();
        setOrg(orgRes.data);
        // Admin key
        try {
          const keyRes = await apiService.adminKey.get();
          setAdminKey(keyRes.data.adminKey ? keyRes.data.adminKey : '********');
        } catch (e) {
          setAdminKey('********');
        }
        // Notification preferences
        try {
          const notifRes = await apiService.notificationSettings.get();
          setNotifications({ email: notifRes.data.email, system: notifRes.data.system });
        } catch (e) {
          setNotifications({ email: true, system: true });
        }
      } catch (err) {
        setError(handleApiError(err).message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line
  }, []);

  // Handlers
  const handleProfileSave = async () => {
    setError('');
    try {
      if (!user || !user.id) return;
      const [firstName, ...lastArr] = profile.name.split(' ');
      const lastName = lastArr.join(' ');
      await apiService.users.update(user.id, { firstName, lastName, email: profile.email });
      alert('Profile updated!');
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  const handleOrgSave = async () => {
    setError('');
    try {
      await apiService.orgSettings.update(org);
      alert('Organization info updated!');
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  // Regenerate key: for now, just alert user to run script (future: implement endpoint)
  const handleKeyRegenerate = () => {
    alert('To regenerate the admin key, run the set-admin-key.js script on the server.');
  };

  const handleNotificationsSave = async () => {
    setError('');
    try {
      await apiService.notificationSettings.update(notifications);
      alert('Notification preferences updated!');
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  const handleThemeChange = () => {
    // Just update local state for now
    alert('Theme preference saved (local only).');
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      {loading && <div className="mb-4 text-gray-500">Loading...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {/* Admin Profile */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Admin Profile</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
          <input type="text" placeholder="Name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input" />
          <input type="email" placeholder="Email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="input" />
          <button className="btn-primary w-max" onClick={handleProfileSave}>Save Profile</button>
        </div>
      </section>

      {/* Organization Info */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Organization Info</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
          <input type="text" placeholder="Shelter Name" value={org.name || ''} onChange={e => setOrg({ ...org, name: e.target.value })} className="input" />
          <input type="text" placeholder="Contact" value={org.contact || ''} onChange={e => setOrg({ ...org, contact: e.target.value })} className="input" />
          <input type="text" placeholder="Address" value={org.address || ''} onChange={e => setOrg({ ...org, address: e.target.value })} className="input" />
          <input type="text" placeholder="Logo URL" value={org.logo || ''} onChange={e => setOrg({ ...org, logo: e.target.value })} className="input" />
          <button className="btn-primary w-max" onClick={handleOrgSave}>Save Organization</button>
        </div>
      </section>

      {/* API/Admin Key Management */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">API / Admin Key</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
          <input type="text" value={adminKey} readOnly className="input font-mono" />
          <button className="btn-secondary w-max" onClick={handleKeyRegenerate}>Regenerate Key</button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Notification Preferences</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifications.email} onChange={e => setNotifications({ ...notifications, email: e.target.checked })} />
            Email Alerts
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifications.system} onChange={e => setNotifications({ ...notifications, system: e.target.checked })} />
            System Messages
          </label>
          <button className="btn-primary w-max" onClick={handleNotificationsSave}>Save Preferences</button>
        </div>
      </section>

      {/* System Preferences */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">System Preferences</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col gap-3">
          <label className="flex items-center gap-2">
            Theme:
            <select value={theme} onChange={e => setTheme(e.target.value)} className="input">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <button className="btn-primary w-max" onClick={handleThemeChange}>Apply Theme</button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
