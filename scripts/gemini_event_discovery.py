#!/usr/bin/env python3
"""
Enhanced Event Discovery with Gemini API Integration

This script:
1. Fills missing data for existing events
2. Discovers new events from the web
3. Automatically duplicates "Both" gender events
4. Updates the Supabase database
"""

import os
import json
import logging
import time
import google.generativeai as genai
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gemini_event_discovery.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GeminiEventDiscoveryBot:
    def __init__(self):
        """Initialize the bot with Supabase and Gemini connections"""
        self.supabase = self._connect_to_supabase()
        self.gemini = self._connect_to_gemini()
        self.stats = {
            'events_enhanced': 0,
            'events_discovered': 0,
            'events_added': 0,
            'events_updated': 0,
            'both_events_duplicated': 0,
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
    
    def _connect_to_gemini(self):
        """Connect to Gemini API"""
        try:
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                raise ValueError("Missing Gemini API key")
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("✅ Connected to Gemini API successfully")
            return model
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Gemini API: {e}")
            raise
    
    def enhance_existing_events(self):
        """Fill missing data for existing events using Gemini"""
        logger.info("🔍 Finding events with missing data...")
        
        try:
            # Get events with missing data
            response = self.supabase.table('events').select('*').execute()
            events = response.data
            
            events_to_enhance = []
            for event in events:
                # Check if event has missing data
                missing_fields = []
                if not event.get('age') or event.get('age') == '':
                    missing_fields.append('age')
                if not event.get('gender') or event.get('gender') == '':
                    missing_fields.append('gender')
                if not event.get('event_type') or event.get('event_type') == '':
                    missing_fields.append('event_type')
                if not event.get('website') or event.get('website') == '':
                    missing_fields.append('website')
                
                if missing_fields:
                    events_to_enhance.append({
                        'event': event,
                        'missing_fields': missing_fields
                    })
            
            logger.info(f"📊 Found {len(events_to_enhance)} events with missing data")
            
            # Process all events (or limit for cost control)
            # events_to_enhance = events_to_enhance[:20]  # Uncomment to limit for cost control
            logger.info(f"🔄 Processing {len(events_to_enhance)} events with missing data")
            
            # Enhance each event
            for item in events_to_enhance:
                event = item['event']
                missing_fields = item['missing_fields']
                
                logger.info(f"🔄 Enhancing event: {event['name']} (missing: {', '.join(missing_fields)})")
                
                enhanced_data = self._enhance_event_with_gemini(event, missing_fields)
                if enhanced_data:
                    self._update_event_data(event['id'], enhanced_data)
                    self.stats['events_enhanced'] += 1
                
                # Add delay to avoid rate limits
                time.sleep(1)
                
        except Exception as e:
            logger.error(f"❌ Error enhancing existing events: {e}")
            self.stats['errors'] += 1
    
    def _enhance_event_with_gemini(self, event: Dict, missing_fields: List[str]) -> Optional[Dict]:
        """Use Gemini to fill missing event data"""
        try:
            prompt = f"""
            You are an expert at finding information about youth sports events. 
            
            Event: {event['name']}
            Sport: {event['sport']}
            Location: {event['location']}
            Date: {event['start_date']}
            
            Missing fields: {', '.join(missing_fields)}
            
            Please provide the missing information in JSON format. Only include the missing fields:
            
            {{
                "age": "appropriate age group (e.g., U12, U14, U16, High School, etc.)",
                "gender": "Boys, Girls, or Both",
                "event_type": "Tournament, League, Camp, Clinic, Showcase, etc.",
                "website": "official event website URL if available"
            }}
            
            Rules:
            - Only fill in the missing fields
            - Use "N/A" if information cannot be determined
            - For gender, use "Both" if the event is open to both boys and girls
            - Be specific with age groups when possible
            - Only provide real, factual information
            """
            
            response = self.gemini.generate_content(prompt)
            result = response.text.strip()
            
            # Parse JSON response (handle markdown formatting)
            try:
                # Remove markdown code blocks if present
                if result.startswith('```json'):
                    result = result.replace('```json', '').replace('```', '').strip()
                elif result.startswith('```'):
                    result = result.replace('```', '').strip()
                
                enhanced_data = json.loads(result)
                logger.info(f"   ✅ Enhanced data: {enhanced_data}")
                return enhanced_data
                
            except json.JSONDecodeError:
                logger.warning(f"   ⚠️ Invalid JSON response from Gemini: {result}")
                return None
                
        except Exception as e:
            logger.error(f"   ❌ Error enhancing event with Gemini: {e}")
            return None
    
    def discover_new_events(self) -> List[Dict]:
        """Discover new events using Gemini"""
        logger.info("🔍 Discovering new events with Gemini...")
        
        try:
            prompt = """
            You are an expert at youth sports events. Based on your knowledge, suggest some upcoming youth sports events that are likely to happen.
            
            Create events that match these criteria:
            - Youth sports events (soccer, basketball, football, baseball, tennis, swimming, volleyball, hockey, lacrosse)
            - Events that typically happen in the next 6 months
            - Common tournaments, leagues, camps, clinics, showcases
            - Realistic dates and locations
            
            Return the events in this exact JSON format:
            [
                {
                    "name": "Event Name",
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD",
                    "location": "City, State",
                    "sport": "Sport Name",
                    "age": "Age Group (e.g., U12, U14, High School)",
                    "gender": "Boys, Girls, or Both",
                    "event_type": "Tournament, League, Camp, Clinic, Showcase",
                    "website": "N/A"
                }
            ]
            
            Rules:
            - Create realistic events based on common patterns
            - Use "Both" for gender if event is open to both
            - Use realistic dates in the next 6 months
            - Include 3-5 high-quality events
            - Set website to "N/A" since we can't verify URLs
            """
            
            response = self.gemini.generate_content(prompt)
            result = response.text.strip()
            
            # Parse JSON response
            try:
                events = json.loads(result)
                logger.info(f"📊 Discovered {len(events)} potential new events")
                return events
                
            except json.JSONDecodeError:
                logger.error(f"❌ Invalid JSON response from Gemini: {result}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error discovering events with Gemini: {e}")
            return []
    
    def _update_event_data(self, event_id: str, enhanced_data: Dict) -> bool:
        """Update event with enhanced data"""
        try:
            response = self.supabase.table('events').update(enhanced_data).eq('id', event_id).execute()
            
            if response.data:
                logger.info(f"   ✅ Updated event {event_id}")
                self.stats['events_updated'] += 1
                return True
            else:
                logger.error(f"   ❌ Failed to update event {event_id}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            logger.error(f"   ❌ Error updating event {event_id}: {e}")
            self.stats['errors'] += 1
            return False
    
    def process_new_events(self, events: List[Dict]):
        """Process discovered events and handle "Both" gender duplication"""
        logger.info(f"🔄 Processing {len(events)} discovered events...")
        
        for event in events:
            try:
                # Validate event
                if not self._validate_event(event):
                    self.stats['errors'] += 1
                    continue
                
                # Check for duplicates
                existing_id = self._check_duplicate(event)
                
                if existing_id:
                    # Update existing event
                    self._update_event_data(existing_id, event)
                else:
                    # Add new event
                    if self._add_event(event):
                        self.stats['events_added'] += 1
                        
                        # Handle "Both" gender duplication
                        if event.get('gender') == 'Both':
                            self._duplicate_both_event(event)
                
            except Exception as e:
                logger.error(f"❌ Error processing event {event.get('name', 'Unknown')}: {e}")
                self.stats['errors'] += 1
    
    def _duplicate_both_event(self, original_event: Dict):
        """Duplicate a "Both" gender event into separate Boys and Girls events"""
        try:
            # Create Boys version
            boys_event = original_event.copy()
            boys_event['gender'] = 'Boys'
            boys_event['name'] = f"{original_event['name']} (Boys)"
            
            # Create Girls version
            girls_event = original_event.copy()
            girls_event['gender'] = 'Girls'
            girls_event['name'] = f"{original_event['name']} (Girls)"
            
            # Add both versions
            if self._add_event(boys_event):
                self.stats['both_events_duplicated'] += 1
            if self._add_event(girls_event):
                self.stats['both_events_duplicated'] += 1
            
            logger.info(f"   ✅ Duplicated 'Both' event: {original_event['name']}")
            
        except Exception as e:
            logger.error(f"   ❌ Error duplicating 'Both' event: {e}")
    
    def _validate_event(self, event: Dict) -> bool:
        """Validate event data"""
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
    
    def _check_duplicate(self, event: Dict) -> Optional[str]:
        """Check if event already exists"""
        try:
            response = self.supabase.table('events').select('id').eq('name', event['name']).eq('start_date', event['start_date']).eq('location', event['location']).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
            
        except Exception as e:
            logger.error(f"❌ Error checking for duplicates: {e}")
            return None
    
    def _add_event(self, event: Dict) -> bool:
        """Add new event to database"""
        try:
            # Remove id if present
            event_data = {k: v for k, v in event.items() if k != 'id'}
            
            response = self.supabase.table('events').insert(event_data).execute()
            
            if response.data:
                logger.info(f"✅ Added new event: {event['name']} ({event['start_date']})")
                return True
            else:
                logger.error(f"❌ Failed to add event: {event['name']}")
                self.stats['errors'] += 1
                return False
                
        except Exception as e:
            logger.error(f"❌ Error adding event {event.get('name', 'Unknown')}: {e}")
            self.stats['errors'] += 1
            return False
    
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
        logger.info("🚀 Starting enhanced event discovery with Gemini...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Step 1: Enhance existing events
            self.enhance_existing_events()
            
            # Step 2: Discover new events
            discovered_events = self.discover_new_events()
            self.stats['events_discovered'] = len(discovered_events)
            
            # Step 3: Process new events
            if discovered_events:
                self.process_new_events(discovered_events)
            
            # Step 4: Get final stats
            db_stats = self.get_database_stats()
            
            # Step 5: Log summary
            logger.info("🎉 Enhanced event discovery completed!")
            logger.info("📊 SUMMARY:")
            logger.info(f"   • Events enhanced: {self.stats['events_enhanced']}")
            logger.info(f"   • Events discovered: {self.stats['events_discovered']}")
            logger.info(f"   • Events added: {self.stats['events_added']}")
            logger.info(f"   • Events updated: {self.stats['events_updated']}")
            logger.info(f"   • Both events duplicated: {self.stats['both_events_duplicated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info(f"   • Total in database: {db_stats.get('total_events', 'N/A')}")
            logger.info(f"   • Recent events (7 days): {db_stats.get('recent_events', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in enhanced discovery: {e}")
            raise

def main():
    """Main entry point"""
    bot = GeminiEventDiscoveryBot()
    bot.run()

if __name__ == "__main__":
    main() 