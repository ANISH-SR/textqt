# TextQt - AI-Powered Data Analysis Platformface that learns and adapts to your workflow using HydraDB for persistent memory and Clerk for secure authentication.

## 🚀 Features

- **🔐 Secure Authentication**: Google sign-in with Clerk
- **Smart SQL Generation**: Natural language to SQL using OpenRouter LLM
- **Persistent Memory**: HydraDB remembers your preferences, queries, and business context
- **Data Upload**: Support for CSV and JSON files with DuckDB backend
- **Real-time Chat Interface**: Interactive chat with SQL preview and results visualization
- **Multi-tenant**: Per-user and per-organization memory isolation
- **Chart Visualization**: Automatic chart generation from query results

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  React Frontend (Next.js)           │
│  - Clerk Authentication             │
│  - Chat interface                   │
│  - SQL preview panel                │
│  - Chart / table result            │
│  - Memory sidebar                   │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  FastAPI Backend                    │
│  - Clerk JWT verification           │
│  - HydraDB.recall() + store()      │
│  - LLM (OpenRouter)                │
│  - SQL execution (DuckDB)          │
│  - File upload & processing         │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│  DuckDB Database                   │
│  User uploaded CSV/JSON data       │
└─────────────────────────────────────┘
```

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- HydraDB API key
- OpenRouter API key
- Clerk application (for authentication)

## 🛠️ Setup

### 1. Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Enable Google OAuth provider
4. Note your Publishable Key and Secret Key
5. Configure redirect URLs:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/chat`
   - After sign-up: `/chat`

### 2. Clone and Install Dependencies

```bash
# Backend setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
npm install
```

### 3. Environment Configuration

Create a `.env` file with your API keys:

```env
# HydraDB API Key
HYDRADB_API_KEY=your_hydradb_api_key

# OpenRouter API Key  
OPENROUTER_API_KEY=your_openrouter_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
DEBUG=true

# DuckDB Database Path
DATABASE_PATH=./data.duckdb

# Tenant Configuration
DEFAULT_TENANT_ID=textql-app
```

### 4. Start the Services

```bash
# Start backend (Terminal 1)
source venv/bin/activate
python backend/main.py

# Start frontend (Terminal 2)  
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- **Protected Chat**: http://localhost:3000/chat (requires sign-in)
- **Sign-in**: http://localhost:3000/sign-in
- **Sign-up**: http://localhost:3000/sign-up
- API Docs: http://localhost:8000/docs

## 📊 Usage

### 1. Sign In / Sign Up
- Visit http://localhost:3000/chat
- You'll be redirected to sign-in
- Use Google OAuth to create an account or sign in
- After authentication, you'll be redirected to the chat interface

### 2. Upload Data
- Click "Upload CSV/JSON" in the chat interface
- Select your data file
- The system will automatically create tables in DuckDB

### 3. Ask Questions
```bash
# Examples:
"show me revenue by region"
"what are the total orders by product?" 
"which region has the highest sales?"
"show me revenue trends over time"
```

### 4. Memory Features
- **Column Aliases**: System learns that "revenue" means specific formulas
- **Preferences**: Remembers preferred chart types and filters  
- **Context**: Maintains business terminology per organization
- **History**: Stores past queries for proactive insights

## 🔧 API Endpoints

All protected endpoints require a valid Clerk JWT token:

### Chat (Protected)
```bash
POST /chat
Authorization: Bearer <clerk_jwt_token>
{
  "message": "show me revenue by region"
}
```

### Upload (Protected)
```bash
POST /upload
Authorization: Bearer <clerk_jwt_token>
Content-Type: multipart/form-data
file: your_data.csv
```

### Memory (Protected)
```bash
GET /memory
Authorization: Bearer <clerk_jwt_token>
```

### Tables (Protected)
```bash
GET /tables
Authorization: Bearer <clerk_jwt_token>
```

### Health (Public)
```bash
GET /health
```

## 🧠 HydraDB Memory Layers

What gets stored per user:
- **Column aliases**: "revenue" = orders.total - refunds.amount
- **Preferred chart types**: bar charts for regional data
- **Default filters**: last 30 days, specific regions
- **Past queries**: complete question-SQL-result triples
- **Corrections**: user feedback for continuous improvement
- **Business terminology**: company-specific definitions

## 🎯 The "Before You Ask" Experience

As you use the system, HydraDB learns to provide proactive insights:

**Session 1**: You ask "show me revenue by region"
**Session 3**: You type "rev" → System knows you mean revenue by region
**Session 6**: System greets you with "Revenue by region is down 12% vs last week"

## 🔍 Sample Data Flow

1. **Sign In**: User authenticates with Google via Clerk
2. **Upload**: CSV file → DuckDB table creation
3. **Query**: "show me revenue by region" 
4. **Recall**: HydraDB retrieves past revenue queries and preferences for this user
5. **Generate**: LLM creates SQL using context + schema
6. **Execute**: DuckDB runs the query
7. **Store**: HydraDB saves the interaction for this specific user
8. **Respond**: Natural language + chart + SQL preview

## 🚀 Production Deployment

### Backend
```bash
# Using Docker
docker build -t textql-backend .
docker run -p 8000:8000 --env-file .env textql-backend

# Or using Gunicorn
pip install gunicorn
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
# Build for production
npm run build
npm start

# Or deploy to Vercel/Netlify
```

### Environment Variables for Production
```env
# Production Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key

# Production API keys
HYDRADB_API_KEY=your_production_key
OPENROUTER_API_KEY=your_production_key
```

## 🔒 Security Features

- **Clerk Authentication**: Industry-standard OAuth with Google
- **JWT Token Verification**: Secure token validation
- **Per-User Data Isolation**: Each user's data is completely separate
- **Protected API Endpoints**: All sensitive endpoints require authentication
- **Secure Memory Storage**: HydraDB isolates memories by user ID

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the API docs at http://localhost:8000/docs
- Review the HydraDB documentation at https://docs.hydradb.com
- Review Clerk documentation at https://docs.clerk.com
- Open an issue on GitHub

---

**Built with ❤️ using FastAPI, Next.js, Clerk, HydraDB, and DuckDB**
