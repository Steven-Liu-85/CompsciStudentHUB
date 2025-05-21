import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv("config/.env")

class EmailSender:
    def __init__(self):
        self.email_address = os.getenv("EMAIL_ADDRESS")
        self.email_password = os.getenv("EMAIL_PASSWORD")

        if not self.email_address or not self.email_password:
            raise ValueError("EMAIL_ADDRESS or EMAIL_PASSWORD is not set in .env")

    def send_verification_code(self, to_email, code):
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_address
            msg['To'] = to_email
            msg['Subject'] = "Student Hub Email Verification Code"

            body = f"""
            Hello,

            Your verification code for Student Hub email change is:

            👉 {code}

            If you did not request this, please ignore this message.

            Thank you.
            """
            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(self.email_address, self.email_password)
                server.send_message(msg)

            print(f"[Email sent] Verification code sent to {to_email}")

        except Exception as e:
            print(f"[Email error] Failed to send email to {to_email}: {e}")
            raise e
