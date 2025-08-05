#!/usr/bin/env python3
"""
Daily Event Discovery and Database Update Script

This script runs daily via GitHub Actions to:
1. Discover new youth sports events
2. Update the Supabase database
3. Log all activities
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('event_discovery.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EventDiscoveryBot:
    def __init__(self):
        """Initialize the event discovery bot with Supabase connection"""
        self.supabase = self._connect_to_supabase()
        self.stats = {
            'events_discovered': 0,
            'events_added': 0,
            'events_updated': 0,
            'errors': 0
        }
    
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
    
    def discover_events(self) -> List[Dict]:
        """
        Discover new events (placeholder for now)
        TODO: Integrate with Gemini API for actual event discovery
        """
        logger.info("🔍 Starting event discovery...")
        
        # TODO: This is where Gemini API integration will go
        # For now, return empty list as placeholder
        discovered_events = []
        
        logger.info(f"📊 Discovered {len(discovered_events)} potential new events")
        return discovered_events
    
    def validate_event(self, event: Dict) -> bool:
        """Validate that an event has all required fields"""
        required_fields = ['name', 'start_date', 'end_date', 'location', 'sport']
        
        for field in required_fields:
            if not event.get(field):
                logger.warning(f"⚠️ Event missing required field: {field}")
                return False
        
        # Validate date format
        try:
            datetime.strptime(event['start_date'], '%Y-%m-%d')
            datetime.strptime(event['end_date'], '%Y-%m-%d')
        except ValueError:
            logger.warning(f"⚠️ Invalid date format for event: {event.get('name', 'Unknown')}")
            return False
        
        return True
    
    def check_duplicate(self, event: Dict) -> Optional[str]:
        """Check if event already exists in database"""
        try:
            response = self.supabase.table('events').select('id').eq('name', event['name']).eq('start_date', event['start_date']).eq('location', event['location']).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
            
        except Exception as e:
            logger.error(f"❌ Error checking for duplicates: {e}")
            return None
    
    def add_event(self, event: Dict) -> bool:
        """Add a new event to the database"""
        try:
            # Remove id if present (let Supabase generate it)
            event_data = {k: v for k, v in event.items() if k != 'id'}
            
            response = self.supabase.table('events').insert(event_data).execute()
            
            if response.data:
                logger.info(f"✅ Added new event: {event['name']} ({event['start_date']})")
                self.stats['events_added'] += 1
                return True
            else:
                logger.error(f"❌ Failed to add event: {event['name']}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Error adding event {event.get('name', 'Unknown')}: {e}")
            self.stats['errors'] += 1
            return False
    
    def update_event(self, event_id: str, event: Dict) -> bool:
        """Update an existing event in the database"""
        try:
            # Remove id and timestamps from update data
            update_data = {k: v for k, v in event.items() if k not in ['id', 'created_at', 'updated_at']}
            
            response = self.supabase.table('events').update(update_data).eq('id', event_id).execute()
            
            if response.data:
                logger.info(f"🔄 Updated event: {event['name']} ({event['start_date']})")
                self.stats['events_updated'] += 1
                return True
            else:
                logger.error(f"❌ Failed to update event: {event['name']}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Error updating event {event.get('name', 'Unknown')}: {e}")
            self.stats['errors'] += 1
            return False
    
    def process_events(self, events: List[Dict]):
        """Process discovered events - add new ones, update existing ones"""
        logger.info(f"🔄 Processing {len(events)} discovered events...")
        
        for event in events:
            try:
                # Validate event
                if not self.validate_event(event):
                    self.stats['errors'] += 1
                    continue
                
                # Check for duplicates
                existing_id = self.check_duplicate(event)
                
                if existing_id:
                    # Update existing event
                    self.update_event(existing_id, event)
                else:
                    # Add new event
                    self.add_event(event)
                    
            except Exception as e:
                logger.error(f"❌ Error processing event {event.get('name', 'Unknown')}: {e}")
                self.stats['errors'] += 1
    
    def get_database_stats(self) -> Dict:
        """Get current database statistics"""
        try:
            # Total events
            total_response = self.supabase.table('events').select('id', count='exact').execute()
            total_events = total_response.count
            
            # Events by sport
            sport_response = self.supabase.table('events').select('sport').execute()
            sport_counts = {}
            for event in sport_response.data:
                sport = event['sport'] or 'Unknown'
                sport_counts[sport] = sport_counts.get(sport, 0) + 1
            
            # Recent events (last 7 days)
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            recent_response = self.supabase.table('events').select('id', count='exact').gte('start_date', week_ago).execute()
            recent_events = recent_response.count
            
            return {
                'total_events': total_events,
                'recent_events': recent_events,
                'sport_distribution': sport_counts
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting database stats: {e}")
            return {}
    
    def run(self):
        """Main execution method"""
        logger.info("🚀 Starting daily event discovery process...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Step 1: Discover events
            discovered_events = self.discover_events()
            self.stats['events_discovered'] = len(discovered_events)
            
            # Step 2: Process events
            if discovered_events:
                self.process_events(discovered_events)
            
            # Step 3: Get final stats
            db_stats = self.get_database_stats()
            
            # Step 4: Log summary
            logger.info("🎉 Daily event discovery completed!")
            logger.info("📊 SUMMARY:")
            logger.info(f"   • Events discovered: {self.stats['events_discovered']}")
            logger.info(f"   • Events added: {self.stats['events_added']}")
            logger.info(f"   • Events updated: {self.stats['events_updated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info(f"   • Total in database: {db_stats.get('total_events', 'N/A')}")
            logger.info(f"   • Recent events (7 days): {db_stats.get('recent_events', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in daily discovery: {e}")
            raise

def main():
    """Main entry point"""
    bot = EventDiscoveryBot()
    bot.run()

if __name__ == "__main__":
    main() 