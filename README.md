# Powered Data Analytics Platform for Business Intelligence

## Overview

This project aims to build a **Powered Data Analytics Platform for Business Intelligence**. It integrates real-time data streaming, anomaly detection, and time series forecasting to help businesses make smarter decisions. Key components of the system include:

- **Real-time Data Streaming** using Apache Kafka
- **Anomaly Detection** using **Isolation Forest**
- **Time Series Forecasting** using **ARIMA**
- **Data Visualization** using **Power BI**
- **Automated Email Notifications** based on anomaly severity levels

---

## CSV Files

The platform uses multiple CSV files to simulate and work with data. Below are the details of each CSV file and the columns it contains:

### 1. **Sales Data (`sales_data.csv`)**
   - **Headers**:
     - `transaction_id`: Unique identifier for each transaction.
     - `product_id`: The product sold in the transaction.
     - `quantity_sold`: The number of units sold in each transaction.
     - `unit_price`: Price per unit of the product.
     - `sale_date`: The timestamp of the sale.

   **Contents**: This file tracks the sales transactions of various products over time. It is used for anomaly detection (e.g., detecting unusual sales patterns) and forecasting product sales.

### 2. **Product Data (`products.csv`)**
   - **Headers**:
     - `product_id`: Unique identifier for each product.
     - `product_name`: Name of the product.
     - `category`: Product category.
     - `price`: Price of the product.

   **Contents**: This file provides details about the products being sold. It is used for analyzing pricing patterns, categorizing products, and associating with sales data.

---

## ARIMA Time Series Forecasting

**ARIMA (AutoRegressive Integrated Moving Average)** is used to forecast future values based on historical data. In this project, ARIMA is applied to the **sales data** to predict future sales trends.

**How it works**:
- **Input**: The historical sales data (quantity sold) is used to train the ARIMA model.
- **Output**: The model generates forecasts for future sales, which are visualized using **Power BI** for better insights.
- **Purpose**: Helps businesses anticipate future demand and make informed decisions.

---

## Isolation Forest Anomaly Detection

**Isolation Forest** is an algorithm used for detecting anomalies (outliers) in the dataset.

**How it works**:
- **Input**: The sales data (quantity sold, unit price) is used to detect anomalies.
- **Output**: Points identified as anomalies are flagged for further inspection.
- **Purpose**: Helps identify unusual patterns in sales that may indicate issues such as fraud, data errors, or outlier behavior.

---

## Email Notification System

The platform includes an **email notification system** to alert users based on the severity of detected anomalies.

**How it works**:
- **Severity Levels**: Notifications are sent based on anomaly severity:
  - `Low`: Low-priority alerts (e.g., minor deviations).
  - `Medium`: Medium-priority alerts (e.g., noticeable anomalies).
  - `High`: Urgent alerts (e.g., critical issues or outliers).
  
- **Functionality**:
  - The system uses **SMTP** (Gmail in this case) to send emails.
  - When an anomaly is detected, the severity level is determined and an appropriate notification is sent to the user.

**Example**:
- An anomaly in sales that is classified as "High" will trigger an urgent email notification to the business owner, alerting them to investigate immediately.

---

## How to Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/business-intelligence-platform.git
   cd business-intelligence-platform
