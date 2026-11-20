/** Coloured pill for an order status (colours are in style.css: .status-Pending, ...). */
export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.replace(/\s+/g, '-')}`}>{status}</span>;
}
