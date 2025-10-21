from typing import Optional
import resend
from app.config import settings


class EmailService:
    """Email service using Resend"""

    def __init__(self):
        if settings.resend_api_key and settings.resend_api_key != "re_xxxxxxxxxxxxx":
            resend.api_key = settings.resend_api_key
            self.configured = True
        else:
            self.configured = False
            print("⚠️  Email service not configured. Set RESEND_API_KEY to enable email notifications.")

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ) -> bool:
        """
        Send an email

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
            params = {
                "from": settings.email_from,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            resend.Emails.send(params)
            print(f"✉️  Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Email send failed: {str(e)}")
            return False

    async def send_welcome_email(
        self,
        to_email: str,
        member_name: str,
        member_id: str
    ) -> bool:
        """Send welcome email to new member"""
        subject = "Welcome to GGDS Benevolent Fund"
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
