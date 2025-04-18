import pymysql
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# MySQL connection
def get_mysql_connection():
    return pymysql.connect(
        host="localhost",
        user="root",  # Update with your username
        password="tanitani",  # Update with your password
        database="businessanalytics",  # Update with your database name
        port=3306
    )

# Fetch sales data with anomaly labels
def fetch_sales_data():
    try:
        conn = get_mysql_connection()
        query = """
        SELECT transaction_id, quantity, price_per_unit, total_price,
               CASE WHEN transaction_id IN (SELECT alert_id FROM alerts) THEN 'Anomaly' ELSE 'Normal' END AS anomaly_label
        FROM sales_transactions
        """
        df = pd.read_sql(query, conn)
        conn.close()
        return df
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None

# Visualize anomalies
def visualize_anomalies(df):
    plt.figure(figsize=(12, 6))
    sns.scatterplot(data=df, x="quantity", y="total_price", hue="anomaly_label", palette={"Normal": "blue", "Anomaly": "red"}, s=50)
    plt.title("Anomaly Detection in Sales Transactions")
    plt.xlabel("Quantity Sold")
    plt.ylabel("Total Price")
    plt.legend(title="Transaction Status")
    plt.grid(True)
    plt.show()

# Run the visualization
if __name__ == "__main__":
    sales_data = fetch_sales_data()
    if sales_data is not None:
        visualize_anomalies(sales_data)
