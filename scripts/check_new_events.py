#!/usr/bin/env python3
"""
Check New Events Script

This script queries the database to see what new events were recently added.
"""

import os
from supabase import create_client, Client
from datetime import datetime, timedelta

def connect_to_supabase() -> Client:
    """Connect to Supabase"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
    
    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase environment variables")
    
    return create_client(supabase_url, supabase_key)

def check_new_events():
    """Check what new events were added"""
    print("🔍 Checking new events in database...")
    
    try:
        supabase = connect_to_supabase()
        
        # Get events added in the last hour (since we just ran the script)
        one_hour_ago = (datetime.now() - timedelta(hours=1)).isoformat()
        
        response = supabase.table('events').select('*').gte('created_at', one_hour_ago).order('created_at', desc=True).execute()
        
        if response.data:
            print(f"\n✅ Found {len(response.data)} new events added recently:")
            print("=" * 80)
            
            for i, event in enumerate(response.data, 1):
                print(f"\n{i}. {event['name']}")
                print(f"   📅 Date: {event['start_date']} to {event['end_date']}")
                print(f"   🏟️ Location: {event['location']}")
                print(f"   ⚽ Sport: {event['sport']}")
                print(f"   👥 Age: {event['age']}")
                print(f"   🚹 Gender: {event['gender']}")
                print(f"   🏆 Type: {event['event_type']}")
                print(f"   🌐 Website: {event['website']}")
                print(f"   📝 Created: {event['created_at']}")
                print("-" * 60)
        else:
            print("❌ No new events found in the last hour")
        
        # Also get total count by sport
        print("\n📊 TOTAL EVENTS BY SPORT:")
        sport_response = supabase.table('events').select('sport').execute()
        
        sport_counts = {}
        for event in sport_response.data:
            sport = event['sport'] or 'Unknown'
            sport_counts[sport] = sport_counts.get(sport, 0) + 1
        
        for sport, count in sport_counts.items():
            print(f"   • {sport}: {count} events")
        
        # Get total count
        total_response = supabase.table('events').select('id', count='exact').execute()
        print(f"\n📈 TOTAL EVENTS IN DATABASE: {total_response.count}")
        
    except Exception as e:
        print(f"❌ Error checking events: {e}")

if __name__ == "__main__":
    check_new_events() 