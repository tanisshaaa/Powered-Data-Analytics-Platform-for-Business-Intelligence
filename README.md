# RetailGPT - Powered Data Analytics Platform for Business Intelligence

Your D2C store generates data. **RetailGPT tells you how to scale it.**
An autonomous AI Business Analyst that continuously audits Shopify & Stripe logs, explains anomalies in real-time, predicts stock-outs, and executes revenue-saving overrides automatically.

RetailGPT acts as an AI-powered Business Intelligence (BI) platform that enables users to interact with their retail sales data using natural language. It combines **Text-to-SQL**, **Retrieval-Augmented Generation (RAG)**, and **Machine Learning** to act as a virtual Senior Business Analyst.

---

### 🚨 The Dilemma & The Solution: The transition from Raw Logs to Revenue Certainty

**01 The Raw Data Firehose**
Every day, storefronts generate thousands of transactional rows across Shopify checkout systems and Stripe gateway APIs. An unreadable mass of server logs.

**02 The Blindspot Gap**
Standard dashboards show static, historical figures. They tell you sales fell, but stay completely silent on the root cause, leaving you with guesses and leakages.

**03 The Intelligence Bridge**
RetailGPT acts as your continuous digital audit layer. It connects directly to live logs and processes complex shifts into human-readable action triggers immediately.

> “We bypassed flat dashboards. RetailGPT is a fully localized AI analyst that answers business questions and resolves logistical stockouts inside the database in real-time.”

### 📊 LIVE STORE EVENT STUDY: Normal vs Anomaly Trigger
A merchant sells 100 items daily. Suddenly, channel sales plummet to 40.
- **Standard Day**: 100 sales
- **Anomaly Day**: 40 sales (-60% Drop Spotted!)

The visual drop is immediately highlighted. But as a shop owner, you are flooded with critical diagnostic questions:
- **Why did sales drop?** 📉 Is it a checkout gateway latency, an ad campaign flag, or catalog glitches?
- **Which product caused it?** 📦 Is the inventory dry for a single core SKU, or is a collection slow?
- **Is this temporary or serious?** 🧐 Should we wait for organic recovery, or trigger high-alert routing?
- **What will next week look like?** 🔮 Project our weekly cash balances and safety margins based on drift.
- **Do I need to reorder inventory?** 🛒 Has consumption velocity triggered safety-limit points?
- **Is there fraud or a system issue?** 🚨 Are Checkout codes duplicating discount rules or webhook logs?

RetailGPT answers these questions automatically, providing real-time resolutions to logistical and operational anomalies.

---

## 🌟 Key Features

- **Continuous Anomaly Detection**: Monitors incoming sales data to detect outliers in revenue, profit, or quantity.
- **Predictive Demand Forecasting & Auto-Pilot Stock Reordering**: Leverages **XGBoost** machine learning models to track overall sales performance, predict future trends with precision, and forecast demand to avoid stock-outs.
- **Payment Gateway Exploits Guard**: Actively monitors and guards against unexpected patterns in payment logs.
- **Natural Language Chatbot**: Ask questions in plain English (e.g., *"What category generated the most sales?"*). The system translates this into SQL, executes it against the database, and visualizes the results.
- **Retrieval-Augmented Generation (RAG)**: The chatbot retrieves context from corporate policy documents (shipping rules, return policies) to enrich its answers using semantic search (ChromaDB).
- **Automated Visualizations**: Automatically generates the most appropriate charts (Line, Bar, Pie, or Table) using `Recharts` based on the query results.
- **Robust Fallbacks**: Automatically falls back to local SQLite, local datasets, and word-matching if external cloud services (Supabase, OpenAI, ChromaDB) are unavailable.

## 🏗️ Architecture & Tech Stack

- **Frontend**: React, TypeScript, Vite, Recharts, React Router.
- **Backend**: Node.js, Express.js.
- **AI & Machine Learning (Python)**:
  - **OpenAI API**: Translates Natural Language to SQL and generates professional analyst summaries.
  - **ChromaDB & `sentence-transformers`**: Handles local vector embeddings and semantic search for the RAG pipeline.
  - **Pandas & NumPy**: For data manipulation, forecasting, and anomaly detection.
- **Databases**: Supabase (PostgreSQL) as the primary cloud database, with an in-memory local SQLite database as a seamless fallback.

## 📂 Project Structure

- `/frontend/` - React application containing the UI components (Chatbot, Dashboard, Anomaly Monitoring).
- `/backend/` - Node.js Express server that handles API requests and spawns Python ML scripts.
- `/ml/` - Core Python scripts for AI functions (`chatbot.py` for RAG and Text-to-SQL, anomaly detection, etc.).
- `/rag/` - Contains the `chroma_db` vector database and the `/rag/docs/` folder with corporate policy text files.
- `/data/` - Holds local datasets like `cleaned_superstore.csv` to feed the SQLite fallback database.
- `/database/` - Supabase and database-related configurations and scripts.

## ⚙️ How It Works (Chatbot Flow)

1. **User Input**: The user types a question in the React frontend.
2. **Backend Relay**: The React app sends a POST request to the Node.js backend API (`/api/chatbot`).
3. **Python Execution**: Node.js spawns the `chatbot.py` Python process.
4. **RAG Semantic Search**: The Python script uses `sentence-transformers` and ChromaDB to find relevant corporate policies from local `.txt` files based on the user's question.
5. **Text-to-SQL**: The script prompts OpenAI (providing the database schema) to translate the user's question into an executable SQLite query.
6. **Data Execution**: The query runs against an in-memory SQLite database loaded with the Superstore dataset.
7. **Analyst Summary**: OpenAI is prompted again with the query results and RAG context to generate a concise, 3-line business insight.
8. **Visualization**: The Python script analyzes the shape of the data and recommends a chart type (`line`, `bar`, `pie`, or `table`).
9. **Frontend Rendering**: The backend returns all the data, which the frontend renders natively as interactive charts, along with the AI's explanation and the retrieved policy snippets.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (3.9+)
- OpenAI API Key (configured in `backend/.env`)

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   npm install
   # Make sure your Python dependencies are installed (pandas, numpy, openai, chromadb, sentence-transformers)
   npm run dev
   ```
   *The backend server will run on `http://localhost:5000`.*

2. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend application will run and provide a local URL to view the app in your browser.*
