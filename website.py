import streamlit as st
import pandas as pd
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import IsolationForest
import numpy as np
import matplotlib.pyplot as plt

# SMTP Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "chintumintu0231@gmail.com"#ace with your email
SENDER_PASSWORD = "azdv okvw yunm hlyd"#e an app password, not your actual password
# Function to send email
def send_email(recipient_email, subject, message):
    try:
        # Set up the MIME structure
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "plain"))

        # Connect to SMTP server and send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()

        st.success(f"Email sent successfully to {recipient_email}")

    except Exception as e:
        st.error(f"Error sending email: {e}")

# Function for ARIMA Visualization
def arima_visualization(df, column):
    st.subheader("ARIMA Model for Time Series Forecasting")

    df[column] = pd.to_numeric(df[column], errors='coerce')
    df.dropna(subset=[column], inplace=True)

    model = ARIMA(df[column], order=(5, 1, 0))
    model_fit = model.fit()
    forecast_steps = 10
    forecast = model_fit.forecast(steps=forecast_steps)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(df[column], label='Observed')
    ax.plot(np.arange(len(df), len(df) + forecast_steps), forecast, label='Forecast', color='red')
    ax.set_title(f'ARIMA Forecast for {column}')
    ax.legend()

    st.pyplot(fig)

    return f"ARIMA forecast for {column} is complete. Next {forecast_steps} values have been predicted."

# Function for Isolation Forest Anomaly Detection Visualization
def isolation_forest_visualization(df, column1, column2):
    st.subheader("Isolation Forest for Anomaly Detection")

    if column1 not in df.columns or column2 not in df.columns:
        st.error(f"Columns '{column1}' and '{column2}' are not found in the data.")
        return

    X = df[[column1, column2]].dropna()
    model = IsolationForest(contamination=0.1)
    df['anomaly'] = model.fit_predict(X)

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.scatter(df[df['anomaly'] == 1][column1], df[df['anomaly'] == 1][column2], c='blue', label='Normal', alpha=0.5)
    ax.scatter(df[df['anomaly'] == -1][column1], df[df['anomaly'] == -1][column2], c='red', label='Anomaly', alpha=0.5)
    ax.set_title(f'Anomalies Detection for {column1} vs {column2}')
    ax.set_xlabel(column1)
    ax.set_ylabel(column2)
    ax.legend()

    st.pyplot(fig)

    return f"Anomaly detection complete for {column1} vs {column2}."

# Function to trigger notifications based on severity
def notify_user(severity, recipient_email):
    subject_map = {
        "Low": "Low Priority Notification",
        "Medium": "Medium Priority Alert",
        "High": "URGENT: High Priority Alert!"
    }

    message_map = {
        "Low": "This is a low-priority notification. No immediate action required.",
        "Medium": "This is a medium-priority alert. Please check when possible.",
        "High": "URGENT: Immediate action is required!"
    }

    subject = subject_map.get(severity, "General Notification")
    message = message_map.get(severity, "This is a general notification.")

    send_email(recipient_email, subject, message)

# Streamlit UI
def main():
    st.title("Time Series & Anomaly Detection with Email Notifications")

    # Dropdown to select the CSV file
    file_list = ['sales_data.csv', 'products.csv', 'suppliers.csv', 'customers.csv', 'alerts.csv']
    selected_file = st.selectbox("Select CSV File", file_list)

    df = pd.read_csv(selected_file)
    st.write("First 5 rows of the data:")
    st.write(df.head())

    arima_column = df.select_dtypes(include=[np.number]).columns[0]
    isolation_column1 = df.select_dtypes(include=[np.number]).columns[0]
    isolation_column2 = df.select_dtypes(include=[np.number]).columns[1]

    # Visualize ARIMA and Isolation Forest
    arima_result = arima_visualization(df, arima_column)
    isolation_result = isolation_forest_visualization(df, isolation_column1, isolation_column2)

    # Collect email input
    email = st.text_input("Enter your email to receive notifications:")
    severity_level = st.selectbox("Select Severity Level", ["Low", "Medium", "High"])

    # Send Notification Button
    if st.button("Send Notification"):
        if email:
            # Send email with results
            email_subject = "Time Series & Anomaly Detection Results"
            email_body = f"ARIMA Forecast Results:\n{arima_result}\n\nIsolation Forest Anomaly Detection Results:\n{isolation_result}"
            send_email(email, email_subject, email_body)

            # Trigger severity-based notification
            notify_user(severity_level, email)
        else:
            st.error("Please enter a valid email address.")

if __name__ == "__main__":
    main()
