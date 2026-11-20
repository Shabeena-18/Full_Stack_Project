import { Link } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, formatPrice } from '../utils/format';

export default function MyOrders() {
  // Re-check every 15s so status changes made by delivery staff show up on their own.
  const { data: orders, loading, error, reload } = useApi(() => ordersApi.list(), [], { interval: 15000 });

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <h2 className="section-title mb-4">My <span className="text-accent">Orders</span></h2>

        {loading && <Loader />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {orders && orders.length === 0 && (
          <EmptyState icon="receipt" title="You haven't placed any orders yet." actionTo="/menu" actionLabel="Explore Menu" />
        )}

        {orders?.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h5 className="mb-1">Order #{order.order_number}</h5>
                <p className="text-muted-2 small mb-0">{formatDateTime(order.created_at)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="mb-3">
              {order.items.map((item) => (
                <p className="text-muted-2 mb-1" key={item.id}>{item.food_name} × {item.quantity}</p>
              ))}
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <strong>Total: <span className="text-accent">{formatPrice(order.total_amount)}</span></strong>
              <Link to={`/my-orders/${order.id}`} className="btn btn-outline-accent btn-sm">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
