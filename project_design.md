# 🛠 GreenCart – Software Design Commentary (design.md)

# 1. Overview:-

GreenCart is a full-stack e-commerce platform designed to support:

- Customer and Seller user roles

- Product browsing, cart management, checkout flow

- Order placement and order status tracking

- Payment processing (COD / Online)

- Seller product management

- Address management

- Authentication & Authorization

- Cloudinary-based image uploads

- Modular REST API backend using Express

- Frontend built using React + Context API

- Fully tested backend using Jest

# The system includes:

**Backend (Node.js + Express):-**

- Modular architecture with isolated controllers, routes, middleware, and configs

- MongoDB database with Mongoose schema design

- Authentication using JWT cookies

- Role-based access control for Seller/Admin

- Centralized validation and error handling

- Reusable utility modules (Cloudinary, Multer, Mailer)

- Jest-based unit tests for all critical modules

**Frontend (React + Context API):-**

- Component-driven UI

- Category & Product listing pages

- Seller dashboard pages

- Centralized state management using Context

- Axios API client for backend communication

- Fully responsive UI

**Database (MongoDB / Mongoose):-**

The final class diagram reflects the complete backend schema:

- User

- Address

- Seller

- Product

- Category

- Review

- Cart & CartItem

- Order & OrderItem

- Payment

Each model clearly defines attributes, methods, and relationships (1-to-N, N-to-1, composition, aggregation).

**Core Features:-**

- User Authentication & Seller Authentication

- Product Management (CRUD for sellers)

- Cart & Checkout system

- Address Management

- Order Tracking (Pending → Processing → Delivered → Cancelled)

- Payment workflow integrated logically (Stripe-ready structure)

- Review & Category System

- Reusable REST API architecture

**System Capabilities:-**

- Role-based access control

- Secure password hashing

- Efficient cart recalculation

- Order lifecycle management

- Product stock management

- Image upload through Cloudinary

- Highly modular backend and frontend

# 2. How the Software Design Was Improved? :-

- GreenCart underwent multiple rounds of architectural refinement to achieve a clean, scalable, and maintainable structure. Changes were driven by modularization, separation of concerns, and refactoring for clarity and testability.

# 2.1 Modularizing the Backend Architecture:-

Originally, all backend logic was merged inside routes and controllers with shared dependencies across modules. This caused:

- Tight coupling

- Difficult debugging

- Poor testability

- Code duplication

**Improvement:-**

The entire backend was reorganized into a clean MVC-inspired structure:

server/
 ├── configs/
 ├── controllers/
 ├── middlewares/
 ├── models/
 ├── routes/
 ├── utils/
 └── tests/


Each layer now has a single responsibility, improving separation of concerns.

**Benefits:-**

- Increased maintainability

- Easy to locate and update specific logic

- Better test isolation

- Cleaner version control and CI/CD integration

# 2.2 Applying Reusable Patterns Across Controllers:-

Repeated logic (example: error handling, DB calls, validation) was refactored into:

- Reusable helper methods

- Mongoose model instance methods

- Shared response patterns

- Centralized error messages

**Benefits:-**

- Eliminated repetition (DRY principle)

- Clearer controller code

- Reduced chances of inconsistent responses

# 2.3 Improved Model Design Using Composition & Aggregation:-

The final class diagram reflects strong use of composition, aggregation, and referencing:

- Order contains multiple OrderItems (composition)

- Cart aggregates CartItems

- Product aggregates multiple Review objects

- User aggregates multiple Address objects

- Category → Product is a strong aggregation

**Benefits:-**

- Data is structured around real-world relationships

- MongoDB documents remain optimized

- Simplified lookups using population

- Clear ownership between entities

# 2.4 Centralized Configuration Modules:-

Before refactoring, API keys and third-party services were initialized at multiple places.

**Improvement:-**

Configs were isolated into /configs:

- db.js → Database connection

- cloudinary.js → Media storage

- mailer.js → Email service

- multer.js → File upload handler

**Benefits:-**

- Enhances the Single Responsibility Principle

- Makes testing easier via dependency mocking

- Supports environment-based reconfiguration

# 2.5 Authentication & Authorization Redesign:-

The original JWT authentication had scattered validation logic.

**Improvement:-**

Two dedicated middleware units were implemented:

- authUser – Authenticates customers

- authSeller – Authenticates sellers

**Each middleware:-**

- Extracts JWT

- Verifies token

- Attaches user/seller to request

- Handles unauthorized access

**Benefits:-**

- Clean security boundary

- Easily extendable role-based access

- Improved error isolation

# 2.6 Cart, Checkout, and Order Logic Refactor:-

Cart manipulation originally occurred partially on the frontend and partially in controllers.

**Improvement:-**

All core business logic moved into:

- Cart Model methods

- Order Model methods

**Examples:**

- addItem(product, qty)

- updateQty(product, qty)

- computeTotal()

- createOrder()

**Benefits:-**

- Encapsulates business rules

- Ensures consistent behavior

- Enables unit-testable logic inside models

- Reduces controller code size

# 2.7 Consistent API Design & Route Separation:-

Routes were reorganized into individual modules:

- /userRoutes

- /productRoutes

- /orderRoutes

- /cartRoutes

- /sellerRoutes

- /addressRoutes

**Benefits include:-**

- Cleaner routing table

- Easier debugging

- Flexible microservice migration in the future

# 2.8 Strong Test-Driven Structural Improvements:-

Because backend testing was implemented early using Jest:

- Code had to be modular

- Controllers needed to return consistent outputs

- Middlewares required predictable behavior

- External dependencies were abstracted for mocking

This indirectly improved the entire backend architecture.

# 2.9 Decoupled Authentication Logic:-

Earlier, authentication and authorization logic was mixed inside routes.

**Improvement:-**

Created separate middlewares:

- authUser.js

- authSeller.js

**Benefits:-**

- Prevention of duplicate authentication code

- Reusable across the entire API

- Clear role-based access control

This applies Single Responsibility Principle (SRP) and Open/Closed Principle (OCP).

# 2.10 Improved Database Layer With Proper Schema Design:-

The database schemas (User, Product, Cart, Order, Address, Review, Category) are designed to match real e-commerce workflows.

**Improvements:-**

- Added proper references (ObjectId) to model relationships

- Normalized cart & order structure

- Added enums for payment status, order status

- Added nested subdocuments for order items

- Avoided redundant duplication of product details

**Outcome:-**
- Your final class diagram accurately represents a clean domain model with clear relationships → 1.., 0.., composition, aggregation, and association.

# 2.11 Cleaner Product & Cart Logic Through Utility-Based Updates:-

Instead of recalculating totals everywhere:

**Improvement:-**

- Cart has computeTotal() method

- Order has computeTotal() method

- updateQty() and addItem() logic centralized

**Benefits:-**

- No duplicate logic

- High consistency in calculations

- Easy to update discounts, GST, fees in future

This follows DRY (Don’t Repeat Yourself) + Encapsulation.

# 2.12 Order Lifecycle Refactoring:-

Originally, order creation lacked status control.

**Improvement:-**

Introduced full order lifecycle:

- Pending

- Picked Up

- On the way

- Delivered

- Cancelled

- Seller/Admin can update order status

- Order maintains payment information separately (Payment class)

This improves State Management and Domain-driven design.

# 2.13 Cloudinary & Nodemailer Moved to Config Layer:-

At first, integration keys were mixed inside controllers.

**Improvement:-**

All external services moved to /configs

- cloudinary.js

- mailer.js

- multer.js

- db.js

**Benefits:-**

- Centralized configuration

- Easier deployment

- More secure + reusable

- Controllers stay clean and focused

This applies Separation of Concerns & Dependency Inversion.

# 2.14 Enhanced Folder Structure for Scalability:-

server/
│── configs/
│── controllers/
│── middlewares/
│── routes/
│── models/
│── tests/
client/
│── src/components/
│── src/pages/
│── src/context/
│── src/services/
│── tests/


This mirrors industry-level scalable architecture, making future microservice migration easier.

# 3. Where Design Principles Were Applied? :-

The GreenCart system applies multiple software engineering principles.

# 3.1 Single Responsibility Principle (SRP):-

Each component focuses on only one responsibility:

**Examples:**

- Controllers → handle request logic

- Routes → routing only

- Middlewares → auth & validation

- Models → data design

- Configs → initialize external services

- Context API → global frontend state

# 3.2 Open/Closed Principle (OCP):-

The system is open for extension but closed for modification:

- Adding new payment method (Stripe → PayPal) requires no change in Order logic

- Adding new product categories requires no backend API change

- Middleware architecture allows adding new roles
- 
# 3.3 DRY (Don’t Repeat Yourself):-

- Repeated logic consolidated into utilities:

- Cloudinary uploader

- Mailer wrapper

- Standard response messages

- Mongoose pre/post hooks

- Cart total calculation logic

- Centralized error handling

- Shared utility functions

- Reusable validation

- Reusable frontend components (Navbar, Footer, ProductCard)

# 3.4 Dependency Inversion Principle:-

- Controllers do not depend on:

-Database structure

- External APIs directly

- File uploads or email services

- These are abstracted into:

- Config modules

- Utility functions

- Middleware layers

Controllers depend on abstract services, not concrete implementations:

- Cloudinary config file → not used directly

- Nodemailer config → injected

- Database config → abstracted

# 3.5 Liskov Substitution & Interface-Like Structure:-

Models substitute seamlessly in controllers because:

- Each adheres to defined behaviors

- Controller logic expects generic patterns (CRUD, find, update)

- No model relies on another’s implementation details

User and Seller share similar behaviors:

- Both authenticate

- Both manage profiles

- Both have separate dashboards

Yet, seller-specific privileges do not break user behavior.

# 3.6 Separation of Concerns:-

- Split across system layers:

- Presentation (Frontend React)

- Business Logic (Model Methods)

- Application Logic (Controllers)

- Security (Middlewares)

- Data Layer (MongoDB Models)

- Third-Party Services (Configs)

# 3.7 Clean Code & Testability Principles:-

Refactoring for testability required:

- Pure functions

- Dependency injection patterns

- Predictable async flows

- Eliminating side effects

- Jest tests enforce this design by mocking:

- Cloudinary

- Mailer

- Multer

- MongoDB operations

- Consistent naming

- Async/Await everywhere

- Try/Catch properly placed

- Small functions instead of long blocks

# 3.8 Interface Segregation Principle (ISP):-

Frontend components and backend controllers follow minimal interfaces:

- CartItem component expects only qty, price, product

- ProductController handles only product-related operations

- OrderController handles only order workflow

No component depends on methods it does not use.

# 3.9 Encapsulation & Information Hiding:-

Models expose only necessary properties and use methods internally to maintain integrity.

Example:

- Cart does not allow manual modification of totals

- Only addItem() and updateQty() can modify cart structure

# 4. Key Refactoring Performed:-

# 4.1 Controller Logic Refactoring:-

**Originally:** 
- Large route handler files with mixed DB logic.

**Now:**

- Controllers are modular and testable

- Reduced functions from 80+ lines → 20–30 lines

- Each controller function handles:

- Input validation

- Logic execution

- Response formatting

# 4.2 Cart System Refactoring:-

**Before:**

- Cart recalculation scattered across 4–5 files

- Duplicate logic for subtotal calculation

**After:**

- Centralized computeTotal() and subtotal() logic

- CartItem structured properly

- Quantity-based updates isolated

# 4.3 Product Management Refactoring:-

- Moved image handling to multer.js

- Cloudinary upload decoupled from controller

- Price & offerPrice validations standardized

# 4.4 Authentication Refactoring:-

**Before:**

- Duplicate JWT verification

- Password hashing repeated in multiple places

**After:**

- Centralized password hashing

- Middleware verifies JWT uniformly

- Role-based access logic cleaned

# 4.5 Order Workflow Refactoring:-

- Introduced status enum

- Decoupled payment details

- Cleaned lookup logic for seller and user

# 4.6 Improved Testing Architecture:-

**Before:**

- No automated testing

- Manual validation only

**After:**

- 61 Jest test cases

- Configs, Controllers, Middlewares, Routes all tested

- Tests placed using industry-standard folder structure

- External dependencies mocked

This significantly proves design reliability.

# 4.7 Complete Modularization of Backend:-

**Before refactor:**

- Logic lived inside route handlers.

**After refactor:**

- /controllers contains business rules

- /routes only maps endpoints

- /middlewares control access

- /configs contain external integrations

# 4.8 Product, Order, and Cart Logic Moved Into Model Methods:-

**Examples:**

- Order.computeTotal()

- Cart.updateQty()

- Product.applyOffer()

This removed duplicated logic from multiple controllers.

# 4.9 Consolidated Error Handler Patterns:-

All controllers now follow:

try {

   // business logic
   
} catch (error) {

   res.status(500).json({ message: error.message });
   
}

**Advantages:**

- predictable response

- reusable Jest tests

- easier debugging

# 4.10 Authentication Flow Rewrite:-

Earlier, seller and user authentication used similar duplicated code.

**Now:**

- Common token verification logic extracted

- Seller-specific & user-specific middlewares separated

- Reduced role checking complexity

# 4.11 Testing-Driven Refactoring:-

As each folder got Jest test suites:

- Functions became pure and deterministic

- Controllers started sending consistent responses

- Conditional logic simplified

- Database operations were abstracted for easy mocking

This resulted in a cleaner, more maintainable backend.

# 5. Final Summary:-

**The GreenCart system now demonstrates:**

- ✔ Clean modular architecture

- ✔ Strong application of SOLID principles

- ✔ Well-structured Mongoose schema design

- ✔ Separation of concerns across every layer

- ✔ Highly testable backend architecture

- ✔ Encapsulated business logic inside models

- ✔ Clear API routing and role-based access

- ✔ Improved maintainability and scalability

**The redesigned GreenCart system is now:**

✔ More modular

✔ More maintainable

✔ More scalable

✔ More testable

✔ Cloud-ready (Vercel Deployment)

✔ Designed using strong software engineering principles

**This design.md file showcases:**

- How the system architecture evolved

- What improvements were made

- Where each design principle was applied

- How refactoring enhanced performance & maintainability

- How the final class diagram maps perfectly to the backend models
  
The design is now robust, extensible, and production-ready, supporting all e-commerce features with a professionally structured software architecture.
