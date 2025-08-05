#!/usr/bin/env python3
"""
Comprehensive Tournament Sources Research

This script researches multiple tournament platforms to find the best sources for:
1. Soccer tournaments
2. Lacrosse tournaments
3. Real event data with complete information
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

class TournamentSourcesResearch:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Define tournament sources to research
        self.sources = {
            'soccer': [
                'https://www.gotsoccer.com/',
                'https://www.usyouthsoccer.org/',
                'https://www.usclubsoccer.org/',
                'https://www.tourneycentral.com/',
                'https://www.soccerwire.com/'
            ],
            'lacrosse': [
                'https://www.uslacrosse.org/',
                'https://www.insidelacrosse.com/',
                'https://www.laxpower.com/',
                'https://www.lacrosseplayground.com/'
            ]
        }
    
    def research_source(self, url, sport):
        """Research a specific tournament source"""
        logger.info(f"🔍 Researching {sport} source: {url}")
        
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Analyze page structure
            analysis = {
                'url': url,
                'sport': sport,
                'status': 'success',
                'title': soup.title.string if soup.title else 'No title',
                'tournament_links': [],
                'api_endpoints': [],
                'data_structure': {}
            }
            
            # Look for tournament-related links
            links = soup.find_all('a', href=True)
            tournament_links = []
            
            for link in links:
                href = link.get('href', '').lower()
                text = link.get_text().strip().lower()
                
                # Look for tournament-related keywords
                if any(keyword in href or keyword in text for keyword in ['tournament', 'event', 'schedule', 'calendar']):
                    tournament_links.append({
                        'text': link.get_text().strip(),
                        'href': link.get('href'),
                        'full_url': urljoin(url, link.get('href'))
                    })
            
            analysis['tournament_links'] = tournament_links[:10]  # Limit to first 10
            
            # Look for API endpoints in JavaScript
            scripts = soup.find_all('script')
            api_endpoints = []
            
            for script in scripts:
                if script.string:
                    lines = script.string.split('\n')
                    for line in lines:
                        if any(keyword in line.lower() for keyword in ['api', 'fetch', 'ajax', 'json']):
                            api_endpoints.append(line.strip())
            
            analysis['api_endpoints'] = api_endpoints[:5]  # Limit to first 5
            
            logger.info(f"   ✅ Found {len(tournament_links)} tournament links")
            logger.info(f"   ✅ Found {len(api_endpoints)} potential API endpoints")
            
            return analysis
            
        except Exception as e:
            logger.error(f"   ❌ Error researching {url}: {e}")
            return {
                'url': url,
                'sport': sport,
                'status': 'error',
                'error': str(e)
            }
    
    def research_all_sources(self):
        """Research all tournament sources"""
        logger.info("🚀 Starting comprehensive tournament sources research...")
        
        all_results = {}
        
        for sport, sources in self.sources.items():
            logger.info(f"\n🏈 Researching {sport.upper()} sources...")
            sport_results = []
            
            for source in sources:
                result = self.research_source(source, sport)
                sport_results.append(result)
                time.sleep(2)  # Be respectful with requests
            
            all_results[sport] = sport_results
        
        return all_results
    
    def analyze_results(self, results):
        """Analyze research results and recommend best sources"""
        logger.info("\n📊 Analyzing research results...")
        
        recommendations = {
            'soccer': [],
            'lacrosse': []
        }
        
        for sport, sources in results.items():
            logger.info(f"\n🏈 {sport.upper()} SOURCES ANALYSIS:")
            
            for source in sources:
                if source['status'] == 'success':
                    score = 0
                    reasons = []
                    
                    # Score based on tournament links found
                    if len(source['tournament_links']) > 0:
                        score += len(source['tournament_links']) * 2
                        reasons.append(f"Found {len(source['tournament_links'])} tournament links")
                    
                    # Score based on API endpoints found
                    if len(source['api_endpoints']) > 0:
                        score += len(source['api_endpoints']) * 5
                        reasons.append(f"Found {len(source['api_endpoints'])} API endpoints")
                    
                    # Score based on page structure
                    if 'tournament' in source['title'].lower():
                        score += 3
                        reasons.append("Tournament-focused content")
                    
                    if score > 0:
                        recommendations[sport].append({
                            'url': source['url'],
                            'score': score,
                            'reasons': reasons,
                            'tournament_links': source['tournament_links'][:3]  # Show first 3
                        })
                        
                        logger.info(f"   • {source['url']}: Score {score}")
                        for reason in reasons:
                            logger.info(f"     - {reason}")
        
        return recommendations
    
    def test_specific_sources(self, recommendations):
        """Test the best sources with specific searches"""
        logger.info("\n🧪 Testing best sources with specific searches...")
        
        test_results = {}
        
        for sport, sources in recommendations.items():
            if not sources:
                continue
                
            logger.info(f"\n🏈 Testing {sport} sources...")
            
            # Test the top 2 sources for each sport
            for source in sources[:2]:
                logger.info(f"   🔍 Testing: {source['url']}")
                
                # Try to find specific tournament data
                test_result = self.test_source_for_tournaments(source['url'], sport)
                test_results[source['url']] = test_result
        
        return test_results
    
    def test_source_for_tournaments(self, url, sport):
        """Test a specific source for tournament data"""
        try:
            # Try different search patterns
            search_patterns = [
                f"{url}",
                f"{url}tournaments",
                f"{url}events",
                f"{url}schedule",
                f"{url}calendar"
            ]
            
            for pattern in search_patterns:
                try:
                    response = self.session.get(pattern, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Look for tournament data
                        tournament_data = self.extract_tournament_data_from_page(soup)
                        
                        if tournament_data:
                            return {
                                'url': pattern,
                                'status': 'success',
                                'tournaments_found': len(tournament_data),
                                'sample_data': tournament_data[:2]  # Show first 2
                            }
                
                except Exception as e:
                    continue
            
            return {
                'url': url,
                'status': 'no_data_found'
            }
            
        except Exception as e:
            return {
                'url': url,
                'status': 'error',
                'error': str(e)
            }
    
    def extract_tournament_data_from_page(self, soup):
        """Extract tournament data from a page"""
        tournaments = []
        
        # Look for common tournament data patterns
        tournament_elements = soup.find_all(['div', 'article', 'section'], 
                                          class_=lambda x: x and any(keyword in x.lower() 
                                          for keyword in ['tournament', 'event', 'game', 'match']))
        
        for element in tournament_elements[:5]:  # Limit to first 5
            tournament = {}
            
            # Extract name
            name_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5'])
            if name_elem:
                tournament['name'] = name_elem.get_text().strip()
            
            # Extract date
            date_elem = element.find(['span', 'div', 'time'], 
                                   class_=lambda x: x and any(keyword in x.lower() 
                                   for keyword in ['date', 'time', 'when']))
            if date_elem:
                tournament['date'] = date_elem.get_text().strip()
            
            # Extract location
            location_elem = element.find(['span', 'div'], 
                                       class_=lambda x: x and any(keyword in x.lower() 
                                       for keyword in ['location', 'venue', 'where']))
            if location_elem:
                tournament['location'] = location_elem.get_text().strip()
            
            if tournament.get('name'):  # Only include if we found a name
                tournaments.append(tournament)
        
        return tournaments

def main():
    """Main research function"""
    logger.info("🚀 Starting comprehensive tournament sources research...")
    
    research = TournamentSourcesResearch()
    
    # Step 1: Research all sources
    results = research.research_all_sources()
    
    # Step 2: Analyze results
    recommendations = research.analyze_results(results)
    
    # Step 3: Test best sources
    test_results = research.test_specific_sources(recommendations)
    
    # Step 4: Summary
    logger.info("\n🎉 RESEARCH COMPLETED!")
    logger.info("📊 FINAL RECOMMENDATIONS:")
    
    for sport, sources in recommendations.items():
        logger.info(f"\n🏈 {sport.upper()} - Best Sources:")
        for source in sources[:3]:  # Top 3
            logger.info(f"   • {source['url']} (Score: {source['score']})")
            for reason in source['reasons']:
                logger.info(f"     - {reason}")

if __name__ == "__main__":
    main() 