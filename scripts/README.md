# Event Discovery Automation

This directory contains the automation scripts for discovering and updating youth sports events.

## Files

### `daily_event_discovery.py`
The main automation script that:
- Connects to Supabase database
- Discovers new events (placeholder for Gemini API)
- Validates and processes events
- Updates the database
- Logs all activities

## How It Works

### 1. Daily Execution
- **GitHub Actions** runs this script daily at 6:00 AM UTC
- **Manual trigger** available via GitHub Actions UI
- **Test mode** option for safe testing

### 2. Event Processing
1. **Discovery**: Find new events (currently placeholder)
2. **Validation**: Check required fields and date formats
3. **Duplicate Check**: Avoid adding existing events
4. **Database Update**: Add new events or update existing ones
5. **Logging**: Record all activities and statistics

### 3. Database Operations
- **Add Events**: Insert new events with auto-generated IDs
- **Update Events**: Modify existing events with new information
- **Duplicate Prevention**: Uses (name, start_date, location) as unique key

## Environment Variables

The script requires these environment variables:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Local Testing

To test the script locally:

```bash
# Set environment variables
export SUPABASE_URL="your_url"
export SUPABASE_SERVICE_KEY="your_key"

# Run the script
cd scripts
python daily_event_discovery.py
```

## Logging

The script creates detailed logs:
- **Console output**: Real-time progress
- **File log**: `event_discovery.log` for detailed history
- **GitHub Actions**: Uploaded as artifacts

## Future Enhancements

### Gemini API Integration
The `discover_events()` method is ready for Gemini API integration:

```python
def discover_events(self) -> List[Dict]:
    # TODO: Integrate with Gemini API
    # - Search for youth sports events
    # - Extract event details
    # - Return structured event data
    pass
```

### Additional Features
- **Email notifications** for new events
- **Event website validation**
- **Geographic filtering**
- **Sport-specific discovery**

## Monitoring

Check the automation status:
1. **GitHub Actions**: View workflow runs
2. **Supabase Dashboard**: Monitor database changes
3. **Logs**: Review detailed execution logs 