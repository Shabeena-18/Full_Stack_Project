/** ₹299 or ₹299.50 - the API sends decimals as strings ("299.00"). */
export function formatPrice(value) {
  const n = Number(value) || 0;
  return `₹${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

/** Same behaviour as Django's |truncatechars. */
export function truncate(text = '', max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** 08 September 2026, 09:30 AM */
export function formatDateTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${date}, ${time}`;
}

/** 08 Sep 2026 */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const FALLBACK_FOOD_IMAGE = 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=600';
