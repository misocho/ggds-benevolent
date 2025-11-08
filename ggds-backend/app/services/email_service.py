from typing import Optional
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


class EmailService:
    """Email service using SMTP (Hostinger)"""

    def __init__(self):
        if settings.smtp_username and settings.smtp_password:
            self.configured = True
        else:
            self.configured = False
            print("⚠️  Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD to enable email notifications.")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ) -> bool:
        """
        Send an email using SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content

        Returns:
            True if email was sent successfully
        """
        if not self.configured:
            print(f"📧 [EMAIL NOT SENT - Service not configured] To: {to_email}, Subject: {subject}")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = settings.email_from
            message["To"] = to_email
            message["Subject"] = subject

            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send email using SMTP
            await aiosmtplib.send(
                message,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_username,
                password=settings.smtp_password,
                use_tls=settings.smtp_use_tls,
            )

            print(f"✉️  Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Email send failed: {str(e)}")
            return False

    async def send_welcome_email(
        self,
        to_email: str,
        member_name: str,
        member_id: str,
        initial_password: str = None
    ) -> bool:
        """
        Send welcome email to new member

        PIVOT v2.0: Includes initial password if provided (admin-created accounts)
        """
        subject = "Welcome to GGDS Benevolent Fund - Your Account Details"

        # PIVOT v2.0: Different email for admin-created accounts
        if initial_password:
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <div style="background-color: #0ec434; padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">GGDS Benevolent Fund</h1>
                        </div>
                        <div style="background-color: white; padding: 30px; margin-top: 20px; border-radius: 5px;">
                            <h2 style="color: #273171;">Welcome, {member_name}!</h2>
                            <p>Your account has been created by the administrator. Below are your login credentials:</p>

                            <div style="background-color: #f0f8ff; padding: 20px; border-left: 4px solid #0ec434; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Member ID:</strong> <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 3px;">{member_id}</code></p>
                                <p style="margin: 5px 0;"><strong>Initial Password:</strong> <code style="background: #e0e0e0; padding: 5px 10px; border-radius: 3px;">{initial_password}</code></p>
                            </div>

                            <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                                <p style="margin: 0;"><strong>⚠️ Important:</strong> On your first login, you will be required to complete your profile. This information is immutable and cannot be changed after submission, so please ensure all details are accurate.</p>
                            </div>

                            <h3 style="color: #273171;">Next Steps:</h3>
                            <ol style="line-height: 1.8;">
                                <li>Sign in using your Member ID and initial password</li>
                                <li>Complete your profile with accurate information</li>
                                <li>Review the profile carefully before submitting (cannot be changed)</li>
                                <li>Change your password to something memorable</li>
                            </ol>

                            <p style="text-align: center; margin-top: 30px;">
                                <a href="{settings.frontend_url}/signin" style="background-color: #0ec434; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign In Now</a>
                            </p>

                            <p style="margin-top: 30px; color: #666; font-size: 14px;">For assistance, please contact us at {settings.admin_email}</p>
                        </div>
                        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                            <p>© 2025 GGDS Benevolent Fund. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
            """
        else:
            # Original welcome email for self-registered members (deprecated in PIVOT v2.0)
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0ec434;">Welcome to GGDS Benevolent Fund</h2>
                        <p>Dear {member_name},</p>
                        <p>Your registration has been successfully received!</p>
                        <p><strong>Your Member ID:</strong> {member_id}</p>
                        <p>You can now access your dashboard and submit support cases when needed.</p>
                        <p>If you have any questions, please contact us at {settings.admin_email}</p>
                        <br>
                        <p>Best regards,<br>GGDS Benevolent Fund Team</p>
                    </div>
                </body>
            </html>
            """

        return await self.send_email(to_email, subject, html)

    async def send_case_confirmation(
        self,
        to_email: str,
        case_id: str,
        case_type: str
    ) -> bool:
        """Send case submission confirmation"""
        subject = f"Case Submitted: {case_id}"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0ec434;">Case Submission Confirmation</h2>
                    <p>Your support case has been successfully submitted.</p>
                    <p><strong>Case ID:</strong> {case_id}</p>
                    <p><strong>Case Type:</strong> {case_type.replace('_', ' ').title()}</p>
                    <p>Your case is now under review. You will be notified of any status updates.</p>
                    <p>You can track your case status in your dashboard.</p>
                    <br>
                    <p>Best regards,<br>GGDS Benevolent Fund Team</p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, html)

    async def send_case_status_update(
        self,
        to_email: str,
        case_id: str,
        new_status: str,
        notes: Optional[str] = None
    ) -> bool:
        """Send case status update notification"""
        subject = f"Case Status Update: {case_id}"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0ec434;">Case Status Update</h2>
                    <p><strong>Case ID:</strong> {case_id}</p>
                    <p><strong>New Status:</strong> {new_status.replace('_', ' ').title()}</p>
                    {f'<p><strong>Notes:</strong> {notes}</p>' if notes else ''}
                    <p>You can view full case details in your dashboard.</p>
                    <br>
                    <p>Best regards,<br>GGDS Benevolent Fund Team</p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(to_email, subject, html)

    async def send_admin_notification(
        self,
        case_id: str,
        case_type: str,
        member_name: str,
        urgency: str
    ) -> bool:
        """Send notification to admin about new case"""
        subject = f"New Case Submitted: {case_id} [{urgency.upper()}]"
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #273171;">New Case Requires Review</h2>
                    <p><strong>Case ID:</strong> {case_id}</p>
                    <p><strong>Case Type:</strong> {case_type.replace('_', ' ').title()}</p>
                    <p><strong>Member:</strong> {member_name}</p>
                    <p><strong>Urgency:</strong> {urgency.upper()}</p>
                    <p>Please review this case in the admin dashboard.</p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(settings.admin_email, subject, html)


# Create singleton instance
email_service = EmailService()
