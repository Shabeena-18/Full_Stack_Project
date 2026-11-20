import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FIELDS = [
  { name: 'full_name', placeholder: 'Full Name', type: 'text', autoComplete: 'name' },
  { name: 'username', placeholder: 'Username', type: 'text', autoComplete: 'username' },
  { name: 'email', placeholder: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone_number', placeholder: 'Phone Number', type: 'tel', autoComplete: 'tel' },
  { name: 'password', placeholder: 'Password', type: 'password', autoComplete: 'new-password' },
  { name: 'confirm_password', placeholder: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
];

const EMPTY = Object.fromEntries(FIELDS.map((f) => [f.name, '']));

export default function Signup() {
  const { user, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick client-side checks (the server validates again).
    const local = {};
    FIELDS.forEach(({ name }) => { if (!form[name].trim()) local[name] = 'This field is required.'; });
    if (form.password && form.password.length < 6) local.password = 'Password must be at least 6 characters long.';
    if (form.password !== form.confirm_password) local.confirm_password = 'Passwords do not match.';
    if (Object.keys(local).length) { setErrors(local); return; }

    setSubmitting(true);
    try {
      await signup({ ...form, full_name: form.full_name.trim(), username: form.username.trim() });
      toast.success('Account created successfully. Please login.');
      navigate('/login');
    } catch (err) {
      setErrors(Object.keys(err.fieldErrors).length ? err.fieldErrors : { non_field_errors: err.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <h2>Create <span className="text-accent">Account</span></h2>
          <p className="text-muted-2">Join Food Paradise and start ordering</p>
        </div>

        {errors.non_field_errors && <div className="alert alert-danger">{errors.non_field_errors}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {FIELDS.map((f) => (
            <div className="mb-3" key={f.name}>
              <input
                className={`form-control${errors[f.name] ? ' is-invalid' : ''}`}
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={handleChange}
              />
              {errors[f.name] && <div className="text-danger small mt-1">{errors[f.name]}</div>}
            </div>
          ))}
          <button type="submit" className="btn btn-accent w-100 py-2 mt-2" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-muted-2 mt-4 mb-0">
          Already have an account? <Link to="/login" className="text-accent">Login</Link>
        </p>
      </div>
    </div>
  );
}
