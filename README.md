# Dealer Admin Panel (React + Vite + Tailwind)

A business-monitoring admin panel for the existing Dealer Platform. It is a
**separate frontend** that talks to the existing Node.js/Express/MongoDB backend
via the new `/admin/*` API module. It does not modify the existing apps.

## Setup

```bash
npm install
cp .env.example .env   # fill in the values
npm run dev            # http://localhost:5174
```

### .env

| Var | Description |
|-----|-------------|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:5000/api/v1` |
| `VITE_FIREBASE_*` | Firebase Web config of the SAME project as the mobile apps |

## Auth

Login uses Firebase email/password to obtain an ID token, which is attached as a
`Bearer` token on every request. The backend `/admin/*` routes require the user
to have the **admin** role (`User.role === 'admin'`).

To make an account admin, set its `role` to `admin` in MongoDB:

```js
db.users.updateOne({ email: 'you@example.com' }, { $set: { role: 'admin' } })
```

## Pages

Dashboard · Products · Customers · Leads · Loans · Dealers · Analytics · Notifications

All data is live (no mock data). Every page has a manual **Refresh** button and
auto-refreshes every 30 seconds.
