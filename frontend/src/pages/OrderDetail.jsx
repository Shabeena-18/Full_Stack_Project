import { Link, useParams } from 'react-router-dom';
import { ordersApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { formatPrice } from '../utils/format';

const HR = <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />;

export default function OrderDetail() {
  const { id } = useParams();
  // Poll every 10s so the tracking timeline moves as delivery staff update the order.
  const { data: order, loading, error, reload } = useApi(() => ordersApi.get(id), [id], { interval: 10000 });

  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="section-title mb-0">Order <span className="text-accent">#{order.order_number}</span></h2>
          <StatusBadge status={order.status} />
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="bg-card p-4 rounded-4 mb-4">
              <h5 className="mb-3">Order Status</h5>
              {order.status === 'Cancelled' ? (
                <p className="text-danger mb-0">This order was cancelled.</p>
              ) : (
                <div className="d-flex justify-content-between text-center">
                  {order.status_order.map((step, i) => {
                    const done = i <= order.status_step;
                    return (
                      <div className="flex-fill" key={step}>
                        <div className="mb-1">
                          <i className={done ? 'bi bi-check-circle-fill text-accent' : 'bi bi-circle text-muted-2'} />
                        </div>
                        <p className={`small mb-0 ${done ? 'text-white' : 'text-muted-2'}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card p-4 rounded-4">
              <h5 className="mb-3">Items</h5>
              {order.items.map((item) => (
                <div className="d-flex justify-content-between mb-2" key={item.id}>
                  <span className="text-muted-2">{item.food_name} × {item.quantity}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
              {HR}
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted-2">Delivery Fee</span><span>{formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong>Total</strong><strong className="text-accent">{formatPrice(order.total_amount)}</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-card p-4 rounded-4">
              <h5 className="mb-3">Delivery Details</h5>
              <p className="mb-2"><span className="text-muted-2">Name:</span> {order.customer_name}</p>
              <p className="mb-2"><span className="text-muted-2">Phone:</span> {order.phone}</p>
              <p className="mb-2"><span className="text-muted-2">Address:</span> {order.delivery_address}</p>
              {order.order_notes && <p className="mb-2"><span className="text-muted-2">Notes:</span> {order.order_notes}</p>}
              <p className="mb-0"><span className="text-muted-2">Payment:</span> {order.payment_method_display}</p>
            </div>
            <Link to="/my-orders" className="btn btn-outline-accent w-100 mt-3">Back to My Orders</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
