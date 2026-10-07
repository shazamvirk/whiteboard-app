# 🎨 Real-Time Collaborative Whiteboard

A lightweight, responsive, real-time interactive whiteboard application built with React, Konva.js, Redux Toolkit, Node.js, and Socket.IO.

---

## ✨ Features

- 🖌️ **Drawing Tools**: Freehand pen, eraser, rectangle, and circle tools.
- 📐 **Shape Manipulation**: Select, move, resize, scale, and rotate shapes using visual handles.
- 🎨 **Color & Styling**: Customizable stroke colors, line thickness, and transparent or semi-transparent shape fills.
- 🔄 **Real-Time Collaboration**: Instant canvas updates and live peer cursor positions across connected users.
- 📱 **Mobile & Touch Friendly**: Smooth touch gesture support with a responsive floating toolbar.
- 🧹 **Clear Canvas**: Instantly wipe the board for all connected users in real time.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + Vite + TypeScript
- **Canvas Library**: Konva / React-Konva
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Real-Time**: Socket.IO Client
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express
- **Real-Time Engine**: Socket.IO
- **Database**: MongoDB (Mongoose)
- **Language**: TypeScript

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
Make sure you have Node.js (v18 or higher) installed on your system.

---

### 1. Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git](https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git)
cd whiteboard_project

```

---

### 2. Setup & Run Backend (Server)

1. Open a terminal and navigate to the `server` directory:
```bash
cd server

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `server` folder:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/whiteboard

```


4. Start the backend development server:
```bash
npm run dev

```



---

### 3. Setup & Run Frontend (Client)

1. Open a new terminal window and navigate to the `client` directory:
```bash
cd client

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `client` folder:
```env
VITE_SOCKET_URL=http://localhost:5000
VITE_DEFAULT_ROOM=default-room

```


4. Start the frontend development server:
```bash
npm run dev

```


5. Open your browser and navigate to `http://localhost:5173`. Open a second tab or browser window to test real-time collaboration!

---

## 📂 Project Structure

```text
whiteboard_project/
├── client/                 # Frontend Application
│   ├── src/
│   │   ├── components/     # Canvas, Toolbar, Header
│   │   ├── store/          # Redux Toolkit Slices & Store
│   │   ├── types/          # TypeScript Interfaces & Definitions
│   │   └── App.tsx
│   └── vite.config.ts
│
└── server/                 # Backend Application
    ├── src/
    │   ├── config/         # Database Connection
    │   ├── sockets/        # Real-time Socket.IO Event Handlers
    │   └── index.ts        # Express Server Entry Point
    └── tsconfig.json

```

---
