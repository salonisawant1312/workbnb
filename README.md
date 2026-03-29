# WORKBNB

Full-stack MERN-style workspace rental platform.

## Tech
- Backend: Node.js, Express, MongoDB (Mongoose), JWT
- Frontend: React (Vite), Redux Toolkit, React Router

## Features implemented
- Auth: register, login, current-user
- Listings: create/read/update/delete + host/admin role protection
- Listing media: image upload endpoint (`/api/listings/:id/images`) with Cloudinary support
- Bookings: create, list, detail, update, cancel, confirm
- Reviews: create/list/update/delete with listing rating refresh
- Payments: create-intent, confirm, history, refund, Stripe webhook handler
- Users: profile read/update + avatar upload endpoint (`/api/users/:id/avatar`)

## Environment
Backend `.env` keys:
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Run locally

### 0. Start MongoDB (Docker, one line)
```bash
docker compose up -d mongo
```

To stop it later:
```bash
docker compose stop mongo
```

### 1. Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### 2. Frontend
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.
