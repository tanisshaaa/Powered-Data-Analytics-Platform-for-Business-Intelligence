import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
import warnings

warnings.filterwarnings("ignore")

# Step 1: Load CSV and preprocess data
def load_sales_data(csv_path):
    try:
        df = pd.read_csv(csv_path, parse_dates=['transaction_date'])
        df['total_price'] = df['quantity'] * df['price_per_unit']
        
        # Group by date and calculate daily total sales
        daily_sales = df.groupby('transaction_date')['total_price'].sum().reset_index()
        daily_sales.set_index('transaction_date', inplace=True)
        daily_sales = daily_sales.sort_index()
        
        print("✅ CSV sales data loaded and processed successfully!")
        return daily_sales
    except Exception as e:
        print(f"❌ Failed to load and process CSV data: {e}")
        return None

# Step 2: Forecast using ARIMA
def arima_forecast(df, forecast_days=15):
    try:
        model = ARIMA(df['total_price'], order=(1, 1, 1))
        model_fit = model.fit()
        forecast = model_fit.forecast(steps=forecast_days)
        
        print("✅ ARIMA model forecasting complete!")
        return forecast
    except Exception as e:
        print(f"❌ ARIMA forecasting failed: {e}")
        return None

# Step 3: Visualize results
def visualize_forecast(df, forecast):
    plt.figure(figsize=(12, 6))
    plt.plot(df.index, df['total_price'], label='Actual Sales')

    forecast_index = pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=len(forecast))
    plt.plot(forecast_index, forecast, label='Forecasted Sales', color='red', linestyle='--')

    plt.title("ARIMA Forecast - Daily Total Sales")
    plt.xlabel("Date")
    plt.ylabel("Total Sales")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# Main Execution
if __name__ == "__main__":
    csv_file = "sales_transactions.csv"  # Replace with your actual CSV path
    df_sales = load_sales_data(csv_file)
    if df_sales is not None:
        forecast_result = arima_forecast(df_sales)
        if forecast_result is not None:
            visualize_forecast(df_sales, forecast_result)
