import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def main():
    # Read daily sales data from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided"}))
            return
        
        data = json.loads(input_data)
    except Exception as e:
        print(json.dumps({"error": f"Failed to parse input JSON: {str(e)}"}))
        return

    df = pd.DataFrame(data)
    
    # Check if df is empty
    if df.empty:
        print(json.dumps({"error": "Empty data received"}))
        return

    # Standardize column names
    if 'order_date' not in df.columns or 'total_sales' not in df.columns:
        print(json.dumps({"error": "Required columns 'order_date' and 'total_sales' missing"}))
        return

    # Convert columns to correct types
    df['order_date'] = pd.to_datetime(df['order_date'])
    df['total_sales'] = pd.to_numeric(df['total_sales'])
    
    # Sort and reset index
    df = df.sort_values('order_date').reset_index(drop=True)
    
    # Check if we have enough data points to run Isolation Forest
    # IsolationForest works better with more data, but requires at least 1 sample.
    if len(df) < 5:
        print(json.dumps({"error": "Not enough data points to run anomaly detection. Need at least 5 days of data."}))
        return

    # Prepare data for IsolationForest
    X_anomaly = df[['total_sales']].dropna()
    
    # Run Isolation Forest model
    contamination = 0.05
    model_if = IsolationForest(contamination=contamination, random_state=42)
    df['anomaly'] = model_if.fit_predict(X_anomaly)
    
    # Calculate statistics
    total_count = int(len(df))
    anomaly_count = int((df['anomaly'] == -1).sum())
    normal_count = int((df['anomaly'] == 1).sum())
    
    normal_avg = float(df[df['anomaly'] == 1]['total_sales'].mean()) if normal_count > 0 else 0.0
    anomaly_avg = float(df[df['anomaly'] == -1]['total_sales'].mean()) if anomaly_count > 0 else 0.0
    
    # Check if the last data point is an anomaly
    latest_anomaly = bool(df['anomaly'].iloc[-1] == -1)
    latest_date = df['order_date'].iloc[-1].strftime('%Y-%m-%d')
    latest_sales = float(df['total_sales'].iloc[-1])
    
    # Format dates back to string
    df['order_date'] = df['order_date'].dt.strftime('%Y-%m-%d')
    df['total_sales'] = df['total_sales'].astype(float)
    df['anomaly'] = df['anomaly'].astype(int)
    
    # Create final data points list
    points = df[['order_date', 'total_sales', 'anomaly']].to_dict(orient='records')
    
    response = {
        "points": points,
        "summary": {
            "total_count": total_count,
            "anomaly_count": anomaly_count,
            "normal_count": normal_count,
            "contamination_rate": contamination,
            "normal_average_sales": normal_avg,
            "anomaly_average_sales": anomaly_avg,
            "latest_anomaly": latest_anomaly,
            "latest_date": latest_date,
            "latest_sales": latest_sales
        }
    }
    
    print(json.dumps(response))

if __name__ == '__main__':
    main()
