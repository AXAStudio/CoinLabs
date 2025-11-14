# CoinLabs 🪙

> A sophisticated cryptocurrency exchange simulator that models real-world market dynamics with simulated digital assets.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.121.1-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Overview

**CoinLabs** is a full-stack cryptocurrency exchange simulator designed to model realistic market behavior. Unlike traditional crypto exchanges with real assets, CoinLabs operates in a controlled environment with simulated cryptocurrencies that respond to supply, demand, and market events—providing a sandbox for understanding crypto market mechanics.

### Key Vision

Create an educational platform that demonstrates:
- How cryptocurrencies interact with supply and demand dynamics
- Market impact of simulated news and events
- Portfolio management and trading strategies
- Realistic price movements including volatility spikes

---

## ✨ Features

### Core Platform Features
- **🔄 Real-time Market Simulation**: Watch simulated cryptocurrencies respond to algorithmic supply/demand dynamics
- **📊 Advanced Trading Interface**: Intuitive UI for buying/selling simulated assets
- **💼 Portfolio Management**: Track holdings, performance, and transaction history
- **📈 Market Analytics**: Real-time price charts, market overview, and technical indicators
- **🔐 User Authentication**: Secure Supabase-based authentication
- **🎨 Modern UI/UX**: Built with React, TypeScript, and Tailwind CSS using shadcn/ui components
- **📱 Responsive Design**: Fully functional on desktop and mobile devices

### Trading Features
- Multiple simulated cryptocurrencies to trade
- Real-time price updates and market data
- Buy/sell orders with instant execution
- Portfolio tracking and analytics
- Transaction history and performance metrics

### Market Features
- Supply and demand-driven price mechanics
- News event simulation affecting prices
- Market volatility and trend analysis
- Simulated altcoins with realistic price movements

---

## 📁 Project Structure

```
CoinLabs/
├── backend/                 # FastAPI backend server
│   ├── app/
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── sim_config.py   # Simulation configuration
│   │   ├── run.bash        # Startup script
│   │   ├── models/
│   │   │   └── crypto.py   # Cryptocurrency data models
│   │   ├── routers/        # API route handlers
│   │   │   ├── crypto.py   # Cryptocurrency endpoints
│   │   │   ├── market.py   # Market data endpoints
│   │   │   └── portfolio.py # User portfolio endpoints
│   │   ├── services/       # Business logic layer
│   │   │   ├── crypto.py
│   │   │   ├── market.py
│   │   │   └── portfolio.py
│   │   └── utils/          # Utility functions
│   │       ├── auth.py     # Authentication helpers
│   │       ├── db.py       # Database operations
│   │       ├── granularity.py
│   │       └── simulator.py # Core simulation engine
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── main.tsx       # Application entry point
│   │   ├── components/    # Reusable React components
│   │   │   ├── Navigation.tsx
│   │   │   ├── CryptoCard.tsx
│   │   │   ├── AddCryptoDialog.tsx
│   │   │   ├── CryptoDetailDialog.tsx
│   │   │   └── ui/        # shadcn/ui component library
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MarketOverview.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   ├── contexts/      # React context for state management
│   │   ├── hooks/         # Custom React hooks
│   │   ├── integrations/  # External service integrations
│   │   │   └── supabase/
│   │   └── styles/        # Global styles
│   ├── supabase/          # Supabase configuration & migrations
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── LICENSE
└── README.md (this file)
```

---

## 🛠 Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **FastAPI** | 0.121.1 | Modern, fast web framework |
| **Uvicorn** | 0.38.0 | ASGI server |
| **Pydantic** | 2.12.3 | Data validation |
| **NumPy** | 2.3.4 | Numerical computations |
| **Supabase** | 2.24.0 | Backend-as-a-Service (Auth, DB) |
| **Python-dotenv** | 1.2.1 | Environment configuration |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Vite** | 7.2.2 | Build tool and dev server |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS |
| **shadcn/ui** | Latest | Component library |
| **React Router** | 6.30.1 | Client-side routing |
| **Recharts** | 2.15.4 | Data visualization |
| **TanStack Query** | 5.83.0 | Server state management |
| **Supabase JS** | 2.80.0 | Frontend client |

### Infrastructure
- **Supabase**: PostgreSQL database, authentication, real-time features
- **CORS**: Enabled for frontend-backend communication

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) and **npm/bun**
- **Python** (3.11 or higher)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/AXAStudio/CoinLabs.git
cd CoinLabs
```

#### 2. Backend Setup

```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env  # Create from template or configure manually
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies with bun or npm
bun install
# OR
npm install
```

### Running the Application

#### Start Backend Server

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

#### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
bun run dev
# OR
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the URL shown in your terminal)

#### Run Backend Simulation

Alternatively, use the provided startup script:

```bash
cd backend/app
bash run.bash
```

---

## 📚 API Documentation

FastAPI automatically generates interactive API documentation. Once the backend is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Main API Endpoints

#### Market Routes (`/market`)
- `GET /market/cryptocurrencies` - Get all simulated cryptocurrencies
- `GET /market/cryptocurrencies/{symbol}` - Get specific crypto details
- `GET /market/overview` - Get market overview data
- `GET /market/history/{symbol}` - Get price history

#### Portfolio Routes (`/portfolio`)
- `GET /portfolio/balance` - Get user balance
- `GET /portfolio/holdings` - Get user holdings
- `POST /portfolio/buy` - Execute a buy order
- `POST /portfolio/sell` - Execute a sell order
- `GET /portfolio/history` - Get transaction history

#### Crypto Routes (`/crypto`)
- `GET /crypto/list` - List all cryptocurrencies
- `GET /crypto/{symbol}` - Get crypto details

---

## 💻 Frontend Features

### Pages & Components

#### Dashboard (`/dashboard`)
- Personal portfolio overview
- Holdings summary with real-time values
- Quick trade interface
- Performance metrics

#### Market Overview (`/market`)
- All available cryptocurrencies
- Real-time price updates
- Price charts and trends
- Market statistics

#### Auth (`/auth`)
- User login/registration
- Secure authentication via Supabase
- Session management

#### Settings (`/settings`)
- User preferences
- Account configuration

### Core Components

| Component | Purpose |
|-----------|---------|
| `Navigation` | Top navigation bar with menu |
| `CryptoCard` | Display individual cryptocurrency info |
| `CryptoDetailDialog` | Detailed crypto information modal |
| `AddCryptoDialog` | Buy/sell cryptocurrency interface |

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/app/sim_config.py` to customize:
- Simulation parameters
- Market dynamics
- Initial cryptocurrency data
- Price movement algorithms

### Frontend Configuration

- **Vite Config**: `frontend/vite.config.ts`
- **Tailwind**: `frontend/tailwind.config.ts`
- **TypeScript**: `frontend/tsconfig.json`
- **ESLint**: `frontend/eslint.config.js`

### Environment Variables

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DATABASE_URL=your_database_url
# Add other configuration as needed
```

---

## 🧑‍💻 Development

### Building for Production

#### Backend

```bash
cd backend
uvicorn app.main:app

#### Frontend

```bash
cd frontend
npm i
npm run dev

### Code Quality

- **Frontend**: ESLint with React and TypeScript support
- **Backend**: Python linting (consider adding Ruff or Black)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- FastAPI for the excellent backend framework
- React and TypeScript community
- shadcn/ui for beautiful components
- Supabase for seamless backend infrastructure

---

**Made by AXAStudio**