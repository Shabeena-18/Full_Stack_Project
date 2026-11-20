import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollManager from './ScrollManager';

/** Navbar + page + footer, shared by every route. */
export default function Layout() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
