# ROVIA — Comprehensive Technical Documentation

## 1. Overview
ROVIA is an enterprise-level rental operations and marketplace platform. It allows users to rent high-value assets (such as heavy machinery, luxury cars, cameras, etc.), handles security deposits and rental fees, and manages the entire physical logistics lifecycle using QR-code scanning and real-time state synchronization.

## 2. System Architecture

The platform follows a decoupled client-server architecture:

- **Frontend**: A Single Page Application (SPA) built with React 18 and Vite. Deployed on **Vercel**.
- **Backend**: A RESTful API built with Python and FastAPI. Deployed on **Render**.
- **Database**: PostgreSQL (managed by Render) and accessed asynchronously via SQLAlchemy.
- **Real-Time Communication**: WebSockets are used to broadcast order status updates to connected clients immediately.

## 3. Frontend Architecture (React & Vite)

### Technology Stack
- **Framework**: React 18, Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom Glassmorphic themes and rich UI micro-animations)
- **Icons**: Lucide React
- **HTTP Client**: Axios/Fetch for API communication.

### Core Structure
The frontend avoids heavy client-side routing libraries (like `react-router-dom`) in favor of an optimized, state-based component router handled in `App.tsx`. 

- **`src/App.tsx`**: The main entry point that maintains the `customerTab` and `adminTab` state. It dynamically renders the correct view (`Landing`, `Catalog`, `Dashboard`, `Orders`, etc.) based on the user's role and current navigation state.
- **`src/context/AuthContext.tsx`**: Manages the global authentication state, user roles, and profile information. It automatically redirects users based on their roles upon login.
- **`src/services/api.ts`**: A centralized service that handles all HTTP requests to the FastAPI backend. It also initializes and manages the WebSocket connection for real-time updates.

### Key Workflows
1. **Catalog & Booking**: Customers browse products (`Catalog.tsx`), view details, and place simulated orders.
2. **Operations Dashboard**: Renters/Admins use `Dashboard.tsx` to view incoming orders and approve them.
3. **Staff Scanner (`/staff-scanner.html`)**: A standalone, lightweight HTML/JS page designed specifically for mobile devices. Logistics staff use this page to scan QR codes on invoices to verify asset handover.

## 4. Backend Architecture (FastAPI & PostgreSQL)

### Technology Stack
- **Framework**: FastAPI (Python 3.12)
- **Database ORM**: SQLAlchemy 2.0 (Async)
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT (JSON Web Tokens) with Argon2 password hashing.

### Core Modules
- **`app/auth/`**: Handles user registration, login, JWT token issuance, and profile updates. User profiles (phone, address, bio, avatar) are persisted in PostgreSQL.
- **`app/products/`**: Manages the product catalog. Automatically generates a unique, tracking-friendly SKU (`ROV-YYYY-XXXX`) for every product created.
- **`app/rentals/`**: The core business logic module.
  - **Order Creation**: Validates dates and checks physical asset availability.
  - **Asset Provisioning**: Automatically provisions new physical asset tracking IDs if the requested dates overlap with existing bookings.
  - **State Machine**: Enforces a strict transition flow: `DRAFT` $\rightarrow$ `READY_FOR_PICKUP` $\rightarrow$ `PICKED_UP` $\rightarrow$ `ACTIVE` $\rightarrow$ `RETURN_DUE` $\rightarrow$ `RETURNED` $\rightarrow$ `COMPLETED`.
- **`app/realtime/`**: Manages WebSocket connections (`broadcaster.py`) and pushes events directly to the React frontend whenever a rental status changes.

## 5. End-to-End Rental Lifecycle

The lifecycle of a rental is tightly controlled by both the frontend and backend to ensure no physical assets are lost.

1. **Booking**: Customer selects dates and books an item. Status = `DRAFT` (or `CONFIRMED`).
2. **Approval**: Admin reviews the booking in the Dashboard and clicks "Approve". Status = `READY_FOR_PICKUP`.
3. **Verification**: 
   - Customer presents their digital Invoice containing a QR Code and Product Code.
   - Admin uses the Mobile Scanner (`staff-scanner.html`) to scan the QR code.
   - Backend verifies the secure hash token.
   - Status transitions to `PICKED_UP` and then `ACTIVE`.
4. **Return Cycle**:
   - Customer clicks "Request Return" on their Dashboard. Status = `RETURN_DUE`.
   - A real-time WebSocket alert triggers on the Admin Dashboard.
   - Admin physically inspects the returned item and clicks "Complete Return".
   - Status transitions to `COMPLETED` and the security deposit is marked for refund.

## 6. Deployment Strategy

The application is deployed using Continuous Deployment (CD) pipelines linked to the GitHub repository:

- **Frontend**: Hosted on **Vercel**. Every push to the `main` branch triggers a new Vite build. The `vercel.json` file ensures proper routing configuration for the SPA.
- **Backend**: Hosted on **Render**. The `render.yaml` Blueprint automatically provisions a managed PostgreSQL database and a Web Service for the FastAPI application.
- **CORS Configuration**: The backend explicitly trusts the Vercel production domain to ensure secure cross-origin communication.

---
*Built for the Odoo x Adamas University Hackathon 2026*
