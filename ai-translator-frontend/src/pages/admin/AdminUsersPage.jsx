import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAdminUsers } from '../../api/authApi';
import './admin.css';

function getResolvedJoinDate(email) {
  try {
    const dates = JSON.parse(localStorage.getItem('voxai_user_join_dates') || '{}');
    if (!dates[email]) {
      dates[email] = new Date().toISOString().slice(0, 10);
      localStorage.setItem('voxai_user_join_dates', JSON.stringify(dates));
    }
    return dates[email];
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => {
        const mapped = data.map((u) => ({
          ...u,
          date: getResolvedJoinDate(u.email),
          fullName: u.fullName || u.name || 'Anonymous User'
        }));
        setUsers(mapped);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleDelete = (email) => {
    // Client-side removal — wire to backend DELETE endpoint when available
    setUsers((prev) => prev.filter((u) => u.email !== email));
    setConfirmDelete(null);
  };

  const handleRoleToggle = (email) => {
    // Client-side toggle — wire to backend PATCH endpoint when available
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
          : u
      )
    );
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          User Management
        </motion.h1>
        <p>Search, manage roles, and moderate platform users</p>
      </header>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h3>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</h3>
          <div className="admin-search-input">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-line w60" /></td>
                    <td><div className="skeleton-line w80" /></td>
                    <td><div className="skeleton-line w40" /></td>
                    <td><div className="skeleton-line w40" /></td>
                    <td><div className="skeleton-line w40" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="admin-empty-state">
                      <div className="empty-icon">👤</div>
                      <h3>{search ? 'No matches found' : 'No users registered'}</h3>
                      <p>{search ? 'Try a different search term' : 'Users will appear here once they register'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((u, i) => (
                    <motion.tr
                      key={u.email || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    >
                      <td className="user-name">{u.fullName}</td>
                      <td className="user-email">{u.email}</td>
                      <td>{u.date}</td>
                      <td>
                        <span className={`admin-role-badge ${u.role || 'user'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-action-btn"
                          onClick={() => handleRoleToggle(u.email)}
                        >
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        {confirmDelete === u.email ? (
                          <>
                            <button
                              type="button"
                              className="admin-action-btn danger"
                              onClick={() => handleDelete(u.email)}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => setConfirmDelete(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-btn danger"
                            onClick={() => setConfirmDelete(u.email)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
