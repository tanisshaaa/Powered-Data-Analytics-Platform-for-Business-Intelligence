import pandas as pd
import os

# Define paths
raw_path = r"M:\PROJECTS\Powered-Data-Analytics-Platform-for-Business-Intelligence\data\raw\SuperStore.csv"
processed_dir = r"M:\PROJECTS\Powered-Data-Analytics-Platform-for-Business-Intelligence\data\processed"
if not os.path.exists(processed_dir):
    os.makedirs(processed_dir)
processed_path = os.path.join(processed_dir, "cleaned_superstore.csv")

# Load dataset
df = pd.read_csv(raw_path)

print("=== Step 1: Explore Dataset ===")
print("--- df.head() ---")
print(df.head())
print("\n--- df.info() ---")
df.info()
print("\n--- df.describe() ---")
print(df.describe())

# Step 2: Basic Cleaning

# Remove duplicates to ensure each record is unique and we don't double-count data.
df = df.drop_duplicates()

# Convert dates to datetime objects so we can perform time-based analysis and filtering properly.
if 'order_date' in df.columns:
    df['order_date'] = pd.to_datetime(df['order_date'], format='mixed')

# Handle critical nulls: remove rows where essential fields like 'sales' or 'order_date' are missing, 
# as these are required for our core business logic.
subset_to_drop = [col for col in ['sales', 'order_date'] if col in df.columns]
if subset_to_drop:
    df = df.dropna(subset=subset_to_drop)

# Fix data types to ensure mathematical operations run correctly on numerical columns.
if 'sales' in df.columns:
    # Remove commas or currency symbols if 'sales' was read as string
    if df['sales'].dtype == 'object':
        df['sales'] = df['sales'].str.replace(',', '').str.replace('$', '').astype(float)
    else:
        df['sales'] = df['sales'].astype(float)
        
if 'quantity' in df.columns:
    df['quantity'] = df['quantity'].astype(int)
if 'profit' in df.columns:
    df['profit'] = df['profit'].astype(float)

# Step 3: Save Clean Dataset
# Saving to the processed directory without the index so it doesn't create an unnecessary column
df.to_csv(processed_path, index=False)
print(f"\nCleaned dataset saved successfully at: {processed_path}")
