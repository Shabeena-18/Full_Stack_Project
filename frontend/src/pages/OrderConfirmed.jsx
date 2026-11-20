import { Link, useParams } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { formatPrice } from '../utils/format';

export default function OrderConfirmed() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useApi(() => ordersApi.get(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <section className="section-padding" style={{ paddingTop: 60 }}>
      <div className="container">
        <div className="auth-card text-center">
          <div className="success-check"><i className="bi bi-check-lg" /></div>
          <h2 className="mb-2">ORDER <span className="text-accent">CONFIRMED</span></h2>
          <p className="text-muted-2">Thank you for ordering from Food Paradise!</p>

          <div className="bg-dark-2 rounded-4 p-4 my-4 text-start">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted-2">Order Number</span>
              <strong className="text-accent">#{order.order_number}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted-2">Total Amount</span>
              <strong>{formatPrice(order.total_amount)}</strong>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted-2">Status</span>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <p className="text-muted-2">Your order has been sent to our delivery team.</p>

          <div className="d-flex gap-3 mt-4">
            <Link to={`/my-orders/${order.id}`} className="btn btn-accent flex-fill">Track Order</Link>
            <Link to="/menu" className="btn btn-outline-accent flex-fill">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
