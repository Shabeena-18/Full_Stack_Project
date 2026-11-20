import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h4>FOOD <span className="text-accent">PARADISE</span></h4>
            <p>Delicious food, delivered fresh, made with love. Experience premium quality dining from the comfort of your home.</p>
          </div>
          <div className="col-md-4">
            <h5 className="text-white">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Menu</Link></li>
              <li><Link to="/#about">About Us</Link></li>
              <li><Link to="/#gallery">Gallery</Link></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5 className="text-white">Contact Us</h5>
            <p><i className="bi bi-geo-alt text-accent" /> MG Road, Vijayawada, India</p>
            <p><i className="bi bi-telephone text-accent" /> +91 98765 43210</p>
            <p><i className="bi bi-envelope text-accent" /> hello@foodparadise.com</p>
          </div>
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
        <p className="text-center mb-0">&copy; 2026 Food Paradise. Built with React + Django.</p>
      </div>
    </footer>
  );
}
