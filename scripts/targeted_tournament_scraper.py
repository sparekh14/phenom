#!/usr/bin/env python3
"""
Targeted Tournament Scraper

This script targets specific tournament platforms with known public data:
1. TourneyMachine (via their public tournament listings)
2. GotSoccer (via their tournament database)
3. US Lacrosse (via their events calendar)
4. Regional tournament directories

Focuses on finding real, upcoming tournaments with complete information.
"""

import os
import json
import logging
import time
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse, quote
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('targeted_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TargetedTournamentScraper:
    def __init__(self):
        """Initialize the targeted scraper"""
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
    
    def scrape_tourneymachine(self) -> List[Dict]:
        """Scrape TourneyMachine tournaments"""
        logger.info("🔍 Scraping TourneyMachine tournaments...")
        events = []
        
        try:
            # TourneyMachine has a search API
            search_url = "https://tourneymachine.com/api/tournaments"
            
            # Search for upcoming tournaments
            params = {
                'sport': 'soccer',
                'status': 'upcoming',
                'limit': 50
            }
            
            response = self.session.get(search_url, params=params, timeout=15)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'tournaments' in data:
                        for tournament in data['tournaments']:
                            event = self.parse_tourneymachine_event(tournament)
                            if event:
                                events.append(event)
                except json.JSONDecodeError:
                    logger.warning("TourneyMachine API returned non-JSON response")
            
            # Also try lacrosse tournaments
            params['sport'] = 'lacrosse'
            response = self.session.get(search_url, params=params, timeout=15)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'tournaments' in data:
                        for tournament in data['tournaments']:
                            event = self.parse_tourneymachine_event(tournament)
                            if event:
                                events.append(event)
                except json.JSONDecodeError:
                    logger.warning("TourneyMachine API returned non-JSON response")
            
            logger.info(f"✅ Found {len(events)} TourneyMachine events")
            return events
            
        except Exception as e:
            logger.error(f"❌ Error scraping TourneyMachine: {e}")
            return []
    
    def parse_tourneymachine_event(self, tournament: Dict) -> Optional[Dict]:
        """Parse TourneyMachine tournament data"""
        try:
            event = {
                'name': tournament.get('name', ''),
                'start_date': tournament.get('start_date', ''),
                'end_date': tournament.get('end_date', ''),
                'location': tournament.get('location', ''),
                'sport': tournament.get('sport', '').capitalize(),
                'age': tournament.get('age_group', ''),
                'gender': tournament.get('gender', ''),
                'event_type': 'Tournament',
                'website': tournament.get('url', '')
            }
            
            # Clean up data
            if event['gender'].lower() in ['coed', 'mixed']:
                event['gender'] = 'Both'
            elif event['gender'].lower() == 'male':
                event['gender'] = 'Boys'
            elif event['gender'].lower() == 'female':
                event['gender'] = 'Girls'
            
            return event if event['name'] and event['start_date'] else None
            
        except Exception as e:
            logger.error(f"Error parsing TourneyMachine event: {e}")
            return None
    
    def scrape_gotsoccer_tournaments(self) -> List[Dict]:
        """Scrape GotSoccer tournaments"""
        logger.info("🔍 Scraping GotSoccer tournaments...")
        events = []
        
        try:
            # GotSoccer tournament search
            search_url = "https://www.gotsoccer.com/tournaments"
            
            response = self.session.get(search_url, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for tournament listings
                tournament_links = soup.find_all('a', href=re.compile(r'/tournament/\d+'))
                
                for link in tournament_links[:10]:  # Limit to first 10
                    try:
                        tournament_url = urljoin(search_url, link['href'])
                        event = self.scrape_gotsoccer_tournament_page(tournament_url)
                        if event:
                            events.append(event)
                        time.sleep(1)  # Rate limiting
                    except Exception as e:
                        continue
            
            logger.info(f"✅ Found {len(events)} GotSoccer events")
            return events
            
        except Exception as e:
            logger.error(f"❌ Error scraping GotSoccer: {e}")
            return []
    
    def scrape_gotsoccer_tournament_page(self, url: str) -> Optional[Dict]:
        """Scrape individual GotSoccer tournament page"""
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                event = {
                    'sport': 'Soccer',
                    'event_type': 'Tournament',
                    'website': url
                }
                
                # Extract tournament name
                name_elem = soup.find('h1') or soup.find('h2')
                if name_elem:
                    event['name'] = name_elem.get_text().strip()
                
                # Extract date
                date_elem = soup.find(['span', 'div'], class_=re.compile(r'date|when'))
                if date_elem:
                    date_text = date_elem.get_text().strip()
                    parsed_date = self.parse_date(date_text)
                    if parsed_date:
                        event['start_date'] = parsed_date
                        event['end_date'] = parsed_date
                
                # Extract location
                location_elem = soup.find(['span', 'div'], class_=re.compile(r'location|venue'))
                if location_elem:
                    event['location'] = location_elem.get_text().strip()
                
                # Extract age and gender from tournament details
                details_text = soup.get_text().lower()
                
                # Age groups
                age_match = re.search(r'u(\d+)', details_text)
                if age_match:
                    event['age'] = f"U{age_match.group(1)}"
                
                # Gender
                if 'boys' in details_text:
                    event['gender'] = 'Boys'
                elif 'girls' in details_text:
                    event['gender'] = 'Girls'
                elif 'coed' in details_text or 'both' in details_text:
                    event['gender'] = 'Both'
                
                return event if event.get('name') and event.get('start_date') else None
            
            return None
            
        except Exception as e:
            logger.error(f"Error scraping GotSoccer tournament page: {e}")
            return None
    
    def scrape_us_lacrosse_events(self) -> List[Dict]:
        """Scrape US Lacrosse events"""
        logger.info("🔍 Scraping US Lacrosse events...")
        events = []
        
        try:
            # US Lacrosse events page
            events_url = "https://www.uslacrosse.org/events"
            
            response = self.session.get(events_url, timeout=15)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for event listings
                event_elements = soup.find_all(['div', 'article'], class_=re.compile(r'event|tournament'))
                
                for element in event_elements[:15]:  # Limit to first 15
                    try:
                        event = self.extract_us_lacrosse_event(element)
                        if event:
                            events.append(event)
                    except Exception as e:
                        continue
            
            logger.info(f"✅ Found {len(events)} US Lacrosse events")
            return events
            
        except Exception as e:
            logger.error(f"❌ Error scraping US Lacrosse: {e}")
            return []
    
    def extract_us_lacrosse_event(self, element) -> Optional[Dict]:
        """Extract US Lacrosse event data"""
        try:
            event = {
                'sport': 'Lacrosse',
                'event_type': 'Tournament'
            }
            
            # Extract name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4'])
            if name_elem:
                event['name'] = name_elem.get_text().strip()
            
            # Extract date
            date_elem = element.find(['span', 'div', 'time'], class_=re.compile(r'date|when'))
            if date_elem:
                date_text = date_elem.get_text().strip()
                parsed_date = self.parse_date(date_text)
                if parsed_date:
                    event['start_date'] = parsed_date
                    event['end_date'] = parsed_date
            
            # Extract location
            location_elem = element.find(['span', 'div'], class_=re.compile(r'location|venue'))
            if location_elem:
                event['location'] = location_elem.get_text().strip()
            
            # Extract age and gender from text
            text = element.get_text().lower()
            
            # Age groups
            age_match = re.search(r'u(\d+)', text)
            if age_match:
                event['age'] = f"U{age_match.group(1)}"
            
            # Gender
            if 'boys' in text:
                event['gender'] = 'Boys'
            elif 'girls' in text:
                event['gender'] = 'Girls'
            elif 'coed' in text or 'both' in text:
                event['gender'] = 'Both'
            
            # Extract website
            link_elem = element.find('a', href=True)
            if link_elem:
                event['website'] = link_elem['href']
            
            return event if event.get('name') and event.get('start_date') else None
            
        except Exception as e:
            logger.error(f"Error extracting US Lacrosse event: {e}")
            return None
    
    def scrape_regional_tournaments(self) -> List[Dict]:
        """Scrape regional tournament directories"""
        logger.info("🔍 Scraping regional tournament directories...")
        events = []
        
        # Regional tournament sources
        regional_sources = [
            {
                'name': 'Maryland Soccer Tournament Directory',
                'url': 'https://www.msysa.org/tournaments',
                'sport': 'Soccer'
            },
            {
                'name': 'Virginia Soccer Tournament Directory',
                'url': 'https://www.vysa.com/tournaments',
                'sport': 'Soccer'
            },
            {
                'name': 'Pennsylvania Soccer Tournament Directory',
                'url': 'https://www.epysa.org/tournaments',
                'sport': 'Soccer'
            }
        ]
        
        for source in regional_sources:
            try:
                logger.info(f"   🔍 Scraping {source['name']}...")
                response = self.session.get(source['url'], timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Look for tournament listings
                    tournament_elements = soup.find_all(['div', 'article'], 
                                                      class_=re.compile(r'tournament|event'))
                    
                    for element in tournament_elements[:5]:  # Limit to 5 per source
                        try:
                            event = self.extract_regional_tournament(element, source['sport'])
                            if event:
                                events.append(event)
                        except Exception as e:
                            continue
                
                time.sleep(2)  # Rate limiting
                
            except Exception as e:
                logger.error(f"   ❌ Error scraping {source['name']}: {e}")
                continue
        
        logger.info(f"✅ Found {len(events)} regional events")
        return events
    
    def extract_regional_tournament(self, element, sport: str) -> Optional[Dict]:
        """Extract regional tournament data"""
        try:
            event = {
                'sport': sport,
                'event_type': 'Tournament'
            }
            
            # Extract name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4'])
            if name_elem:
                event['name'] = name_elem.get_text().strip()
            
            # Extract date
            date_elem = element.find(['span', 'div', 'time'], class_=re.compile(r'date|when'))
            if date_elem:
                date_text = date_elem.get_text().strip()
                parsed_date = self.parse_date(date_text)
                if parsed_date:
                    event['start_date'] = parsed_date
                    event['end_date'] = parsed_date
            
            # Extract location
            location_elem = element.find(['span', 'div'], class_=re.compile(r'location|venue'))
            if location_elem:
                event['location'] = location_elem.get_text().strip()
            
            # Extract website
            link_elem = element.find('a', href=True)
            if link_elem:
                event['website'] = link_elem['href']
            
            return event if event.get('name') and event.get('start_date') else None
            
        except Exception as e:
            logger.error(f"Error extracting regional tournament: {e}")
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
        logger.info("🚀 Starting targeted tournament scraping...")
        logger.info(f"📅 Run time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        all_events = []
        
        try:
            # Step 1: Scrape TourneyMachine
            tourneymachine_events = self.scrape_tourneymachine()
            all_events.extend(tourneymachine_events)
            
            # Step 2: Scrape GotSoccer
            gotsoccer_events = self.scrape_gotsoccer_tournaments()
            all_events.extend(gotsoccer_events)
            
            # Step 3: Scrape US Lacrosse
            uslacrosse_events = self.scrape_us_lacrosse_events()
            all_events.extend(uslacrosse_events)
            
            # Step 4: Scrape Regional tournaments
            regional_events = self.scrape_regional_tournaments()
            all_events.extend(regional_events)
            
            # Step 5: Process events
            if all_events:
                self.process_events(all_events)
            
            # Step 6: Get final stats
            db_stats = self.get_database_stats()
            
            # Step 7: Log summary
            logger.info("🎉 Targeted scraping completed!")
            logger.info("📊 SUMMARY:")
            logger.info(f"   • Total events found: {len(all_events)}")
            logger.info(f"   • Events added: {self.stats['events_added']}")
            logger.info(f"   • Events updated: {self.stats['events_updated']}")
            logger.info(f"   • Both events duplicated: {self.stats['both_events_duplicated']}")
            logger.info(f"   • Errors: {self.stats['errors']}")
            logger.info(f"   • Total in database: {db_stats.get('total_events', 'N/A')}")
            
        except Exception as e:
            logger.error(f"❌ Fatal error in targeted scraping: {e}")
            raise

def main():
    """Main entry point"""
    scraper = TargetedTournamentScraper()
    scraper.run()

if __name__ == "__main__":
    main() 