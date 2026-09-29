# AI Clothing Store

## Features

- Product Listing
- Product Details
- Search Products
- Category Filter
- Product Sorting
- Shopping Cart
- Wishlist
- LocalStorage Persistence
- Quantity Management
- Dynamic Routing (Next.js)

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Context API

## Production configuration

Copy `.env.example` into the deployment secret store. All variables except
`CRON_SECRET` are required. `NEXT_PUBLIC_RAZORPAY_KEY_ID` must belong to the
same Razorpay mode/account as `RAZORPAY_KEY_ID`. Configure Razorpay to send
signed `payment.captured` and `order.paid` events to `/api/payment/webhook`.

Reservations expire after 15 minutes. The included `vercel.json` invokes the
authenticated cleanup endpoint every five minutes using `CRON_SECRET`; on a
different platform invoke `POST /api/inventory/cleanup` at least every five
minutes with `x-inventory-cleanup-secret`.

MongoDB must be deployed as a replica set (MongoDB Atlas qualifies). Inventory
release uses real MongoDB transactions and intentionally fails closed when
transactions are unavailable.

Before enabling real payments, run `npm run verify:order-indexes` with the
production `MONGODB_URI`. It is read-only: it reports missing payment-safety
indexes and legacy duplicates without dropping or modifying data.
