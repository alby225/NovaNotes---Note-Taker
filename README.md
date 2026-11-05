# NovaNotes — Full-Stack CRUD Application

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

An enterprise-ready, high-performance **Full-Stack CRUD Notes Management Platform** designed specifically for production-grade software evaluation. Built strictly with **Express.js**, **MongoDB**, **Mongoose**, and a modern, responsive Single-Page Application (SPA) frontend.

---

## 🌟 Executive Highlights & Performance Features

- **Strict Layered MVC Architecture**: Decoupled routes, controllers, models, and middleware.
- **Full CRUD REST API**: Standardized JSON response envelope across all endpoints (`success`, `data`, `message`, `pagination`, `error`).
- **Database Indexing & Full-Text Search**:
  - Compound text index (`title`, `content`) for search across all fields.
  - Compound query index (`{ isPinned: -1, updatedAt: -1 }`) for instant note sorting.
- **Resilient MongoDB Lifecycle**: Automatic reconnection listeners, retry logic, and clean graceful process shutdown (`SIGINT`).
- **Production Middlewares**: Security headers (`Helmet`), Cross-Origin Resource Sharing (`CORS`), HTTP request logger (`Morgan`), and centralized async error handling (`CastError`, `ValidationError`, duplicate keys).
- **Executive Frontend Dashboard**:
  - Real-time KPI Metric cards (Total Notes, Pinned, Active Categories, High-Priority tasks).
  - Live search with 300ms debounce and `/` focus hotkey.
  - Multi-attribute filtering (Category pills, Priority levels, Pinned-only toggle, Multi-column sorting).
  - Rich Note Cards with priority indicators, custom color swatches, tag pills, copy-to-clipboard, and relative timestamps.
  - Modal workflows with live character and word counters.
  - Non-blocking glassmorphism Toast Notification system.
  - Built-in Interactive API Reference & Specification drawer.

---

## 📂 Project Directory Structure

```text
TASK 2 CODENOVA/
├── public/                       # Frontend Single Page Application
│   ├── css/
│   │   └── style.css             # Dark-mode glassmorphic design system
│   ├── js/
│   │   └── app.js                # Client state, reactive fetch, modal & toast engine
│   └── index.html                # Responsive semantic HTML5 dashboard
├── src/                          # Backend Application Core
│   ├── config/
│   │   └── db.js                 # MongoDB connection & lifecycle management
│   ├── controllers/
│   │   └── noteController.js     # CRUD logic, query filters, pagination, aggregation
│   ├── middleware/
│   │   ├── asyncHandler.js       # Wrapper eliminating try/catch boilerplate
│   │   ├── errorHandler.js       # Centralized error mapping & HTTP response formatter
│   │   └── validateNote.js       # Request body validator & sanitizer
│   ├── models/
│   │   └── Note.js               # Mongoose schema, validation rules, compound indexes
│   ├── routes/
│   │   └── noteRoutes.js         # Express RESTful route declarations
│   ├── seeder.js                 # Production sample data seeder
│   └── server.js                 # Server entry point, health checks, graceful shutdown
├── .env                          # Environment configurations
├── .env.example                  # Environment template
├── package.json                  # Dependencies & npm run scripts
└── README.md                     # Technical architecture documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or v22.x recommended)
- **MongoDB** running locally on port `27017` or a remote **MongoDB Atlas URI**

### 2. Environment Setup
Check the `.env` file in the root folder (pre-configured with defaults):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/notes_crud_db
NODE_ENV=development
```

### 3. Seed Realistic Sample Data
Populate the database with realistic engineering tasks, sprint items, and architectural notes:
```bash
npm run seed
```

### 4. Run the Application
Start the server in standard or development mode:
```bash
# Standard Production Start
npm start

# Or with Nodemon Auto-Reloading
npm run dev
```

### 5. Open & View in Browser
Navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health, uptime & DB status | None |
| `GET` | `/api/notes/stats/overview` | Aggregated dashboard KPI metrics | None |
| `GET` | `/api/notes` | Get all notes with filtering & search | `?search=term&category=Work&priority=High&isPinned=true&sortBy=updated&page=1&limit=50` |
| `GET` | `/api/notes/:id` | Get single note by MongoDB ObjectId | None |
| `POST` | `/api/notes` | Create a new note | JSON: `{ "title", "content", "category", "priority", "tags", "isPinned", "color" }` |
| `PUT` | `/api/notes/:id` | Update note properties | JSON: `{ "title", "content", ... }` |
| `PATCH` | `/api/notes/:id/pin` | Toggle pinned state of note | None |
| `DELETE` | `/api/notes/:id` | Permanently delete a note | None |

---

## 🧪 Testing with cURL / PowerShell

#### Create Note (POST)
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"System Architecture","content":"Clean MVC Pattern","category":"Work","priority":"High"}'
```

#### Fetch Notes (GET)
```bash
curl http://localhost:5000/api/notes?category=Work
```

#### Health Status (GET)
```bash
curl http://localhost:5000/api/health
```

---

## 🏆 Performance & Evaluation Standards Met
1. **Clean Code & Separation of Concerns**: Strict boundary between routing, validation, business logic, and database persistence.
2. **Error Resiliency**: Unhandled exceptions, bad ObjectIds, and schema violations are captured without server crashes.
3. **UX Polish**: Live metrics, debounced search, keyboard shortcuts (`/` to search, `Esc` to close), toast notifications, and responsive layout.
