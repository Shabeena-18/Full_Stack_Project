import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { menuApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import FoodCard from '../components/FoodCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';

export default function Menu() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Filters live in the URL (/menu?category=Pizza&search=cheese) so they can be shared/bookmarked.
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const search = params.get('search') || '';
  const [searchText, setSearchText] = useState(search);
  useEffect(() => setSearchText(search), [search]);

  const [addingId, setAddingId] = useState(null);

  const { data: categories } = useApi(() => menuApi.categories(), []);
  const { data: foods, loading, error, reload } = useApi(
    () => menuApi.list({ category, search }),
    [category, search],
  );

  const updateFilters = (next) => {
    const merged = { category, search, ...next };
    const query = {};
    if (merged.category && merged.category !== 'All') query.category = merged.category;
    if (merged.search) query.search = merged.search;
    setParams(query);
  };

  const handleAdd = async (food) => {
    if (!user) {
      toast.info('Please login to add items to your cart.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setAddingId(food.id);
    try {
      await addItem(food.id);
      toast.success(`${food.name} added to your cart.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section className="section-padding" style={{ paddingTop: 30 }}>
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="section-title">Our <span className="text-accent">Menu</span></h2>
          <p className="section-subtitle">Freshly prepared dishes, straight from our kitchen to your table</p>
        </div>

        {/* Search + Category filter */}
        <form
          className="row g-3 justify-content-center mb-5"
          onSubmit={(e) => { e.preventDefault(); updateFilters({ search: searchText.trim() }); }}
        >
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search food..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              {(categories || ['All']).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-accent w-100"><i className="bi bi-search" /> Search</button>
          </div>
        </form>

        {loading && <Loader />}
        {error && <ErrorState error={error} onRetry={reload} />}

        {!loading && !error && foods.length > 0 && (
          <div className="row g-4">
            {foods.map((food) => (
              <div className="col-lg-4 col-md-6" key={food.id}>
                <FoodCard
                  food={food}
                  action="add"
                  showCategory
                  truncateAt={70}
                  adding={addingId === food.id}
                  onAdd={handleAdd}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && foods.length === 0 && (
          <EmptyState icon="emoji-frown" title="No food items found">
            Try a different search or category.
            <br />
            <button type="button" className="btn btn-accent mt-3" onClick={() => setParams({})}>View Full Menu</button>
          </EmptyState>
        )}
      </div>
    </section>
  );
}
