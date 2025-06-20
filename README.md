# 🐞 Intelligent Bug Triage System - Frontend

This is the React frontend for the Intelligent Bug Triage System. It allows users to upload code projects, view detected bugs and optimization hints, monitor progress in real-time, and manage access via user authentication.

---

## 📁 Folder Structure

src/

├── pages/ # Core pages like Dashboard, Upload, Login, etc.

├── components/ # Shared UI components

├── api/ # Axios instance and API helpers

├── routes/ # React Router config

├── assets/ # Static assets

---

## 🚀 Features & Functionalities

### 🔐 Authentication

- **Login Page (`/login`)**
  - Fields: Username, Password
  - On success: Saves JWT, user ID, project ID, and role to `localStorage`
  - Redirects to `/dashboard`

---

### 🏠 Dashboard Page (`/dashboard`)

- **Displays:**
  - Project name (fetched from backend using project ID)
  - Bug summary charts:
    - Pie chart: Bug priority distribution
    - Bar chart: Bugs per upload
  - Uploads table: Shows uploaded projects with bug stats

- **Components:**
  - `Spin` loader during data fetch
  - Uses `useMemo` for chart optimization

---

### ⬆️ Upload Page (`/upload`)

- **Supports:**
  - Drag-and-drop or file select (single file or `.zip`)
  - Description input
  - Progress bars:
    1. Upload complete
    2. Sanity check
    3. MongoDB storage
- **Buttons:**
  - **Submit**: Disabled until upload is processed
  - Shows live status messages (e.g., "Analyzing...", "Saved to MongoDB")
  - Displays bug results grouped by file
  - Auto-clears previous results on new upload

---

### 📄 UploadDetails Page (`/upload/:uploadId`)

- Fetches bug data for a specific upload
- **Tabs:**
  - File-wise grouping of bugs
- **Table Columns:**
  - File name, line, description, priority (with color-coded tags)

---

### 🙋 My Uploads Page (`/my-uploads`)

- Lists uploads from **current user**
- **Features:**
  - Search bar: Filters bugs by description
  - Badge count per priority (High/Medium/Low)
  - Clean Ant Design styling with loading skeletons

---

### 🌐 All Uploads Page (`/all-uploads`)

- Lists uploads **from all users**
- **Tabs:**
  - All Uploads
  - Filter by user (dropdown)
- **Search:**
  - Filters bugs by description
  - Defaults to "All Users"


## 🛠️ Tech Stack

- **React 18**
- **Vite**
- **Ant Design** (UI)
- **Recharts** (Charts)
- **Axios** (API)
- **React Router DOM** (Routing)
- **WebSocket** (Progress streaming)
- **Tailwind** (optional for new components)

---

## 📦 Environment Variables

Create a `.env` file in the root:

```bash
VITE_API_BASE_URL=https://your-backend-url.com
💬 Future Improvements
Role-based UI views

Upload history filters

Export bug reports as CSV

GitHub sync integration

🧪 Run Locally
npm install
npm run dev
