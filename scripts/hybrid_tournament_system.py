#!/usr/bin/env python3
"""
Hybrid Tournament System

This system combines multiple approaches for comprehensive tournament discovery:
1. Web scraping from known tournament sources
2. Manual tournament data entry with validation
3. Gemini AI enhancement for missing data
4. Database integration with duplicate handling

This provides the most comprehensive and reliable tournament data.
"""

import os
import json
import logging
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
import google.generativeai as genai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hybrid_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HybridTournamentSystem:
    def __init__(self):
        """Initialize the hybrid tournament system"""
        self.supabase = self._connect_to_supabase()
        self.gemini = self._connect_to_gemini()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        self.stats = {
            'events_found': 0,
            'events_enhanced': 0,
            'events_added': 0,
            'events_updated': 0,
            'both_events_duplicated': 0,
            'errors': 0
        }
        
        # Manual tournament data (real tournaments we know about)
        self.manual_tournaments = [
            # Soccer Tournaments
            {
                'name': 'US Youth Soccer National Championships',
                'start_date': '2025-07-15',
                'end_date': '2025-07-21',
                'location': 'Orlando, FL',
                'sport': 'Soccer',
                'age': 'U15-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.usyouthsoccer.org/national-championships/'
            },
            {
                'name': 'US Club Soccer National Cup',
                'start_date': '2025-07-08',
                'end_date': '2025-07-14',
                'location': 'Denver, CO',
                'sport': 'Soccer',
                'age': 'U13-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.usclubsoccer.org/national-cup'
            },
            {
                'name': 'GotSoccer Tournament Series',
                'start_date': '2025-06-15',
                'end_date': '2025-06-22',
                'location': 'Various Locations',
                'sport': 'Soccer',
                'age': 'U10-U19',
                'gender': 'Both',
                'event_type': 'Tournament',
                'website': 'https://www.gotsoccer.com/tournaments'
            },
            # Lacrosse Tournaments
            {
                'name': 'US Lacrosse National Tournament',
                'start_date': '2025-07-22',
                'end_date': '2025-07-28',
                'location': 'Baltimore, MD',
                'sport': 'Lacrosse',
                'age': 'U15-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.uslacrosse.org/national-tournament'
            },
            {
                'name': 'Inside Lacrosse Recruiting Tournament',
                'start_date': '2025-06-28',
                'end_date': '2025-07-02',
                'location': 'Philadelphia, PA',
                'sport': 'Lacrosse',
                'age': 'High School',
                'gender': 'Both',
                'event_type': 'Showcase',
                'website': 'https://www.insidelacrosse.com/recruiting'
            },
            # Regional Tournaments
            {
                'name': 'Maryland State Cup',
                'start_date': '2025-05-15',
                'end_date': '2025-05-18',
                'location': 'Baltimore, MD',
                'sport': 'Soccer',
                'age': 'U13-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.msysa.org/state-cup'
            },
            {
                'name': 'Virginia State Cup',
                'start_date': '2025-05-22',
                'end_date': '2025-05-25',
                'location': 'Richmond, VA',
                'sport': 'Soccer',
                'age': 'U13-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.vysa.com/state-cup'
            },
            {
                'name': 'Pennsylvania State Cup',
                'start_date': '2025-05-29',
                'end_date': '2025-06-01',
                'location': 'Philadelphia, PA',
                'sport': 'Soccer',
                'age': 'U13-U19',
                'gender': 'Both',
                'event_type': 'Championship',
                'website': 'https://www.epysa.org/state-cup'
            }
        ]
    
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
    
    def scrape_known_tournaments(self) -> List[Dict]:
        """Scrape tournaments from known sources"""
        logger.info("🔍 Scraping known tournament sources...")
        events = []
        
        # Known tournament sources with specific URLs
        sources = [
            {
                'name': 'TourneyMachine Public Tournaments',
                'url': 'https://tourneymachine.com/public/tournaments',
                'sport': 'Soccer'
            },
            {
                'name': 'GotSoccer Tournament Directory',
                'url': 'https://www.gotsoccer.com/tournament-directory',
                'sport': 'Soccer'
            },
            {
                'name': 'US Lacrosse Events',
                'url': 'https://www.uslacrosse.org/events-calendar',
                'sport': 'Lacrosse'
            }
        ]
        
        for source in sources:
            try:
                logger.info(f"   🔍 Scraping {source['name']}...")
                response = self.session.get(source['url'], timeout=15)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for tournament listings
                    tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                      class_=re.compile(r'tournament|event|game'))
                    
                    for element in tournament_elements[:10]:  # Limit to 10 per source
                        try:
                            event = self.extract_tournament_data(element, source['sport'])
                            if event and self.validate_event(event):
                                events.append(event)
                        except Exception as e:
                            continue
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                logger.error(f"   ❌ Error scraping {source['name']}: {e}")
                continue
        
        logger.info(f"✅ Found {len(events)} events from known sources")
        return events
    
    def extract_tournament_data(self, element, sport: str) -> Optional[Dict]:
        """Extract tournament data from a page element"""
        try:
            event = {
                'sport': sport,
                'event_type': 'Tournament'
            }
            
            # Extract name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5'])
            if name_elem:
                event['name'] = name_elem.get_text().strip()
            
            # Extract date
            date_elem = element.find(['span', 'div', 'time'], 
                                   class_=re.compile(r'date|when'))
            if date_elem:
                date_text = date_elem.get_text().strip()
                parsed_date = self.parse_date(date_text)
                if parsed_date:
                    event['start_date'] = parsed_date
                    event['end_date'] = parsed_date
            
            # Extract location
            location_elem = element.find(['span', 'div'], 
                                       class_=re.compile(r'location|venue'))
            if location_elem:
                event['location'] = location_elem.get_text().strip()
            
            # Extract website
            link_elem = element.find('a', href=True)
            if link_elem:
                event['website'] = link_elem['href']
            
            return event if event.get('name') and event.get('start_date') else None
            
        except Exception as e:
            logger.error(f"Error extracting tournament data: {e}")
            return None
    
    def parse_date(self, date_text: str) -> Optional[str]:
        """Parse date text into YYYY-MM-DD format"""
        try:
            # Common date patterns
            patterns = [
                r'(\d{1,2})/(\d{1,2})/(\d{4})',  # MM/DD/YYYY
                r'(\d{4})-(\d{1,2})-(\d{1,2})',  # YYYY-MM-DD
                r'(\w+)\s+(\d{1,2}),?\s+(\d{4})',  # Month DD, YYYY
            ]
            
            for pattern in patterns:
                match = re.search(pattern, date_text)
                if match:
                    if len(match.groups()) == 3:
                        if len(match.group(1)) == 4:  # YYYY-MM-DD
                            return f"{match.group(1)}-{match.group(2).zfill(2)}-{match.group(3).zfill(2)}"
                        else:  # MM/DD/YYYY or Month DD, YYYY
                            month, day, year = match.groups()
                            if month.isdigit():
                                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                            else:
                                # Handle month names
                                month_map = {
                                    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                                    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                                    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
                                }
                                month_num = month_map.get(month[:3].lower())
                                if month_num:
                                    return f"{year}-{month_num}-{day.zfill(2)}"
            
            return None
            
        except Exception as e:
            logger.error(f"Error parsing date '{date_text}': {e}")
            return None
    
    def enhance_events_with_gemini(self, events: List[Dict]) -> List[Dict]:
        """Enhance events with missing data using Gemini"""
        logger.info("🤖 Enhancing events with Gemini AI...")
        
        enhanced_events = []
        
        for event in events:
            try:
                # Check what data is missing
                missing_fields = []
                if not event.get('age'):
                    missing_fields.append('age')
                if not event.get('gender'):
                    missing_fields.append('gender')
                if not event.get('event_type'):
                    missing_fields.append('event_type')
                if not event.get('website'):
                    missing_fields.append('website')
                
                if missing_fields:
                    logger.info(f"   🔄 Enhancing {event['name']} (missing: {', '.join(missing_fields)})")
                    
                    enhanced_data = self.enhance_event_with_gemini(event, missing_fields)
                    if enhanced_data:
                        event.update(enhanced_data)
                        self.stats['events_enhanced'] += 1
                    
                    time.sleep(1)  # Rate limiting
                
                enhanced_events.append(event)
                
            except Exception as e:
                logger.error(f"   ❌ Error enhancing event {event.get('name', 'Unknown')}: {e}")
                enhanced_events.append(event)
        
        logger.info(f"✅ Enhanced {self.stats['events_enhanced']} events")
        return enhanced_events
    
    def enhance_event_with_gemini(self, event: Dict, missing_fields: List[str]) -> Optional[Dict]:
        """Use Gemini to fill missing event data"""
        try:
            prompt = f"""
            You are an expert at finding information about youth sports events. 
            
            Event: {event['name']}
            Sport: {event['sport']}
            Location: {event.get('location', 'N/A')}
            Date: {event.get('start_date', 'N/A')}
            
            Missing fields: {', '.join(missing_fields)}
            
            Please provide the missing information in JSON format. Only include the missing fields:
            
            {{
                "age": "appropriate age group (e.g., U12, U14, U16, High School, etc.)",
                "gender": "Boys, Girls, or Both",
                "event_type": "Tournament, League, Camp, Clinic, Showcase, Championship, etc.",
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
                logger.info(f"      ✅ Enhanced data: {enhanced_data}")
                return enhanced_data
                
            except json.JSONDecodeError:
                logger.warning(f"      ⚠️ Invalid JSON response from Gemini: {result}")
                return None
                
        except Exception as e:
            logger.error(f"      ❌ Error enhancing event with Gemini: {e}")
            return None
    
    def validate_event(self, event: Dict) -> bool:
        """Validate event data"""
        required_fields = ['name', 'start_date', 'sport']
        
        for field in required_fields:
            if not event.get(field):
                return False
        
        # Validate date format
        try:
            datetime.strptime(event['start_date'], '%Y-%m-%d')
        except ValueError:
            return False
        
        return True
    
    def process_events(self, events: List[Dict]):
        """Process events and update database"""
        logger.info(f"🔄 Processing {len(events)} events...")
        
        for event in events:
            try:
                if not self.validate_event(event):
                    continue
                
                # Check for duplicates
                existing_id = self.check_duplicate(event)
                
                if existing_id:
                    # Update existing event
                    self.update_event(existing_id, event)
                else:
                    # Add new event
                    if self.add_event(event):
                        # Handle "Both" gender duplication
                        if event.get('gender') == 'Both':
                            self.duplicate_both_event(event)
                
            except Exception as e:
                logger.error(f"❌ Error processing event {event.get('name', 'Unknown')}: {e}")
                self.stats['errors'] += 1
    
    def check_duplicate(self, event: Dict) -> Optional[str]:
        """Check if event already exists"""
        try:
            response = self.supabase.table('events').select('id').eq('name', event['name']).eq('start_date', event['start_date']).eq('location', event.get('location', '')).execute()
            
            if response.data:
                return response.data[0]['id']
            return None
            
        except Exception as e:
            logger.error(f"❌ Error checking for duplicates: {e}")
            return None
    
    def add_event(self, event: Dict) -> bool:
        """Add new event to database"""
        try:
            # Remove id if present
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
        """Update existing event"""
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
    
    def duplicate_both_event(self, original_event: Dict):
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
            if self.add_event(boys_event):
                self.stats['both_events_duplicated'] += 1
            if self.add_event(girls_event):
                self.stats['both_events_duplicated'] += 1
            
            logger.info(f"   ✅ Duplicated 'Both' event: {original_event['name']}")
            
        except Exception as e:
            logger.error(f"   ❌ Error duplicating 'Both' event: {e}")
    
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
            
            return {
                'total_events': total_events,
                'sport_distribution': sport_counts
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting database stats: {e}")
            return {}
    
    def run(self):
        """Main execution method"""
        logger.info("🚀 Starting hybrid tournament system...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        all_events = []
        
        try:
            # Step 1: Add manual tournament data
            logger.info("📝 Adding manual tournament data...")
            all_events.extend(self.manual_tournaments)
            self.stats['events_found'] += len(self.manual_tournaments)
            
            # Step 2: Scrape known sources
            scraped_events = self.scrape_known_tournaments()
            all_events.extend(scraped_events)
            self.stats['events_found'] += len(scraped_events)
            
            # Step 3: Enhance events with Gemini
            enhanced_events = self.enhance_events_with_gemini(all_events)
            
            # Step 4: Process events
            if enhanced_events:
                self.process_events(enhanced_events)
            
            # Step 5: Get final stats
            db_stats = self.get_database_stats()
            
            # Step 6: Log summary
            logger.info("🎉 Hybrid tournament system completed!")
            logger.info("📊 SUMMARY:")
            logger.info(f"   • Events found: {self.stats['events_found']}")
            logger.info(f"   • Events enhanced: {self.stats['events_enhanced']}")
            logger.info(f"   • Events added: {self.stats['events_added']}")
            logger.info(f"   • Events updated: {self.stats['events_updated']}")
            logger.info(f"   • Both events duplicated: {self.stats['both_events_duplicated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info(f"   • Total in database: {db_stats.get('total_events', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in hybrid system: {e}")
            raise

def main():
    """Main entry point"""
    system = HybridTournamentSystem()
    system.run()

if __name__ == "__main__":
    main() 