# 🍽 Food Paradise — React + Django Full-Stack Food Ordering App

A food-ordering website with a **React** frontend and a **Django REST Framework**
backend. Customers sign up, browse the menu, fill a cart, check out and track
their order; delivery staff move orders through their lifecycle from a
dashboard; admins manage everything in Django Admin.

```
Browser ──► React (Vite, :5173) ──/api──► Django REST API (:8000) ──► SQLite
```

| Layer     | Technology                                              |
|-----------|----------------------------------------------------------|
| Frontend  | React 19, React Router, Bootstrap 5, Vite                |
| Backend   | Python 3.12+, Django 6, Django REST Framework            |
| Auth      | DRF token authentication (`Authorization: Token …`)      |
| Database  | SQLite (Django ORM)                                      |

---

## Folder structure

```text
food_paradise/
├── backend/                     # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                  # settings.py, urls.py, wsgi/asgi
│   ├── accounts/                # signup, login, logout, profile, roles
│   │   ├── models.py            #   Profile (role, phone, full name)
│   │   ├── serializers.py
│   │   ├── views.py  urls.py
│   │   ├── permissions.py       #   IsDeliveryStaff
│   │   └── management/commands/seed_demo.py
│   ├── menu/                    # FoodItem model + menu API
│   │   └── management/commands/populate_food.py
│   ├── cart/                    # Cart & CartItem API
│   ├── orders/                  # Order & OrderItem, checkout, order history
│   └── delivery/                # delivery-staff API
│
└── frontend/                    # React app
    ├── index.html  vite.config.js  package.json
    └── src/
        ├── main.jsx  App.jsx    # providers + routes
        ├── api/                 # client.js (fetch wrapper), endpoints.js
        ├── context/             # AuthContext, CartContext, ToastContext
        ├── hooks/useApi.js      # data loading (+ optional live polling)
        ├── components/          # Navbar, Footer, FoodCard, ProtectedRoute, …
        ├── pages/               # Home, Menu, Cart, Checkout, MyOrders, …
        ├── utils/format.js
        └── styles/style.css     # the original dark + orange theme
```

---

## Quick start

You need **Python 3.12+** and **Node.js 20.19+** (or 22.12+). Open two terminals.

### 1. Backend (Django API on http://127.0.0.1:8000)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_demo        # demo accounts + 10 sample dishes
python manage.py runserver
```

### 2. Frontend (React app on http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. In development Vite forwards `/api` and
`/media` to Django, so there is nothing else to configure.

### Demo accounts

| Role     | Username    | Password        |
|----------|-------------|-----------------|
| Admin    | `admin`     | `admin12345`    |
| Delivery | `delivery1` | `delivery12345` |

Create customer accounts through the **Signup** page. To make someone delivery
staff: Django Admin (`http://127.0.0.1:8000/admin/`) → **Accounts → Profiles**
→ set **Role** to *Delivery Staff*. Food items (with image uploads) are also
managed there.

### Run the backend tests

```bash
cd backend && python manage.py test
```

---

## API reference

All endpoints live under `/api/`. Everything except the ones marked *public*
needs the header `Authorization: Token <token>` (returned by login).

| Method | Endpoint                               | Purpose                                      |
|--------|----------------------------------------|----------------------------------------------|
| POST   | `/auth/signup/` *public*               | Create a customer account                    |
| POST   | `/auth/login/` *public*                | `{username, password}` → `{token, user}`     |
| POST   | `/auth/logout/`                        | Invalidate the token                         |
| GET    | `/auth/profile/`                       | Current user (used to restore the session)   |
| GET    | `/menu/?category=&search=` *public*    | Available dishes                             |
| GET    | `/menu/popular/` *public*              | Dishes for the home page                     |
| GET    | `/menu/categories/` *public*           | `["All", "Pizza", …]`                        |
| GET    | `/cart/`                               | Cart with items and totals                   |
| DELETE | `/cart/`                               | Clear the cart                               |
| POST   | `/cart/items/`                         | `{food_id}` – add (or +1 if already there)   |
| PATCH  | `/cart/items/<id>/`                    | `{quantity}` – set quantity (0 removes)      |
| DELETE | `/cart/items/<id>/`                    | Remove an item                               |
| GET    | `/orders/`                             | My orders                                    |
| POST   | `/orders/`                             | Checkout: turns the cart into an order       |
| GET    | `/orders/<id>/`                        | One of my orders                             |
| GET    | `/delivery/orders/`                    | *Staff:* active + recently completed orders  |
| POST   | `/delivery/orders/<id>/advance/`       | *Staff:* move to the next status             |
| POST   | `/delivery/orders/<id>/cancel/`        | *Staff:* cancel                              |

Validation errors come back as `400` with `{"field": ["message"]}`; other errors
as `{"detail": "message"}`.

---

## How the pieces fit together

**Customer flow**

```text
Signup → Login → Menu → Add to Cart → Cart (±, remove) → Checkout
      → Order Confirmed (#FP1001) → My Orders → Track Order
```

**Delivery flow**

```text
Dashboard → Pending → Accepted → Preparing → Ready → Out for Delivery → Delivered
```

Customers see status changes on their own — the tracking pages re-check the
server every 10–15 seconds, and the delivery dashboard picks up new orders the
same way.

**Design decisions**

- **The server owns the money.** The cart API returns subtotal, delivery fee
  and grand total; checkout accepts only delivery details and recomputes the
  total from the database, so a tampered price from the browser has no effect.
- **Order prices are snapshots.** `OrderItem.price` is copied at checkout, so
  later menu price changes never alter past orders. Checkout runs in a single
  database transaction.
- **Access control is enforced by the API,** not just hidden in the UI:
  users can only read their own orders and cart; `/api/delivery/*` requires the
  delivery role (or a superuser) and returns `403` otherwise.
- **Passwords are hashed** by Django (`create_user`) and never returned by the API.
- **React structure:** `AuthContext` restores the session on page load,
  `CartContext` keeps the navbar badge and cart page in sync, `ToastContext`
  replaces Django's `messages`, and `ProtectedRoute` guards private pages.

### How the old Django app maps to the new one

| Before (Django templates)              | Now                                              |
|----------------------------------------|--------------------------------------------------|
| `templates/*.html`                     | `frontend/src/pages/*.jsx` + `components/`       |
| `static/css/style.css`                 | `frontend/src/styles/style.css` (same theme)     |
| `static/js/script.js` (confirms, etc.) | React state/handlers                             |
| Bootstrap JS carousel / navbar toggle  | React components (no Bootstrap JS needed)        |
| `views.py` returning `render(...)`     | DRF views returning JSON (`serializers.py`)      |
| Session login + `{% csrf_token %}`     | Token auth (`Authorization: Token …`)            |
| Django `messages`                      | Toast notifications                              |
| `@login_required`, `user_passes_test`  | DRF permissions + React `ProtectedRoute`         |
| Cart count context processor           | `CartContext`                                    |

Models, migrations, the Django Admin configuration and the `populate_food`
command are unchanged, so your existing data model carries over as-is.

---

## Deploying online (Render + Vercel)

The **backend** (Django + PostgreSQL) goes on [Render](https://render.com); the
**frontend** (React) goes on [Vercel](https://vercel.com). Push the project to
GitHub first, then follow these steps in order.

### 1. Backend on Render

1. **New + → PostgreSQL**: name `food-paradise-db`, choose the Free plan, create it.
   Copy its **Internal Database URL**.
2. **New + → Web Service** → pick your GitHub repo, then set:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `bash build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
3. Add these **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `PYTHON_VERSION` | `3.13.4` |
   | `DATABASE_URL` | the Internal Database URL from step 1 |
   | `DJANGO_SECRET_KEY` | any long random string |
   | `DJANGO_DEBUG` | `False` |
   | `DJANGO_SUPERUSER_USERNAME` | `admin` |
   | `DJANGO_SUPERUSER_PASSWORD` | a strong password of your choice |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `CORS_ALLOWED_ORIGINS` | your Vercel URL (add after step 2 below) |

4. Deploy. Your API URL will look like `https://food-paradise-api.onrender.com`.
   Opening `<that URL>/api/menu/` should show the dishes as JSON.

`build.sh` installs packages, collects static files, migrates the database,
loads the sample menu and creates the admin account — on every deploy.

### 2. Frontend on Vercel

1. Import the repo, set **Root Directory** to `frontend` (Framework: Vite).
2. Add the variable `VITE_API_URL` = your Render URL (no trailing slash, no `/api`).
3. Deploy, then copy the Vercel URL into `CORS_ALLOWED_ORIGINS` on Render
   (no trailing slash) and let Render redeploy.

`frontend/vercel.json` makes page refreshes work with client-side routing.
If you change `VITE_API_URL` later, redeploy the frontend (it is read at build time).

### 3. After going live

- Log in at `<render URL>/admin/` with the superuser you configured.
- To create a delivery account: have someone sign up, then in the admin open
  **Accounts → Profiles** and set their **Role** to *Delivery Staff*.
- Do **not** run `seed_demo` in production — it creates accounts with public demo passwords.

### Free-tier limits to know about

- A free Render web service sleeps after ~15 minutes of no traffic; the first
  request afterwards can take up to a minute.
- Free Render PostgreSQL databases may expire after a limited period — check
  Render's current terms and upgrade or export your data before then.
- Images uploaded through the admin are stored on the server's disk, which is
  wiped on each deploy. Use the **Image URL** field for food photos (as the
  sample data does), or add cloud storage later.

### Environment variables reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Vercel | Public URL of the Django API |
| `DJANGO_SECRET_KEY` | Render | Django's signing key (keep secret) |
| `DJANGO_DEBUG` | Render | `False` in production |
| `DATABASE_URL` | Render | PostgreSQL connection (SQLite is used when unset) |
| `CORS_ALLOWED_ORIGINS` | Render | Your frontend URL(s), comma-separated |
| `DJANGO_ALLOWED_HOSTS` | Render | Optional; Render's hostname is added automatically |
| `CSRF_TRUSTED_ORIGINS` | Render | Optional extra origins for the admin login |
| `DJANGO_SUPERUSER_*` | Render | Username/password/email for the admin account created at build |

## Ideas to extend

Real payments (Razorpay/Stripe), email/SMS notifications, WebSockets instead of
polling, ratings tied to real orders, customer-initiated cancellation,
JWT with refresh tokens.
