import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cart, setQuantity, removeItem, clear } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  // Run a cart change, disabling the buttons while it is in flight.
  const run = async (action, successMessage) => {
    setBusy(true);
    try {
      await action();
      if (successMessage) toast.info(successMessage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!cart) return <Loader />;

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <h2 className="section-title mb-4">Your <span className="text-accent">Cart</span></h2>

        {cart.items.length === 0 ? (
          <EmptyState icon="cart-x" title="Your cart is empty." actionTo="/menu" actionLabel="Explore Menu">
            Looks like you haven't added anything yet.
          </EmptyState>
        ) : (
          <>
            <div className="table-responsive bg-card p-4 rounded-4">
              <table className="table table-dark table-borderless cart-table align-middle mb-0">
                <thead>
                  <tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th /></tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {item.food_item.image && (
                            <img
                              src={item.food_item.image}
                              alt={item.food_item.name}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 10 }}
                            />
                          )}
                          <span>{item.food_item.name}</span>
                        </div>
                      </td>
                      <td>{formatPrice(item.food_item.price)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button" className="qty-btn" disabled={busy} aria-label="Decrease quantity"
                            onClick={() => run(() => setQuantity(item.id, item.quantity - 1))}
                          >−</button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            type="button" className="qty-btn" disabled={busy} aria-label="Increase quantity"
                            onClick={() => run(() => setQuantity(item.id, item.quantity + 1))}
                          >+</button>
                        </div>
                      </td>
                      <td className="text-accent fw-bold">{formatPrice(item.subtotal)}</td>
                      <td>
                        <button
                          type="button" className="btn btn-sm btn-outline-danger" disabled={busy} aria-label="Remove item"
                          onClick={() => {
                            if (window.confirm('Remove this item from your cart?')) {
                              run(() => removeItem(item.id), 'Item removed from cart.');
                            }
                          }}
                        ><i className="bi bi-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row justify-content-end mt-4">
              <div className="col-md-5">
                <div className="bg-card p-4 rounded-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted-2">Subtotal</span><span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted-2">Delivery Fee</span><span>{formatPrice(cart.delivery_fee)}</span>
                  </div>
                  <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total</strong><strong className="text-accent">{formatPrice(cart.grand_total)}</strong>
                  </div>
                  <Link to="/checkout" className="btn btn-accent w-100 py-2">Proceed to Checkout</Link>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/menu" className="btn btn-outline-accent"><i className="bi bi-arrow-left" /> Continue Shopping</Link>
              <button
                type="button" className="btn btn-outline-danger" disabled={busy}
                onClick={() => {
                  if (window.confirm('Clear all items from your cart?')) run(clear, 'Cart cleared.');
                }}
              >Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
