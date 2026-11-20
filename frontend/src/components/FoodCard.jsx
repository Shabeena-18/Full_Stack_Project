import { Link } from 'react-router-dom';
import { FALLBACK_FOOD_IMAGE, formatPrice, truncate } from '../utils/format';

/**
 * One dish card.
 *   action="add"  -> "Add to Cart" button (menu page)
 *   action="view" -> "View" link to the menu (home carousel)
 *   action="none" -> price only (home menu preview)
 */
export default function FoodCard({ food, action = 'none', showCategory = false, truncateAt = 60, onAdd, adding = false }) {
  return (
    <div className="food-card">
      <img src={food.image || FALLBACK_FOOD_IMAGE} alt={food.name} loading="lazy" />
      <div className="card-body">
        {(showCategory || !food.is_available) && (
          <div className="d-flex justify-content-between align-items-start mb-2">
            {showCategory ? <span className="badge-category">{food.category}</span> : <span />}
            {!food.is_available && <span className="badge-unavailable">Unavailable</span>}
          </div>
        )}
        <h5 className="mb-1">{food.name}</h5>
        <p className="text-muted-2 small">{truncate(food.description, truncateAt)}</p>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="price">{formatPrice(food.price)}</span>

          {action === 'view' && <Link to="/menu" className="btn btn-accent btn-sm">View</Link>}

          {action === 'add' && (food.is_available ? (
            <button type="button" className="btn btn-accent btn-sm" disabled={adding} onClick={() => onAdd(food)}>
              {adding ? 'Adding...' : <><i className="bi bi-cart-plus" /> Add to Cart</>}
            </button>
          ) : (
            <button type="button" className="btn btn-outline-accent btn-sm" disabled>Unavailable</button>
          ))}
        </div>
      </div>
    </div>
  );
}
