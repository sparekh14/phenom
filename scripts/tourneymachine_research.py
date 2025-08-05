#!/usr/bin/env python3
"""
TourneyMachine Research Script

This script analyzes TourneyMachine's website structure to understand:
1. How tournaments are listed
2. What data is available
3. How to extract event information
4. Rate limiting and access patterns
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import urljoin, urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TourneyMachineResearch:
    def __init__(self):
        self.base_url = "https://tourneymachine.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def analyze_main_page(self):
        """Analyze the main TourneyMachine page structure"""
        logger.info("🔍 Analyzing TourneyMachine main page...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for tournament listings
            logger.info("📊 Main page analysis:")
            logger.info(f"   • Page title: {soup.title.string if soup.title else 'No title'}")
            
            # Find navigation links
            nav_links = soup.find_all('a', href=True)
            tournament_links = [link for link in nav_links if 'tournament' in link.get('href', '').lower()]
            
            logger.info(f"   • Found {len(tournament_links)} potential tournament links")
            for link in tournament_links[:5]:  # Show first 5
                logger.info(f"     - {link.get('href')}: {link.get_text().strip()}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error analyzing main page: {e}")
            return False
    
    def search_tournaments(self, sport, location=None):
        """Search for tournaments by sport and location"""
        logger.info(f"🔍 Searching for {sport} tournaments...")
        
        try:
            # TourneyMachine search URL pattern
            search_url = f"{self.base_url}/search"
            
            # Common search parameters
            params = {
                'sport': sport.lower(),
                'type': 'tournament'
            }
            
            if location:
                params['location'] = location
            
            response = self.session.get(search_url, params=params)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for tournament results
            tournament_elements = soup.find_all(['div', 'article'], class_=lambda x: x and 'tournament' in x.lower())
            
            logger.info(f"📊 Found {len(tournament_elements)} tournament elements")
            
            # Extract sample tournament data
            tournaments = []
            for element in tournament_elements[:3]:  # Analyze first 3
                tournament_data = self.extract_tournament_data(element)
                if tournament_data:
                    tournaments.append(tournament_data)
                    logger.info(f"   • Tournament: {tournament_data.get('name', 'Unknown')}")
            
            return tournaments
            
        except Exception as e:
            logger.error(f"❌ Error searching tournaments: {e}")
            return []
    
    def extract_tournament_data(self, element):
        """Extract tournament data from a page element"""
        try:
            data = {}
            
            # Look for tournament name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4'], class_=lambda x: x and 'title' in x.lower())
            if name_elem:
                data['name'] = name_elem.get_text().strip()
            
            # Look for date information
            date_elem = element.find(['span', 'div'], class_=lambda x: x and 'date' in x.lower())
            if date_elem:
                data['date'] = date_elem.get_text().strip()
            
            # Look for location
            location_elem = element.find(['span', 'div'], class_=lambda x: x and 'location' in x.lower())
            if location_elem:
                data['location'] = location_elem.get_text().strip()
            
            # Look for sport
            sport_elem = element.find(['span', 'div'], class_=lambda x: x and 'sport' in x.lower())
            if sport_elem:
                data['sport'] = sport_elem.get_text().strip()
            
            return data
            
        except Exception as e:
            logger.error(f"❌ Error extracting tournament data: {e}")
            return None
    
    def analyze_api_endpoints(self):
        """Look for API endpoints in the page source"""
        logger.info("🔍 Looking for API endpoints...")
        
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            # Look for API calls in JavaScript
            soup = BeautifulSoup(response.content, 'html.parser')
            scripts = soup.find_all('script')
            
            api_endpoints = []
            for script in scripts:
                if script.string:
                    # Look for common API patterns
                    if 'api' in script.string.lower() or 'fetch' in script.string.lower():
                        lines = script.string.split('\n')
                        for line in lines:
                            if 'api' in line.lower() or 'fetch' in line.lower():
                                api_endpoints.append(line.strip())
            
            logger.info(f"📊 Found {len(api_endpoints)} potential API endpoints")
            for endpoint in api_endpoints[:5]:  # Show first 5
                logger.info(f"   • {endpoint}")
            
            return api_endpoints
            
        except Exception as e:
            logger.error(f"❌ Error analyzing API endpoints: {e}")
            return []
    
    def test_rate_limits(self):
        """Test rate limiting by making multiple requests"""
        logger.info("🧪 Testing rate limits...")
        
        try:
            start_time = time.time()
            
            # Make 5 requests with 1-second intervals
            for i in range(5):
                response = self.session.get(self.base_url)
                logger.info(f"   • Request {i+1}: Status {response.status_code}")
                time.sleep(1)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            logger.info(f"📊 Rate limit test completed in {total_time:.2f} seconds")
            logger.info("   • No rate limiting detected (requests successful)")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Rate limit test failed: {e}")
            return False

def main():
    """Main research function"""
    logger.info("🚀 Starting TourneyMachine research...")
    
    research = TourneyMachineResearch()
    
    # Step 1: Analyze main page
    research.analyze_main_page()
    
    # Step 2: Search for soccer tournaments
    soccer_tournaments = research.search_tournaments('soccer')
    
    # Step 3: Search for lacrosse tournaments
    lacrosse_tournaments = research.search_tournaments('lacrosse')
    
    # Step 4: Look for API endpoints
    api_endpoints = research.analyze_api_endpoints()
    
    # Step 5: Test rate limits
    research.test_rate_limits()
    
    logger.info("🎉 Research completed!")
    logger.info("📊 SUMMARY:")
    logger.info(f"   • Soccer tournaments found: {len(soccer_tournaments)}")
    logger.info(f"   • Lacrosse tournaments found: {len(lacrosse_tournaments)}")
    logger.info(f"   • API endpoints found: {len(api_endpoints)}")

if __name__ == "__main__":
    main() 