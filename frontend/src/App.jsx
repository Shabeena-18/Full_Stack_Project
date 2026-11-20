import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import MyOrders from './pages/MyOrders';
import OrderDetail from './pages/OrderDetail';
import DeliveryDashboard from './pages/DeliveryDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed/:id" element={<OrderConfirmed />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Delivery staff only */}
        <Route element={<ProtectedRoute staffOnly />}>
          <Route path="/delivery" element={<DeliveryDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
