🛠 GreenCart – Software Design Commentary (design.md)

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

Backend (Node.js + Express):-

- Modular architecture with isolated controllers, routes, middleware, and configs

- MongoDB database with Mongoose schema design

- Authentication using JWT cookies

- Role-based access control for Seller/Admin

- Centralized validation and error handling

- Reusable utility modules (Cloudinary, Multer, Mailer)

- Jest-based unit tests for all critical modules

Frontend (React + Context API):-

- Component-driven UI

- Category & Product listing pages

- Seller dashboard pages

- Centralized state management using Context

- Axios API client for backend communication

- Fully responsive UI

Database (MongoDB / Mongoose):-

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

# 2. How the Software Design Was Improved? :-

- GreenCart underwent multiple rounds of architectural refinement to achieve a clean, scalable, and maintainable structure. Changes were driven by modularization, separation of concerns, and refactoring for clarity and testability.

# 2.1 Modularizing the Backend Architecture:-

Originally, all backend logic was merged inside routes and controllers with shared dependencies across modules. This caused:

- Tight coupling

- Difficult debugging

- Poor testability

- Code duplication

Improvement:-

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

Benefits:-

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

Benefits:-

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

Benefits:-

- Data is structured around real-world relationships

- MongoDB documents remain optimized

- Simplified lookups using population

- Clear ownership between entities

# 2.4 Centralized Configuration Modules:-

Before refactoring, API keys and third-party services were initialized at multiple places.

Improvement

Configs were isolated into /configs:

db.js → Database connection

cloudinary.js → Media storage

mailer.js → Email service

multer.js → File upload handler

Benefits

Enhances the Single Responsibility Principle

Makes testing easier via dependency mocking

Supports environment-based reconfiguration

2.5 Authentication & Authorization Redesign

The original JWT authentication had scattered validation logic.

Improvement

Two dedicated middleware units were implemented:

authUser – Authenticates customers

authSeller – Authenticates sellers

Each middleware:

Extracts JWT

Verifies token

Attaches user/seller to request

Handles unauthorized access

Benefits

Clean security boundary

Easily extendable role-based access

Improved error isolation

2.6 Cart, Checkout, and Order Logic Refactor

Cart manipulation originally occurred partially on the frontend and partially in controllers.

Improvement

All core business logic moved into:

Cart Model methods

Order Model methods

Examples:

addItem(product, qty)

updateQty(product, qty)

computeTotal()

createOrder()

Benefits

Encapsulates business rules

Ensures consistent behavior

Enables unit-testable logic inside models

Reduces controller code size

2.7 Consistent API Design & Route Separation

Routes were reorganized into individual modules:

/userRoutes

/productRoutes

/orderRoutes

/cartRoutes

/sellerRoutes

/addressRoutes

Benefits include:

Cleaner routing table

Easier debugging

Flexible microservice migration in the future

2.8 Strong Test-Driven Structural Improvements

Because backend testing was implemented early using Jest:

Code had to be modular

Controllers needed to return consistent outputs

Middlewares required predictable behavior

External dependencies were abstracted for mocking

This indirectly improved the entire backend architecture.

3. Where Design Principles Were Applied

The GreenCart system applies multiple software engineering principles.

3.1 Single Responsibility Principle (SRP)

Examples:

Controllers handle request flow only

Models contain business logic

Middlewares handle authentication only

Configs handle third-party integration only

Utils handle rendering and formatting

Routes define endpoints only

3.2 DRY (Don’t Repeat Yourself)

Repeated logic consolidated into utilities:

Cloudinary uploader

Mailer wrapper

Standard response messages

Mongoose pre/post hooks

Cart total calculation logic

3.3 Dependency Inversion Principle

Controllers do not depend on:

Database structure

External APIs directly

File uploads or email services

These are abstracted into:

Config modules

Utility functions

Middleware layers

3.4 Liskov Substitution & Interface-Like Structure

Models substitute seamlessly in controllers because:

Each adheres to defined behaviors

Controller logic expects generic patterns (CRUD, find, update)

No model relies on another’s implementation details

3.5 Separation of Concerns

Split across system layers:

Presentation (Frontend React)

Business Logic (Model Methods)

Application Logic (Controllers)

Security (Middlewares)

Data Layer (MongoDB Models)

Third-Party Services (Configs)

3.6 Clean Code & Testability Principles

Refactoring for testability required:

Pure functions

Dependency injection patterns

Predictable async flows

Eliminating side effects

Jest tests enforce this design by mocking:

Cloudinary

Mailer

Multer

MongoDB operations

4. Key Refactoring Performed
4.1 Complete Modularization of Backend

Before refactor:
Logic lived inside route handlers.

After refactor:

/controllers contains business rules

/routes only maps endpoints

/middlewares control access

/configs contain external integrations

4.2 Product, Order, and Cart Logic Moved Into Model Methods

Examples:

Order.computeTotal()

Cart.updateQty()

Product.applyOffer()

This removed duplicated logic from multiple controllers.

4.3 Consolidated Error Handler Patterns

All controllers now follow:

try {
   // business logic
} catch (error) {
   res.status(500).json({ message: error.message });
}


Advantages:

predictable response

reusable Jest tests

easier debugging

4.4 Authentication Flow Rewrite

Earlier, seller and user authentication used similar duplicated code.

Now:

Common token verification logic extracted

Seller-specific & user-specific middlewares separated

Reduced role checking complexity

4.5 Testing-Driven Refactoring

As each folder got Jest test suites:

Functions became pure and deterministic

Controllers started sending consistent responses

Conditional logic simplified

Database operations were abstracted for easy mocking

This resulted in a cleaner, more maintainable backend.

5. Final Summary

The GreenCart system now demonstrates:

✔ Clean modular architecture

✔ Strong application of SOLID principles

✔ Well-structured Mongoose schema design

✔ Separation of concerns across every layer

✔ Highly testable backend architecture

✔ Encapsulated business logic inside models

✔ Clear API routing and role-based access

✔ Improved maintainability and scalability

The design is now robust, extensible, and production-ready, supporting all e-commerce features with a professionally structured software architecture.
