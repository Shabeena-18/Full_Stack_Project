import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

function Row({ label, value, last }) {
  return (
    <li className={`list-group-item bg-card text-white d-flex justify-content-between py-3${last ? '' : ' border-bottom border-secondary'}`}>
      <span className="text-muted-2">{label}</span><span>{value}</span>
    </li>
  );
}

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container section-padding" style={{ paddingTop: 20 }}>
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="success-check" style={{ background: 'rgba(255,90,31,0.15)' }}>
            <i className="bi bi-person" style={{ color: 'var(--accent)' }} />
          </div>
          <h2>{user.full_name || user.username}</h2>
          <span className="badge-category">{user.role_display}</span>
        </div>

        <ul className="list-group list-group-flush">
          <Row label="Username" value={user.username} />
          <Row label="Email" value={user.email} />
          <Row label="Phone Number" value={user.phone_number || '—'} />
          <Row label="Member Since" value={formatDate(user.member_since)} last />
        </ul>

        <div className="d-flex gap-3 mt-4">
          <Link to="/my-orders" className="btn btn-accent flex-fill">My Orders</Link>
          <Link to="/menu" className="btn btn-outline-accent flex-fill">Order More</Link>
        </div>
      </div>
    </div>
  );
}
