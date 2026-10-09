# FlowSuite — All-in-One Workspace Management Platform

FlowSuite is a full-stack B2B SaaS workspace management platform designed to help organizations manage teams, projects, tasks, customers, and business workflows from a centralized workspace.

The platform brings collaboration, access control, workspace configuration, and productivity tracking together in one place.

## Key Features

* **Workspace Management** — Organize work and manage workspace settings.
* **Team Management** — Manage team members and role-based access.
* **Role-Based Access Control (RBAC)** — Control access according to user roles and permissions.
* **Project & Task Management** — Organize projects, assign tasks, and track progress.
* **Customer Management** — Maintain customer information and manage customer records.
* **Dashboard & Analytics** — View workspace activity and productivity metrics.
* **Audit Logs** — Track relevant activities for better visibility and accountability.
* **Subscription & Usage Management** — Support plan-based features and usage limits.
* **Authentication** — Register, log in, and manage password recovery.
* **Workspace Settings** — Configure profile, security, preferences, and workspace options.

## Tech Stack

**Frontend**

* React
* JavaScript
* React Router
* Axios
* CSS
* Lucide React

**Backend**

* Node.js
* Express.js
* REST API architecture
* JWT-based authentication

**Database**

* MongoDB

## Project Structure

```text
FlowSuite/
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── styles/
└── server/
    ├── routes/
    ├── controllers/
    ├── models/
    └── middleware/
```

*Note: The directory structure above is representative. Update it if your actual backend folder or file organization differs.*

## Getting Started

### Prerequisites

* Node.js and npm
* MongoDB
* Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd FlowSuite
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd server
npm install
```

Create a `.env` file using the environment variables required by your backend configuration.

Example variable names:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
```

Use the actual variable names expected by your server code. Never commit real credentials or secrets.

Start the backend using the development script configured in `package.json`:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

The frontend API client currently uses:

```text
http://localhost:5000/api
```

If your environment requires a different API URL, configure it according to your API service implementation.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Security Notes

* Keep environment variables and credentials private.
* Use secure, unique JWT secrets.
* Validate incoming requests on the server.
* Enforce authorization on protected backend endpoints.
* Never commit `.env` files containing real secrets.

## Project Goals

FlowSuite aims to provide a centralized platform for workspace collaboration, project execution, customer management, access control, and operational visibility.

The project demonstrates full-stack development, REST API integration, authentication, database-backed application design, and modular frontend architecture.

## Future Improvements

Potential areas for further improvement include automated testing, deployment hardening, monitoring, accessibility improvements, and additional integrations.

## Author

**Sanjana Singh**

GitHub: [https://github.com/2710082006](https://github.com/)
