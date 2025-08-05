#!/usr/bin/env python3
"""
Comprehensive Tournament Scraper

This script scrapes real tournament data from the best sources identified:
- Soccer: US Club Soccer, US Youth Soccer, GotSoccer
- Lacrosse: US Lacrosse, LaxPower

Features:
1. Multi-source scraping
2. Data validation and cleaning
3. Automatic "Both" gender duplication
4. Database integration
5. Rate limiting and error handling
"""

import os
import json
import logging
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('comprehensive_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ComprehensiveTournamentScraper:
    def __init__(self):
        """Initialize the comprehensive scraper"""
        self.supabase = self._connect_to_supabase()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        self.stats = {
            'soccer_events_found': 0,
            'lacrosse_events_found': 0,
            'events_added': 0,
            'events_updated': 0,
            'both_events_duplicated': 0,
            'errors': 0
        }
        
        # Define scraping sources based on research
        self.sources = {
            'soccer': [
                {
                    'name': 'US Club Soccer',
                    'url': 'https://www.usclubsoccer.org/',
                    'scraper': self.scrape_us_club_soccer
                },
                {
                    'name': 'US Youth Soccer',
                    'url': 'https://www.usyouthsoccer.org/',
                    'scraper': self.scrape_us_youth_soccer
                },
                {
                    'name': 'GotSoccer',
                    'url': 'https://www.gotsoccer.com/',
                    'scraper': self.scrape_gotsoccer
                }
            ],
            'lacrosse': [
                {
                    'name': 'US Lacrosse',
                    'url': 'https://www.uslacrosse.org/',
                    'scraper': self.scrape_us_lacrosse
                },
                {
                    'name': 'LaxPower',
                    'url': 'https://www.laxpower.com/',
                    'scraper': self.scrape_laxpower
                }
            ]
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
    
    def scrape_all_sources(self) -> List[Dict]:
        """Scrape all sources for both sports"""
        logger.info("🚀 Starting comprehensive tournament scraping...")
        
        all_events = []
        
        for sport, sources in self.sources.items():
            logger.info(f"\n🏈 Scraping {sport.upper()} sources...")
            
            for source in sources:
                try:
                    logger.info(f"   🔍 Scraping {source['name']}...")
                    events = source['scraper']()
                    
                    if events:
                        # Add sport information to events
                        for event in events:
                            event['sport'] = sport.capitalize()
                        
                        all_events.extend(events)
                        logger.info(f"   ✅ Found {len(events)} events from {source['name']}")
                        
                        if sport == 'soccer':
                            self.stats['soccer_events_found'] += len(events)
                        else:
                            self.stats['lacrosse_events_found'] += len(events)
                    
                    # Rate limiting
                    time.sleep(3)
                    
                except Exception as e:
                    logger.error(f"   ❌ Error scraping {source['name']}: {e}")
                    self.stats['errors'] += 1
        
        logger.info(f"\n📊 Scraping completed: {len(all_events)} total events found")
        return all_events
    
    def scrape_us_club_soccer(self) -> List[Dict]:
        """Scrape US Club Soccer tournaments"""
        events = []
        
        try:
            # Try different tournament pages
            tournament_urls = [
                'https://www.usclubsoccer.org/tournaments',
                'https://www.usclubsoccer.org/events',
                'https://www.usclubsoccer.org/calendar'
            ]
            
            for url in tournament_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament listings
                        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                          class_=lambda x: x and any(keyword in x.lower() 
                                                          for keyword in ['tournament', 'event', 'game']))
                        
                        for element in tournament_elements:
                            event = self.extract_tournament_data(element, 'Soccer')
                            if event and self.validate_event(event):
                                events.append(event)
                        
                        if events:
                            break  # Found events, stop trying other URLs
                
                except Exception as e:
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error scraping US Club Soccer: {e}")
            return []
    
    def scrape_us_youth_soccer(self) -> List[Dict]:
        """Scrape US Youth Soccer tournaments"""
        events = []
        
        try:
            # Try different tournament pages
            tournament_urls = [
                'https://www.usyouthsoccer.org/tournaments',
                'https://www.usyouthsoccer.org/events',
                'https://www.usyouthsoccer.org/calendar'
            ]
            
            for url in tournament_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament listings
                        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                          class_=lambda x: x and any(keyword in x.lower() 
                                                          for keyword in ['tournament', 'event', 'game']))
                        
                        for element in tournament_elements:
                            event = self.extract_tournament_data(element, 'Soccer')
                            if event and self.validate_event(event):
                                events.append(event)
                        
                        if events:
                            break
                
                except Exception as e:
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error scraping US Youth Soccer: {e}")
            return []
    
    def scrape_gotsoccer(self) -> List[Dict]:
        """Scrape GotSoccer tournaments"""
        events = []
        
        try:
            # Try different tournament pages
            tournament_urls = [
                'https://www.gotsoccer.com/tournaments',
                'https://www.gotsoccer.com/events',
                'https://www.gotsoccer.com/calendar'
            ]
            
            for url in tournament_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament listings
                        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                          class_=lambda x: x and any(keyword in x.lower() 
                                                          for keyword in ['tournament', 'event', 'game']))
                        
                        for element in tournament_elements:
                            event = self.extract_tournament_data(element, 'Soccer')
                            if event and self.validate_event(event):
                                events.append(event)
                        
                        if events:
                            break
                
                except Exception as e:
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error scraping GotSoccer: {e}")
            return []
    
    def scrape_us_lacrosse(self) -> List[Dict]:
        """Scrape US Lacrosse tournaments"""
        events = []
        
        try:
            # Try different tournament pages
            tournament_urls = [
                'https://www.uslacrosse.org/events',
                'https://www.uslacrosse.org/tournaments',
                'https://www.uslacrosse.org/calendar'
            ]
            
            for url in tournament_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament listings
                        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                          class_=lambda x: x and any(keyword in x.lower() 
                                                          for keyword in ['tournament', 'event', 'game']))
                        
                        for element in tournament_elements:
                            event = self.extract_tournament_data(element, 'Lacrosse')
                            if event and self.validate_event(event):
                                events.append(event)
                        
                        if events:
                            break
                
                except Exception as e:
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error scraping US Lacrosse: {e}")
            return []
    
    def scrape_laxpower(self) -> List[Dict]:
        """Scrape LaxPower tournaments"""
        events = []
        
        try:
            # Try different tournament pages
            tournament_urls = [
                'https://www.laxpower.com/tournaments',
                'https://www.laxpower.com/events',
                'https://www.laxpower.com/calendar'
            ]
            
            for url in tournament_urls:
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament listings
                        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                                          class_=lambda x: x and any(keyword in x.lower() 
                                                          for keyword in ['tournament', 'event', 'game']))
                        
                        for element in tournament_elements:
                            event = self.extract_tournament_data(element, 'Lacrosse')
                            if event and self.validate_event(event):
                                events.append(event)
                        
                        if events:
                            break
                
                except Exception as e:
                    continue
            
            return events
            
        except Exception as e:
            logger.error(f"Error scraping LaxPower: {e}")
            return []
    
    def extract_tournament_data(self, element, sport) -> Optional[Dict]:
        """Extract tournament data from a page element"""
        try:
            event = {
                'sport': sport,
                'age': None,
                'gender': None,
                'event_type': None,
                'website': None
            }
            
            # Extract name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5'])
            if name_elem:
                event['name'] = name_elem.get_text().strip()
            
            # Extract date
            date_elem = element.find(['span', 'div', 'time'], 
                                   class_=lambda x: x and any(keyword in x.lower() 
                                   for keyword in ['date', 'time', 'when']))
            if date_elem:
                date_text = date_elem.get_text().strip()
                parsed_date = self.parse_date(date_text)
                if parsed_date:
                    event['start_date'] = parsed_date
                    event['end_date'] = parsed_date  # Default to same date
            
            # Extract location
            location_elem = element.find(['span', 'div'], 
                                       class_=lambda x: x and any(keyword in x.lower() 
                                       for keyword in ['location', 'venue', 'where']))
            if location_elem:
                event['location'] = location_elem.get_text().strip()
            
            # Extract age group
            age_elem = element.find(['span', 'div'], 
                                  class_=lambda x: x and any(keyword in x.lower() 
                                  for keyword in ['age', 'division', 'u12', 'u14', 'u16']))
            if age_elem:
                event['age'] = self.extract_age_group(age_elem.get_text().strip())
            
            # Extract gender
            gender_elem = element.find(['span', 'div'], 
                                     class_=lambda x: x and any(keyword in x.lower() 
                                     for keyword in ['boys', 'girls', 'gender']))
            if gender_elem:
                event['gender'] = self.extract_gender(gender_elem.get_text().strip())
            
            # Extract event type
            event['event_type'] = self.determine_event_type(event.get('name', ''))
            
            # Extract website
            link_elem = element.find('a', href=True)
            if link_elem:
                event['website'] = link_elem.get('href')
            
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
    
    def extract_age_group(self, text: str) -> Optional[str]:
        """Extract age group from text"""
        text_lower = text.lower()
        
        # Common age patterns
        age_patterns = [
            (r'u(\d+)', 'U{}'),
            (r'u-(\d+)', 'U{}'),
            (r'under\s+(\d+)', 'U{}'),
            (r'(\d+)\s*&\s*under', 'U{}'),
            (r'high\s+school', 'High School'),
            (r'college', 'College'),
        ]
        
        for pattern, format_str in age_patterns:
            match = re.search(pattern, text_lower)
            if match:
                if 'high school' in text_lower or 'college' in text_lower:
                    return format_str
                else:
                    return format_str.format(match.group(1))
        
        return None
    
    def extract_gender(self, text: str) -> Optional[str]:
        """Extract gender from text"""
        text_lower = text.lower()
        
        if 'boys' in text_lower or 'male' in text_lower:
            return 'Boys'
        elif 'girls' in text_lower or 'female' in text_lower:
            return 'Girls'
        elif 'both' in text_lower or 'coed' in text_lower:
            return 'Both'
        
        return None
    
    def determine_event_type(self, name: str) -> str:
        """Determine event type from name"""
        name_lower = name.lower()
        
        if any(keyword in name_lower for keyword in ['tournament', 'tourney']):
            return 'Tournament'
        elif any(keyword in name_lower for keyword in ['league', 'season']):
            return 'League'
        elif any(keyword in name_lower for keyword in ['camp', 'clinic']):
            return 'Camp'
        elif any(keyword in name_lower for keyword in ['showcase', 'combine']):
            return 'Showcase'
        elif any(keyword in name_lower for keyword in ['championship', 'final']):
            return 'Championship'
        
        return 'Tournament'  # Default
    
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
        """Process scraped events and update database"""
        logger.info(f"🔄 Processing {len(events)} scraped events...")
        
        for event in events:
            try:
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
        logger.info("🚀 Starting comprehensive tournament scraping...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Step 1: Scrape all sources
            scraped_events = self.scrape_all_sources()
            
            # Step 2: Process events
            if scraped_events:
                self.process_events(scraped_events)
            
            # Step 3: Get final stats
            db_stats = self.get_database_stats()
            
            # Step 4: Log summary
            logger.info("🎉 Comprehensive scraping completed!")
            logger.info("📊 SUMMARY:")
            logger.info(f"   • Soccer events found: {self.stats['soccer_events_found']}")
            logger.info(f"   • Lacrosse events found: {self.stats['lacrosse_events_found']}")
            logger.info(f"   • Events added: {self.stats['events_added']}")
            logger.info(f"   • Events updated: {self.stats['events_updated']}")
            logger.info(f"   • Both events duplicated: {self.stats['both_events_duplicated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info(f"   • Total in database: {db_stats.get('total_events', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in comprehensive scraping: {e}")
            raise

def main():
    """Main entry point"""
    scraper = ComprehensiveTournamentScraper()
    scraper.run()

if __name__ == "__main__":
    main() 