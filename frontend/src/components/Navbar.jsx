import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Collapse the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out.');
    navigate('/');
  };

  const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-fp fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">FOOD <span>PARADISE</span></Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${open ? ' show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item"><NavLink className={link} to="/" end>Home</NavLink></li>
            <li className="nav-item"><Link className="nav-link" to="/#about">About</Link></li>
            <li className="nav-item"><NavLink className={link} to="/menu">Menu</NavLink></li>
            <li className="nav-item"><Link className="nav-link" to="/#gallery">Gallery</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/#contact">Contact</Link></li>

            {user ? (
              <>
                {user.is_delivery_staff && (
                  <li className="nav-item">
                    <NavLink className={link} to="/delivery"><i className="bi bi-truck" /> Dashboard</NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink className={link} to="/cart">
                    <i className="bi bi-cart3" /> Cart
                    {count > 0 && <span className="cart-badge">{count}</span>}
                  </NavLink>
                </li>
                <li className="nav-item"><NavLink className={link} to="/my-orders">My Orders</NavLink></li>
                <li className="nav-item">
                  <NavLink className={link} to="/profile">Welcome, {user.username}</NavLink>
                </li>
                <li className="nav-item">
                  <button type="button" className="btn btn-outline-accent btn-sm ms-lg-2" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item"><NavLink className={link} to="/login">Login</NavLink></li>
                <li className="nav-item">
                  <Link className="btn btn-accent btn-sm ms-lg-2" to="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
