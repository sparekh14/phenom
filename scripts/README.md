# Tournament Automation Scripts

This directory contains the automation scripts for the Phenom Events tournament system.

## Files

### `hybrid_tournament_system.py` (MAIN SCRIPT)
The primary automation script that combines multiple approaches for comprehensive tournament discovery:

**Features:**
- **Manual Tournament Data**: Pre-defined real tournaments with complete information
- **Web Scraping**: Attempts to scrape known tournament sources
- **Gemini AI Enhancement**: Uses AI to fill missing data fields
- **Database Integration**: Adds/updates events in Supabase
- **"Both" Gender Duplication**: Automatically creates separate Boys/Girls events
- **Duplicate Prevention**: Checks for existing events before adding

**Real Tournament Data Included:**
- **Soccer**: US Youth Soccer National Championships, US Club Soccer National Cup, GotSoccer Tournament Series
- **Lacrosse**: US Lacrosse National Tournament, Inside Lacrosse Recruiting Tournament
- **Regional**: Maryland, Virginia, Pennsylvania State Cups

### `gemini_event_discovery.py` (LEGACY)
The original Gemini-based event discovery script (kept for reference).

## How It Works

1. **Manual Data Entry**: Starts with known, verified tournament information
2. **Web Scraping**: Attempts to find additional tournaments from known sources
3. **AI Enhancement**: Uses Gemini to fill missing fields (age, gender, event_type, website)
4. **Database Processing**: Validates and adds events to Supabase
5. **Gender Duplication**: Creates separate Boys/Girls events for "Both" gender events

## Environment Variables

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `GEMINI_API_KEY`: Your Google Gemini API key

## Local Testing

```bash
cd scripts
python hybrid_tournament_system.py
```

## GitHub Actions Integration

The script runs automatically via GitHub Actions:
- **Schedule**: Daily at 6:00 AM UTC
- **Manual Trigger**: Available with test mode option
- **Logging**: Comprehensive logs saved as artifacts

## Results

The system successfully adds **real tournament data** with:
- ✅ Complete event information
- ✅ Proper date formatting
- ✅ Sport categorization
- ✅ Age group specification
- ✅ Gender separation (Boys/Girls)
- ✅ Event type classification
- ✅ Website links
- ✅ Duplicate prevention

## Cost Analysis

- **Supabase**: Free tier (50,000 monthly active users)
- **GitHub Actions**: Free tier (2,000 minutes/month)
- **Gemini API**: ~$1.50/month for daily runs
- **Total**: Less than $2/month for full automation

## Future Enhancements

1. **Additional Tournament Sources**: More regional and national tournaments
2. **Advanced Scraping**: Better web scraping for dynamic content
3. **Data Validation**: Enhanced validation and error handling
4. **Real-time Updates**: More frequent updates for time-sensitive events 