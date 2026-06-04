import sys
import json
import pandas as pd
import numpy as np
from xgboost import XGBRegressor

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
    
    # Step 2: Feature engineering
    df['lag_1'] = df['total_sales'].shift(1)
    df['lag_7'] = df['total_sales'].shift(7)
    df['rolling_7'] = df['total_sales'].shift(1).rolling(7).mean()
    df['day_of_week'] = df['order_date'].dt.dayofweek
    df['month'] = df['order_date'].dt.month

    # Step 3: Train XGBoost Model
    features = ['lag_1', 'lag_7', 'rolling_7', 'day_of_week', 'month']
    X = df[features].dropna()
    y = df['total_sales'][X.index]

    if X.empty or len(X) < 10:
        print(json.dumps({"error": "Not enough data points to train model. Need at least 15 days of historical data."}))
        return

    # Train model
    model = XGBRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # Calculate feature importances
    importances = model.feature_importances_.tolist()
    feature_importance = dict(zip(features, importances))

    # Step 4: Predict next 7 days recursively
    last_known = df.tail(7)['total_sales'].values
    if len(last_known) < 7:
        # If there are fewer than 7 days of data, pad with the mean
        last_known = np.pad(last_known, (7 - len(last_known), 0), 'mean')

    preds = []
    pred_dates = []
    last_date = df['order_date'].iloc[-1]
    
    for i in range(7):
        lag1 = last_known[-1]
        lag7 = last_known[-7] if len(last_known) >= 7 else lag1
        roll7 = last_known[-7:].mean()
        
        next_date = last_date + pd.Timedelta(days=i+1)
        dow = next_date.dayofweek
        mon = next_date.month
        
        # Predict using model
        pred = model.predict([[lag1, lag7, roll7, dow, mon]])[0]
        # Avoid negative values if model fluctuates
        pred_val = max(0.0, float(pred))
        
        preds.append(pred_val)
        pred_dates.append(next_date.strftime('%Y-%m-%d'))
        last_known = np.append(last_known, pred_val)

    # Format the predictions list
    forecast_results = []
    for date, pred in zip(pred_dates, preds):
        forecast_results.append({
            "order_date": date,
            "total_sales": pred,
            "is_forecast": True
        })
        
    # Get last 30 days of historical data for rendering in the chart
    historical_df = df.tail(30).copy()
    historical_df['order_date'] = historical_df['order_date'].dt.strftime('%Y-%m-%d')
    historical_df['total_sales'] = historical_df['total_sales'].astype(float)
    historical_df['is_forecast'] = False
    
    historical_results = historical_df[['order_date', 'total_sales', 'is_forecast']].to_dict(orient='records')

    response = {
        "forecast": forecast_results,
        "feature_importance": feature_importance,
        "historical": historical_results
    }
    
    print(json.dumps(response))

if __name__ == '__main__':
    main()
