import React, { useEffect, useState } from 'react';
import { apiService, handleApiError } from '../services/api';

// Must match backend allowed roles
const roles = ['admin', 'staff', 'volunteer-coordinator', 'veterinarian', 'user'];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'staff', password: '' });

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.users.getAll();
      // Defensive: always set users as array
      let usersArr = [];
      if (res.data && Array.isArray(res.data.users)) {
        usersArr = res.data.users;
      } else if (res.data && res.data.users) {
        usersArr = [res.data.users];
      }
      setUsers(usersArr);
    } catch (err) {
      setError(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role,
      password: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await apiService.users.delete(id);
      fetchUsers();
    } catch (err) {
      setError(handleApiError(err).message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setError('First name and last name are required.');
        return;
      }
      if (editingUser) {
        await apiService.users.update(editingUser._id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role
        });
      } else {
        await apiService.users.create({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
          password: form.password
        });
      }
      setEditingUser(null);
      setForm({ firstName: '', lastName: '', email: '', role: 'staff', password: '' });
      fetchUsers();
    } catch (err) {
      // Show detailed backend error if available
      const apiErr = handleApiError(err);
      if (apiErr.data && apiErr.data.errors && Array.isArray(apiErr.data.errors)) {
        setError(apiErr.data.errors.map(e => e.msg).join(' | '));
      } else if (apiErr.data && apiErr.data.error) {
        setError(apiErr.data.error);
      } else {
        setError(apiErr.message);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form className="bg-white rounded shadow p-4 mb-8 flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input type="text" placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input" required />
          <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input" required />
        </div>
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" required />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input">
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {!editingUser && (
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" required />
        )}
        <button className="btn-primary w-max" type="submit">{editingUser ? 'Update User' : 'Add User'}</button>
        {editingUser && <button type="button" className="btn-secondary w-max" onClick={() => { setEditingUser(null); setForm({ firstName: '', lastName: '', email: '', role: 'staff', password: '' }); }}>Cancel</button>}
      </form>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4">Name</th>
            <th className="py-2 px-4">Email</th>
            <th className="py-2 px-4">Role</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-4">No users found.</td></tr>
          ) : users.map(user => (
            <tr key={user._id}>
              <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4 flex gap-2">
                <button className="btn-secondary" onClick={() => handleEdit(user)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
