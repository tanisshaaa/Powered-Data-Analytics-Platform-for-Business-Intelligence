require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/api/visitors', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const { data, error } = await supabase
    .from('visitors')
    .insert([{ name, email }]);

  if (error) {
    console.error('Error inserting visitor:', error);
    return res.status(500).json({ error: 'Failed to save visitor information' });
  }

  return res.status(201).json({ message: 'Visitor saved successfully', data });
});

app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get yearly orders and sales
app.get('/api/dashboard/yearly', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_yearly_orders');
    if (error) {
      console.error('Error fetching yearly orders:', error);
      return res.status(500).json({ error: 'Failed to fetch yearly orders' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top countries by sales
app.get('/api/dashboard/countries', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_top_countries');
    if (error) {
      console.error('Error fetching top countries:', error);
      return res.status(500).json({ error: 'Failed to fetch top countries' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get states by country name
app.get('/api/dashboard/countries/:countryName/states', async (req, res) => {
  try {
    const { countryName } = req.params;
    const { data, error } = await supabase.rpc('get_states_by_country', { p_country: countryName });
    if (error) {
      console.error(`Error fetching states for country ${countryName}:`, error);
      return res.status(500).json({ error: `Failed to fetch states for country ${countryName}` });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top categories by sales
app.get('/api/dashboard/categories', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_top_categories');
    if (error) {
      console.error('Error fetching top categories:', error);
      return res.status(500).json({ error: 'Failed to fetch top categories' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subcategories by category
app.get('/api/dashboard/categories/:categoryName/subcategories', async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { data, error } = await supabase.rpc('get_subcategories_by_category', { p_category: categoryName });
    if (error) {
      console.error(`Error fetching subcategories for category ${categoryName}:`, error);
      return res.status(500).json({ error: `Failed to fetch subcategories for category ${categoryName}` });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products by subcategory
app.get('/api/dashboard/subcategories/:subcategoryName/products', async (req, res) => {
  try {
    const { subcategoryName } = req.params;
    const { data, error } = await supabase.rpc('get_products_by_subcategory', { p_subcategory: subcategoryName });
    if (error) {
      console.error(`Error fetching products for subcategory ${subcategoryName}:`, error);
      return res.status(500).json({ error: `Failed to fetch products for subcategory ${subcategoryName}` });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sorted regions (desc or asc)
app.get('/api/dashboard/regions', async (req, res) => {
  try {
    const sort = req.query.sort || 'desc';
    const { data, error } = await supabase.rpc('get_regions_sorted', { p_sort_dir: sort });
    if (error) {
      console.error('Error fetching sorted regions:', error);
      return res.status(500).json({ error: 'Failed to fetch sorted regions' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock forecast data generator for demo / fallback mode
const generateMockForecast = () => {
  const historical = [];
  const forecast = [];
  const now = new Date();
  
  // 30 days historical sales
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i - 8); // Ends 8 days ago
    const dayOfWeek = date.getDay();
    const base = 8500 + Math.sin(i * 0.4) * 1500;
    const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
    const randomNoise = Math.random() * 800 - 400;
    historical.push({
      order_date: date.toISOString().split('T')[0],
      total_sales: parseFloat((base * weekendEffect + randomNoise).toFixed(2)),
      is_forecast: false
    });
  }
  
  // 7 days forecast
  const lastSales = historical[historical.length - 1].total_sales;
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - 7 + i);
    const dayOfWeek = date.getDay();
    // Trend upwards slightly (+1.5% daily average)
    const base = lastSales * (1 + i * 0.015) + Math.sin((historical.length + i) * 0.4) * 800;
    const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.4 : 1.0;
    const randomNoise = Math.random() * 400 - 200;
    forecast.push({
      order_date: date.toISOString().split('T')[0],
      total_sales: parseFloat((base * weekendEffect + randomNoise).toFixed(2)),
      is_forecast: true
    });
  }
  
  return {
    forecast,
    feature_importance: {
      lag_1: 0.458,
      lag_7: 0.262,
      rolling_7: 0.165,
      day_of_week: 0.079,
      month: 0.036
    },
    historical,
    is_mock: true
  };
};

// Spawn Python XGBoost Process Helper
const path = require('path');
const { spawn } = require('child_process');

function runPythonForecast(dailyData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '..', 'ml', 'xgboost_forecast.py');
    const pythonProcess = spawn('python', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdin.write(JSON.stringify(dailyData));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}. Error: ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData);
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python stdout: ${err.message}. Raw output: ${stdoutData}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Fetch and aggregate daily sales records from live database or fallback local CSV
async function fetchDailySales() {
  let dailyData = [];
  try {
    console.log('Fetching daily sales from Supabase...');
    
    let allOrders = [];
    let page = 0;
    const pageSize = 1000; // PostgREST max limit is 1000 rows per request
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('orders')
        .select('order_date, sales')
        .range(page * pageSize, (page + 1) * pageSize - 1);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        allOrders = allOrders.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }
    
    if (allOrders.length === 0) {
      throw new Error('No orders found in Supabase orders table');
    }
    
    const dailyMap = {};
    allOrders.forEach(o => {
      const date = o.order_date;
      const sales = parseFloat(o.sales) || 0;
      dailyMap[date] = (dailyMap[date] || 0) + sales;
    });
    
    dailyData = Object.entries(dailyMap).map(([order_date, total_sales]) => ({
      order_date,
      total_sales
    })).sort((a, b) => a.order_date.localeCompare(b.order_date));
    console.log(`Aggregated ${dailyData.length} daily sales points from live Supabase query`);
    return dailyData;
  } catch (dbErr) {
    console.warn('Supabase query failed, attempting local CSV fallback...', dbErr.message);
    
    try {
      const fs = require('fs');
      const csvPath = path.resolve(__dirname, '..', 'data', 'processed', 'cleaned_superstore.csv');

      if (!fs.existsSync(csvPath)) {
        throw new Error('Local cleaned CSV file not found');
      }
      
      const content = fs.readFileSync(csvPath, 'utf8');
      const lines = content.split('\n');
      const headers = lines[0].split(',');
      const dateIdx = headers.indexOf('order_date');
      const salesIdx = headers.indexOf('sales');
      
      if (dateIdx === -1 || salesIdx === -1) {
        throw new Error('Invalid CSV headers');
      }
      
      const dailyMap = {};
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        const date = cols[dateIdx];
        const sales = parseFloat(cols[salesIdx]) || 0;
        
        if (date) {
          dailyMap[date] = (dailyMap[date] || 0) + sales;
        }
      }
      
      dailyData = Object.entries(dailyMap).map(([order_date, total_sales]) => ({
        order_date,
        total_sales
      })).sort((a, b) => a.order_date.localeCompare(b.order_date));
      console.log(`Successfully read and aggregated ${dailyData.length} daily sales records from local CSV`);
      return dailyData;
    } catch (csvErr) {
      console.error('All data fetching methods failed', csvErr.message);
      throw csvErr;
    }
  }
}

// GET /api/forecast - Aggregate sales, train XGBoost model, and predict
app.get('/api/forecast', async (req, res) => {
  const isDemo = req.query.demo === 'true';
  
  if (isDemo) {
    console.log('Serving mock forecast data (Demo mode)');
    return res.status(200).json(generateMockForecast());
  }
  
  try {
    const dailyData = await fetchDailySales();
    
    if (!dailyData || dailyData.length < 15) {
      console.warn('Not enough daily data points in DB for forecasting. Serving high-fidelity mock data instead.');
      return res.status(200).json(generateMockForecast());
    }
    
    console.log('Invoking Python XGBoost forecasting script...');
    const result = await runPythonForecast(dailyData);
    return res.status(200).json({ ...result, is_mock: false });
    
  } catch (err) {
    console.error('Forecasting failed. Falling back to mock data:', err.message);
    return res.status(200).json(generateMockForecast());
  }
});

// --- Phase 3: Anomaly Detection Component ---

let simulatedOrders = [];

// Mock anomaly data generator for demo/fallback mode
const generateMockAnomaly = (customPoints = []) => {
  const points = [];
  const now = new Date();
  
  // 45 days of historical data
  for (let i = 44; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i - customPoints.length);
    const dayOfWeek = date.getDay();
    const base = 9000 + Math.sin(i * 0.3) * 1800;
    const weekendEffect = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.35 : 1.0;
    
    // Inject two natural anomalies in the historical data
    let salesVal = parseFloat((base * weekendEffect + (Math.random() * 800 - 400)).toFixed(2));
    let anomaly = 1;
    if (i === 15) {
      salesVal = parseFloat((salesVal * 2.8).toFixed(2)); // High spike
      anomaly = -1;
    } else if (i === 32) {
      salesVal = parseFloat((salesVal * 0.15).toFixed(2)); // Low drop
      anomaly = -1;
    }
    
    points.push({
      order_date: date.toISOString().split('T')[0],
      total_sales: salesVal,
      anomaly
    });
  }
  
  // Append any simulated additions
  customPoints.forEach((p, idx) => {
    // In mock mode, identify spikes as anomalies
    const avgSales = 9500;
    let anomaly = 1;
    // Spikes are around 3x normal, normal is around 1x avg. If > 2.2x avg, flag as anomaly.
    if (p.total_sales > avgSales * 2.2 || p.total_sales < avgSales * 0.2) {
      anomaly = -1;
    }
    points.push({
      order_date: p.order_date,
      total_sales: parseFloat(p.total_sales.toFixed(2)),
      anomaly
    });
  });
  
  // Calculate summary stats
  const total_count = points.length;
  const anomaly_count = points.filter(p => p.anomaly === -1).length;
  const normal_count = points.filter(p => p.anomaly === 1).length;
  const normal_sales = points.filter(p => p.anomaly === 1).map(p => p.total_sales);
  const anomaly_sales = points.filter(p => p.anomaly === -1).map(p => p.total_sales);
  
  const normal_avg = normal_sales.reduce((a, b) => a + b, 0) / (normal_sales.length || 1);
  const anomaly_avg = anomaly_sales.reduce((a, b) => a + b, 0) / (anomaly_sales.length || 1);
  
  const latest_point = points[points.length - 1];
  
  return {
    points,
    summary: {
      total_count,
      anomaly_count,
      normal_count,
      contamination_rate: 0.05,
      normal_average_sales: parseFloat(normal_avg.toFixed(2)),
      anomaly_average_sales: parseFloat(anomaly_avg.toFixed(2)),
      latest_anomaly: latest_point.anomaly === -1,
      latest_date: latest_point.order_date,
      latest_sales: latest_point.total_sales
    },
    is_mock: true
  };
};

// Spawn Python Anomaly Detection Process Helper
function runPythonAnomaly(dailyData) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '..', 'ml', 'anomaly_detection.py');
    const pythonProcess = spawn('python', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';
    
    pythonProcess.stdin.write(JSON.stringify(dailyData));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}. Error: ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData);
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python stdout: ${err.message}. Raw output: ${stdoutData}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Spawn Python Chatbot Process Helper
function runPythonChatbot(question, simulatedOrders) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '..', 'ml', 'chatbot.py');
    const pythonProcess = spawn('python', [scriptPath]);
    
    let stdoutData = '';
    let stderrData = '';
    
    const payload = {
      question,
      simulated_orders: simulatedOrders || [],
      api_key: process.env.OPENAI_API_KEY
    };
    
    pythonProcess.stdin.write(JSON.stringify(payload));
    pythonProcess.stdin.end();
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python chatbot script exited with code ${code}. Error: ${stderrData}`));
      }
      try {
        const parsed = JSON.parse(stdoutData);
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error(`Failed to parse Python chatbot stdout: ${err.message}. Raw output: ${stdoutData}`));
      }
    });
    
    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// POST /api/chatbot - Natural Language SQL chatbot query endpoint
app.post('/api/chatbot', async (req, res) => {
  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'Question parameter is required' });
  }
  
  try {
    console.log(`Processing chatbot query: "${question}"`);
    const result = await runPythonChatbot(question, simulatedOrders);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Chatbot execution failed:', err);
    // Provide a mock fallback for Vercel environments where Python isn't available
    return res.status(200).json({
      answer: "I am operating in Offline Demo Mode because the Python execution environment is currently unavailable (e.g. deployed on a Vercel Node.js runtime). Based on your query regarding our sales data, here is a simulated diagnostic insight: Sales dropped significantly on the 24th due to a 9-day shipping delay at the LA port. We recommend re-routing inventory immediately.",
      sql: "-- Simulated Offline SQL Query\nSELECT date, SUM(sales) as total FROM orders GROUP BY date ORDER BY date DESC LIMIT 3;",
      results: [
          {"date": "2026-05-22", "total": 4820.20},
          {"date": "2026-05-23", "total": 4500.00},
          {"date": "2026-05-24", "total": 1240.50}
      ],
      chart_type: "line",
      chart_data: [
          {"date": "2026-05-22", "sales": 4820.20},
          {"date": "2026-05-23", "sales": 4500.00},
          {"date": "2026-05-24", "sales": 1240.50}
      ],
      x_axis: "date",
      y_axis: "sales"
    });
  }
});

// GET /api/anomaly - Fetch all daily sales points, run Isolation Forest, label anomalies
app.get('/api/anomaly', async (req, res) => {
  const isDemo = req.query.demo === 'true';
  
  if (isDemo) {
    console.log('Serving mock anomaly data (Demo mode)');
    return res.status(200).json(generateMockAnomaly(simulatedOrders));
  }
  
  try {
    let dailyData = await fetchDailySales();
    
    // Append simulated orders
    if (simulatedOrders.length > 0) {
      dailyData = [...dailyData, ...simulatedOrders].sort((a, b) => a.order_date.localeCompare(b.order_date));
    }
    
    if (!dailyData || dailyData.length < 5) {
      console.warn('Not enough data points in DB for anomaly detection. Serving mock data instead.');
      return res.status(200).json(generateMockAnomaly(simulatedOrders));
    }
    
    console.log('Invoking Python anomaly detection script...');
    const result = await runPythonAnomaly(dailyData);
    return res.status(200).json({ ...result, is_mock: false });
    
  } catch (err) {
    console.error('Anomaly detection failed. Falling back to mock data:', err.message);
    return res.status(200).json(generateMockAnomaly(simulatedOrders));
  }
});

// POST /api/anomaly/simulate - Simulate a new day (normal or spike)
app.post('/api/anomaly/simulate', async (req, res) => {
  const { type } = req.body;
  const isDemo = req.query.demo === 'true';
  
  if (!type || !['normal', 'spike'].includes(type)) {
    return res.status(400).json({ error: "Invalid type. Must be 'normal' or 'spike'" });
  }
  
  try {
    let dailyData = [];
    if (isDemo) {
      const mockResult = generateMockAnomaly([]);
      dailyData = mockResult.points;
    } else {
      try {
        dailyData = await fetchDailySales();
      } catch (e) {
        console.warn("Could not fetch daily sales for simulation, generating mock base", e.message);
        const mockResult = generateMockAnomaly([]);
        dailyData = mockResult.points;
      }
    }
    
    // Combine with any previously simulated orders
    if (simulatedOrders.length > 0) {
      dailyData = [...dailyData, ...simulatedOrders].sort((a, b) => a.order_date.localeCompare(b.order_date));
    }
    
    // Get last date
    const lastPoint = dailyData[dailyData.length - 1];
    const lastDate = new Date(lastPoint.order_date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];
    
    // Calculate 30-day average sales
    const last30 = dailyData.slice(-30);
    const avgSales = last30.reduce((sum, p) => sum + parseFloat(p.total_sales), 0) / (last30.length || 1);
    
    // Calculate sales value
    let salesValue = 0;
    if (type === 'normal') {
      salesValue = parseFloat((avgSales * (0.85 + Math.random() * 0.3)).toFixed(2));
    } else if (type === 'spike') {
      salesValue = parseFloat((avgSales * (2.8 + Math.random() * 0.4)).toFixed(2));
    }
    
    const newPoint = { order_date: nextDateStr, total_sales: salesValue };
    
    if (isDemo) {
      simulatedOrders.push(newPoint);
      console.log(`[Demo] Simulated new day (${type}):`, newPoint);
      return res.status(200).json({ message: "Simulated day added in-memory", data: newPoint });
    } else {
      console.log(`[Live] Inserting simulated day (${type}) to Supabase:`, newPoint);
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          order_id: 'SIM-' + Date.now().toString().slice(-6),
          order_date: nextDateStr,
          sales: salesValue,
          year: nextDate.getFullYear(),
          customer_name: 'System Simulator',
          product_name: 'Simulated Order'
        }]);
      
      if (error) {
        console.error("Failed to insert simulated order into Supabase, adding to simulatedOrders array as fallback", error);
        simulatedOrders.push(newPoint);
        return res.status(200).json({ message: "Simulated day added to in-memory (Supabase insert failed)", data: newPoint });
      }
      
      return res.status(200).json({ message: "Simulated day inserted in DB", data: newPoint });
    }
  } catch (err) {
    console.error("Simulation failed:", err.message);
    return res.status(500).json({ error: "Failed to simulate new day", details: err.message });
  }
});

// POST /api/anomaly/reset - Clear simulated data points
app.post('/api/anomaly/reset', async (req, res) => {
  const isDemo = req.query.demo === 'true';
  simulatedOrders = [];
  
  if (isDemo) {
    console.log('[Demo] Reset in-memory simulated orders');
    return res.status(200).json({ message: "Reset in-memory simulation successfully" });
  }
  
  try {
    console.log('[Live] Deleting simulated orders from Supabase...');
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .like('order_id', 'SIM-%');
      
    if (error) throw error;
    
    return res.status(200).json({ message: "Reset database simulation successfully" });
  } catch (err) {
    console.error("Database reset failed, cleared in-memory only:", err.message);
    return res.status(200).json({ message: "Cleared in-memory simulation, database clear failed", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
