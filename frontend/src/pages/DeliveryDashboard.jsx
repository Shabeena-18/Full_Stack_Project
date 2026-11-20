import { useState } from 'react';
import { deliveryApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatDateTime, formatPrice } from '../utils/format';

export default function DeliveryDashboard() {
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  // New orders appear on their own: the dashboard re-checks every 10 seconds.
  const { data, loading, error, reload } = useApi(() => deliveryApi.dashboard(), [], { interval: 10000 });

  const act = async (order, action, message) => {
    setBusyId(order.id);
    try {
      const updated = await action(order.id);
      toast[message.type](message.text(updated));
      await reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const advance = (order) => act(order, deliveryApi.advance, {
    type: 'success',
    text: (o) => `Order #${o.order_number} moved to "${o.status}".`,
  });

  const cancel = (order) => {
    if (!window.confirm('Cancel this order?')) return;
    act(order, deliveryApi.cancel, { type: 'info', text: (o) => `Order #${o.order_number} cancelled.` });
  };

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <h2 className="section-title mb-1">Delivery <span className="text-accent">Dashboard</span></h2>
        <p className="section-subtitle">Orders that need attention, newest first</p>

        {loading && <Loader />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {data && (
          <>
            {data.active.length === 0 ? (
              <EmptyState icon="clipboard-check" title="No active orders right now.">
                New orders will appear here automatically.
              </EmptyState>
            ) : data.active.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <h5 className="mb-1">Order #{order.order_number}</h5>
                    <p className="text-muted-2 small mb-0">{formatDateTime(order.created_at)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <p className="mb-1"><span className="text-muted-2">Customer:</span> {order.customer_name}</p>
                    <p className="mb-1"><span className="text-muted-2">Phone:</span> {order.phone}</p>
                    <p className="mb-0"><span className="text-muted-2">Address:</span> {order.delivery_address}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted-2 mb-1">Items:</p>
                    {order.items.map((item) => (
                      <p className="mb-1 small" key={item.id}>{item.food_name} × {item.quantity}</p>
                    ))}
                    <p className="mb-0"><strong>Total: <span className="text-accent">{formatPrice(order.total_amount)}</span></strong></p>
                  </div>
                </div>

                <div className="d-flex gap-2 flex-wrap">
                  {order.next_status && (
                    <button type="button" className="btn btn-accent btn-sm" disabled={busyId === order.id} onClick={() => advance(order)}>
                      Mark as "{order.next_status}"
                    </button>
                  )}
                  <button type="button" className="btn btn-outline-danger btn-sm" disabled={busyId === order.id} onClick={() => cancel(order)}>
                    Cancel Order
                  </button>
                </div>
              </div>
            ))}

            {data.completed.length > 0 && (
              <>
                <h4 className="mt-5 mb-3">Recently Completed</h4>
                <div className="table-responsive bg-card p-3 rounded-4">
                  <table className="table table-dark table-borderless mb-0 align-middle">
                    <thead>
                      <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {data.completed.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.order_number}</td>
                          <td>{order.customer_name}</td>
                          <td>{formatPrice(order.total_amount)}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
