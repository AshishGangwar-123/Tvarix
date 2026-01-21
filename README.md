# Tvarix Project

A simple, modern website built with **React** (Frontend), **Node.js/Express** (Backend), and **MongoDB** (Database).

## 📂 Project Files Explained

### **Backend (`/server`)**
- **`index.js`**: The main server file. Starts the API and connects to MongoDB.
- **`models/`**: Database schemas.
  - **`Internship.js`**: Stores internship applications.
  - **`Contact.js`**: Stores contact form messages.
  - **`Service.js`**: Stores service details.
- **`package.json`**: List of backend libraries.
- **`.env`**: Configuration file (Port, Database URL).

### **Frontend (`/client`)**
- **`index.html`**: The main HTML file.
- **`src/`**: All the React code.
  - **`main.jsx`**: The starting point of the React app.
  - **`App.jsx`**: Handles routing (Home, Internship, Contact).
  - **`index.css`**: All the styling (Vanilla CSS).
  - **`pages/Home.jsx`**: The Homepage component.
  - **`components/`**: Reusable UI parts.
    - **`Navbar.jsx`**: Top navigation menu.
    - **`Hero.jsx`**: Main banner.
    - **`Services.jsx`**: Services grid.
    - **`About.jsx`**: About section.
    - **`Internship.jsx`**: Internship form + Excel Download.
    - **`Contact.jsx`**: Contact form.
    - **`Footer.jsx`**: Footer section.
- **`public/`**: Images like `logo.png`.
- **`vite.config.js`**: Tooling configuration.
- **`package.json`**: List of frontend libraries.

## 🚀 How to Run

1.  **Start Backend**:
    - Open terminal in `server` folder.
    - Run: `node index.js`

2.  **Start Frontend**:
    - Open terminal in `client` folder.
    - Run: `npm run dev`
    - Open browser to: `http://localhost:5173`
