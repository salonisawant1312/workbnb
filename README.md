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

## Deploy (One By One)

### 1) Deploy backend on Railway
1. In Railway, create a new project from GitHub and select this repo.
2. Set **Root Directory** to `backend`.
3. Add backend environment variables:
   - `MONGODB_URI` (MongoDB Atlas URI)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL` (set later to Vercel URL)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy and verify:
   - `https://<your-railway-domain>/api/health`

### 2) Deploy frontend on Vercel
1. In Vercel, import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add env var:
   - `VITE_API_URL=https://<your-railway-domain>/api`
4. Deploy.
5. Open the Vercel URL and verify listings load.

### 3) Final wiring
1. Copy Vercel production URL.
2. In Railway backend env, set:
   - `CLIENT_URL=https://<your-vercel-domain>`
3. Redeploy backend.
4. Retest auth, listings, booking, and payment flow.
