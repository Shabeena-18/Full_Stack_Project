import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/format';

const LABEL = 'form-label text-muted-2';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: user.full_name || '',
    phone: user.phone_number || '',
    delivery_address: '',
    order_notes: '',
    payment_method: 'COD',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Nothing to check out? Send the customer back to the menu.
  // (`submitting` stays true after a successful order, so we don't redirect then.)
  const cartIsEmpty = Boolean(cart) && cart.items.length === 0 && !submitting;
  useEffect(() => {
    if (cartIsEmpty) {
      toast.warning('Your cart is empty.');
      navigate('/menu', { replace: true });
    }
  }, [cartIsEmpty, toast, navigate]);

  if (!cart || cartIsEmpty) return <Loader />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Only delivery details are sent - the server works out the prices itself.
      const order = await ordersApi.checkout(form);
      await refresh(); // the cart is now empty
      navigate(`/order-confirmed/${order.id}`, { replace: true });
    } catch (err) {
      setErrors(err.fieldErrors);
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  const fieldError = (name) => errors[name] && <div className="text-danger small mt-1">{errors[name]}</div>;

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <h2 className="section-title mb-4">Checkout</h2>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="bg-card p-4 rounded-4">
              <h5 className="mb-3">Delivery Details</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className={LABEL}>Customer Name</label>
                  <input name="customer_name" className="form-control" value={form.customer_name} onChange={handleChange} required />
                  {fieldError('customer_name')}
                </div>
                <div className="mb-3">
                  <label className={LABEL}>Phone Number</label>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} required />
                  {fieldError('phone')}
                </div>
                <div className="mb-3">
                  <label className={LABEL}>Delivery Address</label>
                  <textarea name="delivery_address" className="form-control" rows="3" value={form.delivery_address} onChange={handleChange} required />
                  {fieldError('delivery_address')}
                </div>
                <div className="mb-3">
                  <label className={LABEL}>Order Notes (optional)</label>
                  <input
                    name="order_notes" className="form-control" placeholder="e.g. less spicy, no onions"
                    value={form.order_notes} onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className={`${LABEL} d-block`}>Payment Method</label>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="payment_method" value="COD" id="cod"
                      checked={form.payment_method === 'COD'} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="cod">Cash on Delivery</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="payment_method" value="DEMO" id="demo"
                      checked={form.payment_method === 'DEMO'} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="demo">Demo Payment (for classroom demo)</label>
                  </div>
                </div>
                <button type="submit" className="btn btn-accent w-100 py-2" disabled={submitting}>
                  {submitting ? 'Placing order...' : 'Confirm Order'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-card p-4 rounded-4">
              <h5 className="mb-3">Order Summary</h5>
              {cart.items.map((item) => (
                <div className="d-flex justify-content-between mb-2" key={item.id}>
                  <span className="text-muted-2">{item.food_item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted-2">Subtotal</span><span>{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted-2">Delivery Fee</span><span>{formatPrice(cart.delivery_fee)}</span>
              </div>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <div className="d-flex justify-content-between">
                <strong>Grand Total</strong><strong className="text-accent">{formatPrice(cart.grand_total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
