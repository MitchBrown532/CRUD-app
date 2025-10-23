# CRUD App

## 📌 Project Description

Practice project to learn full-stack development with React and Flask.  
Implements Create, Read, Update, and Delete (CRUD) functionality with a database backend.

---

## 🚀 Tech Stack

- **Frontend:** React, JavaScript, TailwindCSS (optional for styling)
- **Backend:** Flask (Python)
- **Database:** SQLite
- **Other Tools:** Git, REST API

---

## 📂 Features (Work in Progress)

- [✅] React frontend
- [✅] React Router for navigation
- [✅] Backend API (Flask + SQLAlchemy)
- [✅] Database for persistent storage
- [✅] Create/Read/Update/Delete items
- [✅] Filterable/Sortable/Paginated list
- [✅] Pytest coverage for backend
- [✅]
- [✅] Github workflow included
- [] Authentication (stretch goal)

---

## 🛠️ Installation & Setup

For Installation:

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
   cd backend
   pip install -r requirements.txt
   ```

For Concurrent Start-Up:

1. Run the start command:
   ```bash
   npm run start:all
   ```

- This command will concurrently run frontend & backend (including intializing the venv for backend). All data from frontend and backend will be color coded and shown in a shared console for ease of life.

For Front-end Start-up:

1. Navigate to frontend
   ```bash
   cd frontend
   ```
2. Run start-up command:
   ```bash
   npm start
   ```

For Back-end Start-up:

1. Navigate to frontend
   ```bash
   cd frontend
   ```
2. Start up Virtual Environment (if not already done)
   ```bash
   ./venv/Scripts/Activate
   ```
3. Run start-up command:
   ```bash
   python app.py
   ```

---

## 🔌 API

- GET /api/items?q=&page=&limit=&sort=id|name|created_at&order=asc|desc
- POST /api/items { name }
- PUT /api/items/:id { name }
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

For frontend tests: (not yet created)

---

## 📸 Screenshots (to add later)

![Screenshot of a functional CRUD app demonstrating all fundamentals of Full stack development](image.png)

![Screenshot of extensive backend testing with every test being passed](image-1.png)

---

## 📜 License

This project is for learning purposes only. Free to use and adapt.

---
