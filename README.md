# POI Editor Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

Make sure you're using Node.js ≥ 22, then install dependencies:

```bash
npm install --no-legacy-peer-deps
```

### 2. Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Update the environment variables in `.env.local` as needed.

### 3. Run the Development Server

```bash
npm run dev
```

The POI Editor frontend should now be live at [http://localhost:3000](http://localhost:3000). Make sure the backend is also running and the NEXT_PUBLIC_BACKEND_URL is setup correctly in `.env.local`.
