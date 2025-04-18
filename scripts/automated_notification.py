import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# SMTP Configuration
SMTP_SERVER = "smtp.gmail.com"  # Use your email provider's SMTP server
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

        print(f"Email sent successfully to {recipient_email}")

    except Exception as e:
        print(f"Error sending email: {e}")

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

# Example usage
if __name__ == "__main__":
    recipient = "tanisha02sinha@gmail.com"  # Replace with actual recipient email
    severity_level = "High"  # Can be "Low", "Medium", or "High"
    
    notify_user(severity_level, recipient)
