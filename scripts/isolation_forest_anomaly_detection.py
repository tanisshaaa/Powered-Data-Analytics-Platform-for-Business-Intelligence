import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

# Step 1: Load sales data from CSV
def load_sales_data(csv_file_path):
    try:
        df = pd.read_csv(csv_file_path)
        print(f"✅ Sales data loaded successfully from {csv_file_path}!")
        return df
    except Exception as e:
        print(f"❌ Failed to load CSV: {e}")
        return None

# Step 2: Apply Isolation Forest for anomaly detection
def detect_anomalies(df):
    # Calculate the total price
    df['total_price'] = df['quantity_sold'] * df['unit_price']
    
    # Apply Isolation Forest to detect anomalies
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    df['anomaly'] = model.fit_predict(df[['quantity_sold', 'unit_price', 'total_price']])
    
    return df

# Step 3: Save anomalies to a new CSV file (optional)
def save_anomalies_to_csv(df, output_path):
    anomalies = df[df['anomaly'] == -1]
    try:
        anomalies.to_csv(output_path, index=False)
        print(f"✅ Anomalies saved to: {output_path}")
    except Exception as e:
        print(f"❌ Failed to save anomalies: {e}")

# Step 4: Visualize anomalies in the data
def visualize_anomalies(df):
    # Filter normal and anomalous points
    normal_points = df[df['anomaly'] == 1]
    anomalous_points = df[df['anomaly'] == -1]

    # Plot the anomalies
    plt.figure(figsize=(10, 6))
    plt.scatter(normal_points['quantity_sold'], normal_points['unit_price'], c='blue', label='Normal', alpha=0.5)
    plt.scatter(anomalous_points['quantity_sold'], anomalous_points['unit_price'], c='red', label='Anomaly', alpha=0.5)

    # Add labels and legend
    plt.title('Anomalies in Sales Data')
    plt.xlabel('Quantity Sold')
    plt.ylabel('Unit Price')
    plt.legend()
    plt.show()


# Run the process
if __name__ == "__main__":
    # Load sales data from CSV file
    sales_data = load_sales_data('sales_data.csv')  # Replace with the correct CSV file path
    if sales_data is not None:
        # Apply anomaly detection
        sales_data = detect_anomalies(sales_data)
        print(sales_data[['transaction_id', 'anomaly']])

        # Optional: Save anomalies to CSV
        save_anomalies_to_csv(sales_data, 'anomalies_detected.csv')

        # Visualize the anomalies
        visualize_anomalies(sales_data)

