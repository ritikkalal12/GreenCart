# 🛒 GreenCart – MERN Full-Stack Grocery Application

GreenCart is a full-stack grocery web application built using the **MERN Stack (MongoDB, Express, React, Node.js)**.  
It provides two major roles:

- 👤 **Users** – Browse products, add to cart, manage addresses, and place orders  
- 🛍️ **Sellers** – Add/update/manage products and view orders  

It includes secure JWT authentication, Cloudinary integration for product images, and complete backend + frontend testing.

---

## 🚀 Project Overview

GreenCart simplifies online grocery shopping with core e-commerce features, cart management, order workflow, and seller dashboards.  
The project includes:

✔ Full Authentication (User + Seller)  
✔ Product CRUD  
✔ Cart System  
✔ Order Management  
✔ Seller Dashboard  
✔ Mailer (SMTP)  
✔ Cloudinary Upload  
✔ Complete API Structure  
✔ Frontend Testing (Vitest)  
✔ Backend Testing (Jest)

---

# 🔗 **Repository Link**

👉 https://github.com/ritikkalal12/GreenCart.git

---

# 🧩 Prerequisites

Before running this project, install:

- Node.js (LTS)
- MongoDB Atlas account (or local MongoDB)
- Postman / Insomnia
- Git
- VS Code
- Cloudinary Account (for product images)

---

# 📥 1. Clone Repository

``bash
git clone https://github.com/ritikkalal12/GreenCart.git
cd GreenCart

🧱 Backend Setup (server/)
📁 Navigate to Server
cd server

🧱 Backend Setup (server/)
📁 Navigate to Server
cd server

📦 Install Dependencies
npm install

⚙️ Create .env File
Create inside /server folder:
touch .env

Paste the following:

PORT=5000
MONGODB_URI=<YOUR_MONGODB_URI>
JWT_SECRET=<YOUR_JWT_SECRET>

CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>

MAILER_HOST=<SMTP_HOST>
MAILER_PORT=<SMTP_PORT>
MAILER_USER=<SMTP_USER>
MAILER_PASS=<SMTP_PASSWORD>


🔐 Generate secure JWT key:
https://random.org/passwords/?num=1&len=32&format=plain&rnd=new

🚀 Start Backend
npm run dev

If nodemon isn't installed:
npm install -g nodemon

🎨 Frontend Setup (client/)
📁 Navigate to Client
cd ../client

📦 Install Dependencies
npm install

🌐 Start Frontend
npm run dev

🔗 Default URLs:
| Service  | URL                                                    |
| -------- | ------------------------------------------------------ |
| Frontend | [http://localhost:5173](http://localhost:5173)         |
| Backend  | [http://localhost:5000/api](http://localhost:5000/api) |

📁 Final Project Folder Structure
greencart/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── seller/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── configs/
│   │   ├── db.js
│   │   └── mailer.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── index.js
│
├── .gitignore
├── README.md
└── package.json

📌 API Endpoints — Complete Breakdown:

👤 User API
Base URL: /api/user
| Method | Endpoint          | Description          | Access |
| ------ | ----------------- | -------------------- | ------ |
| POST   | `/register`       | Register new user    | Public |
| POST   | `/login`          | Login user & get JWT | Public |
| GET    | `/profile`        | Get user profile     | Auth   |
| PUT    | `/profile/update` | Update user profile  | Auth   |
| DELETE | `/profile/delete` | Delete user          | Auth   |

🛍️ Product API
Base URL: /api/products
| Method | Endpoint      | Description        | Access |
| ------ | ------------- | ------------------ | ------ |
| GET    | `/`           | Get all products   | Public |
| GET    | `/:id`        | Get product by ID  | Public |
| POST   | `/`           | Create new product | Seller |
| PUT    | `/update/:id` | Update product     | Seller |
| DELETE | `/delete/:id` | Delete product     | Seller |

🛒 Cart API
Base URL: /api/cart
| Method | Endpoint      | Description      | Access |
| ------ | ------------- | ---------------- | ------ |
| GET    | `/`           | Get user cart    | Auth   |
| POST   | `/add`        | Add item to cart | Auth   |
| PUT    | `/update/:id` | Update quantity  | Auth   |
| DELETE | `/remove/:id` | Remove product   | Auth   |

📦 Order API
Base URL: /api/orders
| Method | Endpoint      | Description              | Access      |
| ------ | ------------- | ------------------------ | ----------- |
| POST   | `/create`     | Create new order         | Auth        |
| GET    | `/`           | Get user orders          | Auth        |
| PUT    | `/update/:id` | Update order status      | Seller      |
| GET    | `/seller`     | Seller — view all orders | Seller Only |

🧪 Testing
🔹 Backend Testing (Jest):-

Backend tests stored in:
server/tests/

Run backend tests:
npm test

🔹 Frontend Testing (Vitest + React Testing Library):-

Frontend tests stored in:
client/tests/

Run frontend tests:
npm test

🧠 Features:-

✔ User Features:

Register / Login / JWT Auth
Browse products
Filter by category
View product details
Manage cart
Place order
Manage address

✔ Seller Features

Seller Login
Add / Update / Delete Products
Manage Orders
Seller Dashboard

✔ System Features

Cloudinary Image Upload
Secure Authentication
Error Handling
Reusable React Components
Automated Testing

🛠️ Built With

React.js (Vite)
Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
Cloudinary
Jest (Backend Tests)
Vitest + React Testing Library (Frontend Tests)
TailwindCSS

🚀 Deployment Instructions (Frontend + Backend on Vercel):-

GreenCart is fully deployed using Vercel, hosting both:
Frontend (React + Vite)
Backend (Node.js + Express Serverless Functions)

🔗 Live Deployment Link
👉 https://green-cart-er7g.vercel.app/

The entire deployment process followed the steps shown in this video tutorial:
📺 Deployment Tutorial Reference: https://www.youtube.com/watch?v=xoZLBzi3fuM

✅ Step-by-Step Deployment Guide:-

1️⃣ Prepare Your Project:

Before deploying:

✔ Ensure the backend exposes routes using relative paths (e.g., /api/products)
✔ Add a vercel.json file in the server folder to configure serverless functions
✔ Move environment variables to Vercel Dashboard
✔ Make sure both client and server build independently

🛠 Backend Deployment (Express API on Vercel):-

2️⃣ Go to Your Server Folder
cd server

3️⃣ Add Required Files for Vercel Deployment

Create vercel.json:

{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}

This converts your backend into serverless functions.

4️⃣ Add Environment Variables to Vercel

Go to:
Vercel Dashboard → Project → Settings → Environment Variables

Add the following:

MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
MAILER_HOST=
MAILER_PORT=
MAILER_USER=
MAILER_PASS=

5️⃣ Deploy Backend
vercel --prod

This generates your backend API URL like:
https://greencart-backend.vercel.app/api/

🎨 Frontend Deployment (React + Vite on Vercel):

6️⃣ Go to Client Folder
cd client

7️⃣ Build the Frontend (optional for testing)
npm run build

8️⃣ Deploy to Vercel
vercel --prod

Vercel automatically detects Vite + React and deploys correctly.

🔗 Connect Frontend with Backend:
Inside client/.env add:
VITE_API_URL=https://<your-backend-name>.vercel.app/api

Rebuild & redeploy:
npm run build
vercel --prod

🤝 Contributing

Fork the repository
Create a new branch
Commit your changes
Push your branch
Create Pull Request

📜 License

This project is licensed under the MIT License.

📞 Contact

GitHub: https://github.com/ritikkalal12
Project Repo: https://github.com/ritikkalal12/GreenCart.git

🎉 Thank you for exploring GreenCart!
Happy Coding 🚀
