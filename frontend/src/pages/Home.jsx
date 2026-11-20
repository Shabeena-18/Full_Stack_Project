import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuApi } from '../api/endpoints';
import { useApi } from '../hooks/useApi';
import FoodCard from '../components/FoodCard';
import Loader from '../components/Loader';

const GALLERY = [
  'photo-1504674900247-0877df9cc836',
  'photo-1546069901-ba9599a7e63c',
  'photo-1565299624946-b28f40a0ae38',
  'photo-1567620905732-2d1ec7ab7445',
  'photo-1555939594-58d7cb561ad1',
  'photo-1476224203421-9ac39bcb3327',
];

const REVIEWS = [
  { stars: '★★★★★', text: 'The Chicken Biryani was outstanding — full of flavor and delivered piping hot!', name: 'Ravi Kumar' },
  { stars: '★★★★★', text: 'Loved the Paneer Butter Masala. Ordering was smooth and delivery was quick.', name: 'Sneha Reddy' },
  { stars: '★★★★☆', text: 'Great ambience and even better food. The cheese pizza is a must-try!', name: 'Arjun Mehta' },
];

/** Popular dishes, three per slide, auto-advancing every 5 seconds. */
function PopularCarousel({ dishes }) {
  const slides = [];
  for (let i = 0; i < dishes.length; i += 3) slides.push(dishes.slice(i, i + 3));

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (step) => setIndex((i) => (i + step + slides.length) % slides.length);

  useEffect(() => {
    if (paused || slides.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    <div
      className="carousel slide"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <div className="row g-4">
            {slides[index].map((dish) => (
              <div className="col-md-4" key={dish.id}>
                <FoodCard food={dish} action="view" showCategory />
              </div>
            ))}
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" aria-label="Previous" onClick={() => go(-1)}>
            <span className="carousel-control-prev-icon" />
          </button>
          <button className="carousel-control-next" type="button" aria-label="Next" onClick={() => go(1)}>
            <span className="carousel-control-next-icon" />
          </button>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { data: dishes, loading } = useApi(() => menuApi.popular(), []);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="container">
          <span className="badge-category mb-3 d-inline-block">🍽 Welcome to Food Paradise</span>
          <h1>DELICIOUS FOOD<br />FOR <span className="text-accent">EVERYONE</span></h1>
          <p>Experience premium quality food with amazing ambience. Freshly prepared dishes, delivered hot to your doorstep.</p>
          <div className="d-flex gap-3 mt-4">
            <Link to="/menu" className="btn btn-accent btn-lg">Explore Menu</Link>
            <Link to="/#about" className="btn btn-outline-accent btn-lg">Learn More</Link>
          </div>
        </div>
      </section>

      {/* ===================== POPULAR DISHES ===================== */}
      <section className="section-padding bg-dark-2" id="popular">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Popular <span className="text-accent">Dishes</span></h2>
            <p className="section-subtitle">Loved by our customers, cooked fresh every day</p>
          </div>
          {loading && <Loader />}
          {!loading && dishes?.length > 0 && <PopularCarousel dishes={dishes} />}
          {!loading && !dishes?.length && (
            <p className="text-center text-muted-2">
              No dishes available yet. Please check back soon, or ask an admin to run{' '}
              <code>python manage.py seed_demo</code>.
            </p>
          )}
        </div>
      </section>

      {/* ===================== ABOUT ===================== */}
      <section className="section-padding" id="about">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-md-6 about-img">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700" className="img-fluid" alt="About Food Paradise" />
            </div>
            <div className="col-md-6">
              <h2 className="section-title">About <span className="text-accent">Food Paradise</span></h2>
              <p className="text-muted-2">
                Food Paradise has been serving delicious, chef-crafted meals since day one. We blend traditional recipes with
                modern techniques to create dishes that are as beautiful as they are tasty. Every order is prepared fresh,
                using quality ingredients, and delivered with care.
              </p>
              <div className="row g-3 mt-3">
                <div className="col-6">
                  <h3 className="text-accent mb-0">10+</h3>
                  <p className="text-muted-2 small">Signature Dishes</p>
                </div>
                <div className="col-6">
                  <h3 className="text-accent mb-0">24/7</h3>
                  <p className="text-muted-2 small">Order &amp; Delivery</p>
                </div>
              </div>
              <Link to="/menu" className="btn btn-accent mt-3">Explore Full Menu</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== MENU PREVIEW ===================== */}
      <section className="section-padding bg-dark-2" id="menu-preview">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Our <span className="text-accent">Menu</span></h2>
            <p className="section-subtitle">A taste of what's cooking today</p>
          </div>
          <div className="row g-4">
            {(dishes || []).slice(0, 3).map((dish) => (
              <div className="col-md-4" key={dish.id}><FoodCard food={dish} /></div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/menu" className="btn btn-outline-accent">See Full Menu <i className="bi bi-arrow-right" /></Link>
          </div>
        </div>
      </section>

      {/* ===================== VIDEO ===================== */}
      <section className="section-padding">
        <div className="container text-center">
          <h2 className="section-title">Our <span className="text-accent">Restaurant</span></h2>
          <p className="section-subtitle">Take a look inside Food Paradise</p>
          <div className="ratio ratio-16x9 mx-auto" style={{ maxWidth: 800, borderRadius: 16, overflow: 'hidden' }}>
            <iframe src="https://www.youtube.com/embed/2g811Eo7K8U" title="Restaurant video" allowFullScreen />
          </div>
        </div>
      </section>

      {/* ===================== GALLERY ===================== */}
      <section className="section-padding bg-dark-2" id="gallery">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Food <span className="text-accent">Gallery</span></h2>
            <p className="section-subtitle">A visual feast</p>
          </div>
          <div className="row">
            {GALLERY.map((id) => (
              <div className="col-md-4" key={id}>
                <div className="gallery-item">
                  <img src={`https://images.unsplash.com/${id}?w=500`} alt="Gallery" loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== REVIEWS ===================== */}
      <section className="section-padding" id="reviews">
        <div className="container">
          <div className="text-center">
            <h2 className="section-title">Customer <span className="text-accent">Reviews</span></h2>
            <p className="section-subtitle">What our foodies say about us</p>
          </div>
          <div className="row g-4">
            {REVIEWS.map((r) => (
              <div className="col-md-4" key={r.name}>
                <div className="review-card">
                  <div className="stars mb-2">{r.stars}</div>
                  <p className="text-muted-2">&ldquo;{r.text}&rdquo;</p>
                  <h6 className="mb-0">— {r.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
