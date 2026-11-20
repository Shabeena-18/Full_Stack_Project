import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/endpoints';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

/**
 * The cart lives in the database. Every cart endpoint returns the full,
 * up-to-date cart (items + totals), which we simply store here - so the
 * navbar badge and the cart page always agree.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refresh = useCallback(async () => {
    setCart(await cartApi.get());
  }, []);

  // Load the cart on login, drop it on logout.
  useEffect(() => {
    if (!user) { setCart(null); return; }
    refresh().catch(() => setCart(null));
  }, [user, refresh]);

  const value = useMemo(() => ({
    cart,
    count: cart?.total_items ?? 0,
    refresh,
    addItem: async (foodId) => setCart(await cartApi.add(foodId)),
    setQuantity: async (itemId, quantity) => setCart(await cartApi.setQuantity(itemId, quantity)),
    removeItem: async (itemId) => setCart(await cartApi.remove(itemId)),
    clear: async () => setCart(await cartApi.clear()),
  }), [cart, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
