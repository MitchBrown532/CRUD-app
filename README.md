# CRUD App

## 📌 Project Description

Practice project to learn full-stack development with React and Flask.  
Implements full Create, Read, Update, and Delete (CRUD) functionality with a SQL database backend.

---

## 🚀 Tech Stack

- **Frontend:** React (JS, JSX, HTML, CSS), TailwindCSS (styling not complete - may just use CSS), Vitest
- **Backend:** Flask (Python), SQLAlchemy, Pytest
- **Other Tools:** Git, Github Actions (CI/CD)

---

## 📂 Features (Work in Progress)

- [✅] React frontend
- [✅] React Router for navigation
- [✅] Backend API (Flask + SQLAlchemy)
- [✅] Persistent SQL database 
- [✅] CRUD operations: Create, Read, Update, Delete 
- [✅] Filterable, sortable, and paginated lists
- [✅] Pytest for backend tests
- [✅] Vitest for frontend tests
- [✅] Github workflow included
- [] Authentication (stretch goal)

---

## 🛠️ Installation & Setup

### Installation:

1. Clone the repo:
   ```bash
   git clone https://github.com/MitchBrown532/crud-app.git
   cd crud-app
   ```
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Setup backend:

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```
4. Create ENV

   ```bash
   cd ../frontend
   touch .env
   ```
   - Add the following line to `.env `:
   ```bash
   VITE_API_URL= http://127.0.0.1:5001
   ```
   (Replace with your own back end port if different.)

### Start-Up

#### Concurrent Start-Up:

1. Run the start command:
   ```bash
   cd frontend
   npm run start:all
   ```

- This command will concurrently run frontend & backend (including intializing the venv for backend). All data from frontend and backend will be color coded and shown in a shared console for ease of life.

#### Front-end Start-up:

1. Run start-up command:
   ```bash
   cd frontend
   npm run start:frontend
   ```

#### Back-end Start-up:

1. Run start-up command:
   ```bash
   cd frontend
   npm run start:backend
   ```

---

## 🔌 API Endpoints

- GET /api/items?q=&page=&limit=&sort=id|name|created_at&order=asc|desc
- POST /api/items
- PUT /api/items/:id
- DELETE /api/items/:id

---

## 🧪 Tests

For backend tests:

1. Navigate to backend 
   ```bash
   cd backend
   ```
2. Run tests
   ```bash
   pytest -v
   ```

- This will run all backend tests and return a verbose report for each test.

For frontend tests:

1. Navigate to frontend
   ```bash
   cd frontend
   ```
2. Run tests
   ```bash
   npm run test
   ```
- This will run all frontend tests and return a verbose report for each test.

---

## ⚙️ Tech Decisions

- **Flask Factory Pattern**: The API is created via `create_app()` for clean test isolation and environment configs.
- **SQLAlchemy Models + `to_dict()`**: Models control JSON structure for predictable API.
- **Search + Debounce (300ms)**: Reduces pointless network traffic while keeping the UI responsive during typing.
- **URL-Synced State (`q`, `page`, `sort`, `order`)**: Shareable, refresh-safe views
- **Sorting Whitelist**: Only known columns (`id`, `name`, `created_at`) are accepted server-side to avoid invalid input/SQL injection vectors.
- **Optimistic Delete**: Instant UI feedback with rollback on failure for a snappy feel.
- **REST Semantics**: `201` for create, `204` for delete, descriptive `4xx` errors
- **Testing Strategy**:
  - **Backend**: Pytest covers CRUD, pagination/search, and sorting.
  - **Frontend**: Lightweight Vitest + React Testing Library smoke tests (list renders, errors render, etc.).

---

## 📸 Screenshots

![Functional CRUD app demonstrating all fundamentals of Full stack development](./screenshots/symbols.png)
![Frontend and backend testing with every test being passed](./screenshots/Tests.png)
![Health Check](./screenshots/health.png)
!["Updating" while awaiting success](./screenshots/updating.png)
!["No results" if searching for non-existent term](./screenshots/no_results.png)
!["Confirm" before deletion](./screenshots/delete_confirm.png)
![Cannot save if name exists](./screenshots/unique.png)
![Cannot Go next if last page](./screenshots/pagination.png)
![Screenshot of CI testing done through GitHub Actions - 100% succeeded.](CI/CD.png)

---

## 📜 License

This project is for learning purposes only. Free to use and adapt it.

---

## 📝 Project Status

- [✅] Core CRUD features complete
- [✅] Filtering, sorting, pagination complete
- [⬜] Add styling
- [⬜] Auth and advanced features stretch goals