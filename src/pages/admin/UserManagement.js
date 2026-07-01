import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

const ROLE_BADGE = {
  patient: 'bg-blue-100 text-blue-700',
  doctor:  'bg-green-100 text-green-700',
  admin:   'bg-purple-100 text-purple-700',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggle = async (userId, currentlyActive) => {
    if (!window.confirm(`${currentlyActive ? 'Deactivate' : 'Activate'} this user?`)) return;
    setActionId(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      toast.success(`User ${currentlyActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Deactivate account for "${name}"? They will not be able to log in.`)) return;
    setActionId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500 text-sm mt-1">View, search, and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
            placeholder="Search by name or email..."
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="">All Roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>

        <button onClick={fetchUsers} className="btn-primary px-5 text-sm">
          Search
        </button>

        <span className="text-sm text-gray-500 ml-auto">{users.length} user{users.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No users found</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_BADGE[u.role]}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(u._id, u.isActive)}
                            disabled={actionId === u._id}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                              u.isActive
                                ? 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                                : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                            }`}
                          >
                            {actionId === u._id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={actionId === u._id}
                            className="text-xs px-3 py-1.5 rounded-lg border font-medium text-red-600 bg-red-50 border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
