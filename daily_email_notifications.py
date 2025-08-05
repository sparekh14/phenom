#!/usr/bin/env python3
"""
Daily Email Notifications for New Sports Events

This script runs daily to:
1. Find events added in the last 24 hours
2. Send a formatted email with new events
3. Log the activity
"""

import os
import smtplib
import logging
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('email_notifications.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DailyEmailNotifier:
    def __init__(self):
        """Initialize the email notifier with Supabase and email configuration"""
        self.supabase = self._connect_to_supabase()
        self.recipient_email = "parekh.samarth@gmail.com"
        self.sender_email = os.getenv('SENDER_EMAIL')
        self.sender_password = os.getenv('SENDER_PASSWORD')
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        
        if not all([self.sender_email, self.sender_password]):
            raise ValueError("Email credentials not found in environment variables")
    
    def _connect_to_supabase(self) -> Client:
        """Connect to Supabase using environment variables"""
        try:
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
            
            if not supabase_url or not supabase_key:
                raise ValueError("Missing Supabase environment variables")
            
            client = create_client(supabase_url, supabase_key)
            logger.info("✅ Connected to Supabase successfully")
            return client
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Supabase: {e}")
            raise
    
    def get_new_events(self) -> List[Dict]:
        """Get events added in the last 24 hours"""
        try:
            # Calculate yesterday's date
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Query for events created since yesterday
            response = self.supabase.table('events').select('*').gte('created_at', yesterday).order('created_at', desc=True).execute()
            
            events = response.data
            logger.info(f"📊 Found {len(events)} new events since {yesterday}")
            return events
            
        except Exception as e:
            logger.error(f"❌ Error fetching new events: {e}")
            return []
    
    def format_event_for_email(self, event: Dict) -> str:
        """Format a single event for email display"""
        # Format dates
        start_date = event.get('start_date', 'TBD')
        end_date = event.get('end_date', 'TBD')
        
        # Format date range
        if start_date == end_date:
            date_str = start_date
        else:
            date_str = f"{start_date} - {end_date}"
        
        # Build event string
        event_str = f"""
🏆 {event.get('name', 'Unnamed Event')}
📅 {date_str}
🏟️ {event.get('location', 'Location TBD')}
⚽ {event.get('sport', 'Sport TBD')}
👥 {event.get('gender', 'All')} | {event.get('age_group', 'All Ages')}
"""
        
        # Add website if available
        if event.get('website'):
            event_str += f"🔗 {event.get('website')}\n"
        
        # Add organizer if available
        if event.get('organizer'):
            event_str += f"📧 {event.get('organizer')}\n"
        
        return event_str.strip()
    
    def create_email_content(self, events: List[Dict]) -> tuple:
        """Create email subject and body content"""
        if not events:
            subject = "Daily Sports Events Update - No New Events"
            body = """
Hello!

No new sports events were added to the calendar in the last 24 hours.

Your calendar is up to date! 📅

Best regards,
Sports Events Calendar
"""
            return subject, body
        
        # Create subject
        event_count = len(events)
        subject = f"Daily Sports Events Update - {event_count} New Event{'s' if event_count != 1 else ''}"
        
        # Create body
        body = f"""
Hello!

Here are the {event_count} new sports event{'s' if event_count != 1 else ''} added to your calendar in the last 24 hours:

{'='*60}

"""
        
        # Add each event
        for i, event in enumerate(events, 1):
            body += f"{i}. {self.format_event_for_email(event)}\n\n"
        
        body += f"""
{'='*60}

Total new events: {event_count}

View your full calendar at: [Your Calendar URL]

Best regards,
Sports Events Calendar 📅
"""
        
        return subject, body
    
    def send_email(self, subject: str, body: str) -> bool:
        """Send email notification"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = self.recipient_email
            msg['Subject'] = subject
            
            # Add body to email
            msg.attach(MIMEText(body, 'plain'))
            
            # Connect to server and send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Enable encryption
            server.login(self.sender_email, self.sender_password)
            
            text = msg.as_string()
            server.sendmail(self.sender_email, self.recipient_email, text)
            server.quit()
            
            logger.info(f"✅ Email sent successfully to {self.recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
    
    def run(self):
        """Main execution method"""
        logger.info("🚀 Starting daily email notification process...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Step 1: Get new events
            new_events = self.get_new_events()
            
            # Step 2: Create email content
            subject, body = self.create_email_content(new_events)
            
            # Step 3: Send email
            success = self.send_email(subject, body)
            
            # Step 4: Log results
            if success:
                logger.info(f"🎉 Daily email notification completed successfully!")
                logger.info(f"📧 Sent notification about {len(new_events)} new events")
            else:
                logger.error("❌ Failed to send daily email notification")
                
        except Exception as e:
            logger.error(f"❌ Fatal error in daily email process: {e}")
            raise

def main():
    """Main entry point"""
    notifier = DailyEmailNotifier()
    notifier.run()

if __name__ == "__main__":
    main()