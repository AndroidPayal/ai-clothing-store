<img width="1006" height="608" alt="Capture6" src="https://github.com/user-attachments/assets/1961813e-a5aa-43af-93a4-75c0f4759b9e" />
<img width="1006" height="607" alt="Capture5" src="https://github.com/user-attachments/assets/b65451dc-908b-4f6b-99ed-ee1f1a7061e0" />
<img width="1006" height="610" alt="Capture4" src="https://github.com/user-attachments/assets/fd5017f9-a178-49f2-a118-ea50a3264915" />
<img width="1006" height="605" alt="Capture3" src="https://github.com/user-attachments/assets/6f3484e1-e27a-4597-8688-3053e87574cd" />
<img width="1007" height="609" alt="Capture2" src="https://github.com/user-attachments/assets/39d7245a-77f1-4bb5-9aec-9a1ae0cebbd6" />
<img width="1008" height="611" alt="Capture" src="https://github.com/user-attachments/assets/dd58ea37-4bce-4762-a0ac-02a162d56a1d" />
# SOZAN / NAZM — Full-Stack Fashion E-commerce Platform

A production-style fashion e-commerce application built with **Next.js, React, TypeScript and MongoDB**, featuring customer shopping flows, secure authentication, admin management, Razorpay payments, inventory reservation and production-ready checkout handling.

### 🔗 Live Demo

**https://ai-clothing-store-seven.vercel.app/**

### 💻 Source Code

**https://github.com/AndroidPayal/ai-clothing-store**

---

## ✨ Features

### 🛍️ Customer Experience

* Product listing and product details
* Category-based browsing
* Product search and filtering
* Product sorting
* Shopping cart
* Wishlist
* Quantity management
* Persistent cart data
* Responsive design
* User authentication
* Profile management
* Order history

### 💳 Checkout & Payments

* Razorpay payment integration
* Server-side payment verification
* Checkout idempotency protection
* Duplicate checkout prevention
* Payment status handling
* Refund tracking
* Automated refund reconciliation for recoverable failures

### 📦 Inventory & Orders

* Inventory reservation during checkout
* 15-minute inventory reservation expiry
* Automatic inventory release for expired reservations
* Transaction-based inventory reservation
* Protection against overselling
* Order status management
* Inventory release on cancellation
* Checkout fingerprinting for duplicate-request protection

### 🔐 Authentication & Authorization

* Secure user authentication
* Protected customer routes
* Role-based admin access
* Admin-only API protection
* Separate customer and admin workflows
* Server-side authorization checks

### 👨‍💼 Admin Dashboard

* Product management
* Product creation and editing
* Inventory management
* Order management
* Order status updates
* Customer/order information
* Admin-protected APIs

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Context API

### Backend

* Next.js App Router
* REST APIs
* Node.js
* Mongoose

### Database

* MongoDB
* MongoDB transactions
* Database indexes

### Authentication & Security

* NextAuth
* JWT
* Role-based authorization
* Protected API routes
* Idempotency controls

### Payments

* Razorpay

### Deployment

* Vercel
* MongoDB Atlas
* GitHub

---

## 🏗️ Architecture

The application uses the **Next.js App Router** with server-side API routes and MongoDB for persistent application data.

```text
Browser
   │
   ▼
Next.js / React UI
   │
   ├── Authentication
   ├── Product browsing
   ├── Cart / Wishlist
   ├── Checkout
   └── Admin dashboard
   │
   ▼
Next.js API Routes
   │
   ├── Authentication & Authorization
   ├── Product APIs
   ├── Cart / Order APIs
   ├── Payment APIs
   └── Inventory APIs
   │
   ├───────────────┐
   ▼               ▼
MongoDB         Razorpay
```

---

## 🔒 Production & Reliability

The checkout flow was designed with real-world failure scenarios in mind.

### Inventory Reservation

Inventory is reserved during checkout using MongoDB transactions so that inventory updates and order creation can succeed or roll back together.

Reservations expire after **15 minutes** and can be released by the inventory cleanup process.

### Checkout Idempotency

Checkout requests use idempotency keys and checkout fingerprints to reduce the risk of duplicate orders when users retry payments or submit the same checkout more than once.

### Payment Safety

Payment processing includes server-side verification and persistent payment/refund information.

Refund reconciliation can recover eligible refunds when the initial refund operation does not complete successfully.

### API Protection

Administrative APIs require appropriate authorization, while customer-facing protected routes require authentication.

---

## ⚙️ Production Configuration

Create your environment configuration from:

```bash
.env.example
```

Configure the required production secrets in the deployment environment.

Important configuration includes:

* `MONGODB_URI`
* `NEXTAUTH_SECRET`
* `NEXT_PUBLIC_RAZORPAY_KEY_ID`
* `RAZORPAY_KEY_ID`
* `RAZORPAY_KEY_SECRET`
* `CRON_SECRET`
* `REFUND_RECONCILIATION_SECRET`
* `MOBILE_APP_ORIGIN`

`NEXT_PUBLIC_RAZORPAY_KEY_ID` must belong to the same Razorpay account/mode as the server-side Razorpay credentials.

Configure Razorpay webhooks for signed:

* `payment.captured`
* `order.paid`

events.

---

## 🧹 Inventory Cleanup

Inventory reservations expire after 15 minutes.

The included `vercel.json` schedules the authenticated inventory cleanup endpoint every five minutes using `CRON_SECRET`.

On another hosting platform, invoke:

```text
POST /api/inventory/cleanup
```

with the configured inventory cleanup secret at least every five minutes.

---

## 🗄️ MongoDB Requirements

The production checkout/inventory flow uses MongoDB transactions.

Therefore MongoDB must run as a **replica set**.

MongoDB Atlas supports this configuration.

Before enabling real payments in a production environment, verify the required order indexes:

```bash
npm run verify:order-indexes
```

The verification script is read-only. It reports missing payment-safety indexes and legacy duplicates without modifying or deleting data.

---

## 🚀 Local Development

Clone the repository:

```bash
git clone https://github.com/AndroidPayal/ai-clothing-store.git
cd ai-clothing-store
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env.local
```

Configure the required environment variables.

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📱 Mobile Application

A companion React Native / Expo mobile application is also being developed for the platform.

**Technology:** React Native · Expo

The web application exposes mobile-compatible APIs with configured CORS/origin controls.

---

## 📸 Screenshots

Screenshots of the application will be added here to showcase:

* Home page
* Product collection
* Product details
* Cart
* Checkout
* Orders
* Admin dashboard

---

## 🎯 What This Project Demonstrates

This project was built to demonstrate practical full-stack development rather than only frontend UI work.

It covers:

* Modern React / Next.js development
* TypeScript
* REST API development
* Authentication and authorization
* MongoDB data modeling
* Database transactions
* Payment integration
* Inventory consistency
* Idempotent checkout design
* Error handling and recovery
* Admin workflows
* Responsive UI
* Production deployment

---

## 👩‍💻 About the Developer

**Payal Agrawal**

Software Engineer focused on:

**React · Next.js · TypeScript · Full-Stack Development · React Native**

🔗 GitHub:
https://github.com/AndroidPayal

🔗 LinkedIn:
*Add LinkedIn profile here*

---

⭐ If you find this project interesting, feel free to explore the code and live demo.
