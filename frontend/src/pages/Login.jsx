import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Nothing to do here.
  if (user && !submitting) return <Navigate to="/" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedIn = await login(form.username.trim(), form.password);
      toast.success(`Welcome back, ${loggedIn.username}!`);
      // Delivery staff go straight to their dashboard.
      if (loggedIn.role === 'delivery') navigate('/delivery', { replace: true });
      else navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h2>Welcome <span className="text-accent">Back</span></h2>
          <p className="text-muted-2">Login to continue ordering delicious food</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <input
              type="text" name="username" className="form-control" placeholder="Username"
              autoComplete="username" autoFocus required value={form.username} onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="password" name="password" className="form-control" placeholder="Password"
              autoComplete="current-password" required value={form.password} onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-accent w-100 py-2 mt-2" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted-2 mb-2">Don't have an account?</p>
          <Link to="/signup" className="btn btn-outline-accent w-100">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
