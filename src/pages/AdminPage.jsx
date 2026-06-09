import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchAdminUsers } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground/AnimatedBackground';
import './OverlayPage.css';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchAdminUsers().then(setUsers);
  }, [user, navigate]);

  return (
    <motion.div
      className="overlay-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatedBackground />
      <button type="button" className="overlay-back" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>
      <h2 className="overlay-title">Registered Users</h2>
      <div className="overlay-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email Address</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u, i) => (
                <tr key={i}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.date}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="empty-cell">No users registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
