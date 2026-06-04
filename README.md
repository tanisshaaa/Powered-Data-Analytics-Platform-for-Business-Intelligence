# RetailGPT - Powered Data Analytics Platform for Business Intelligence

RetailGPT is an AI-powered Business Intelligence (BI) platform that enables users to interact with their retail sales data using natural language. It combines **Text-to-SQL**, **Retrieval-Augmented Generation (RAG)**, and **Machine Learning** to act as a virtual Senior Business Analyst.

## 🌟 Key Features

- **Natural Language Chatbot**: Ask questions in plain English (e.g., *"What category generated the most sales?"*). The system translates this into SQL, executes it against the database, and visualizes the results.
- **Retrieval-Augmented Generation (RAG)**: The chatbot retrieves context from corporate policy documents (shipping rules, return policies) to enrich its answers using semantic search (ChromaDB).
- **Automated Visualizations**: Automatically generates the most appropriate charts (Line, Bar, Pie, or Table) using `Recharts` based on the query results.
- **Anomaly Detection**: Monitors incoming sales data to detect outliers in revenue, profit, or quantity.
- **Forecasting & Dashboarding**: Visualizes key metrics, tracks overall sales performance, and predicts future trends.
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
