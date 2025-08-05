# Youth Sports Events Calendar MVP

A comprehensive React-based calendar application for managing youth sports events with advanced filtering, timezone support, and export capabilities.

## Features

- **Multiple View Types**: Month, Week, Day, and List views
- **Advanced Filtering**: Filter by sport, status, location, age group, gender, participants count, date range, organizer, and business
- **Real-time Search**: Search across event names, organizers, and businesses
- **Timezone Support**: Automatically detects user timezone and displays events in both original and local times
- **Export Functionality**: 
  - Individual events to Google Calendar
  - Download .ics files for single events or bulk export
- **Responsive Design**: Mobile-friendly with adaptive layouts
- **Keyboard Shortcuts**: Navigate efficiently with keyboard controls
- **Interactive Modals**: Detailed event information with contact links

## Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Date Handling**: date-fns, date-fns-tz
- **Export**: ics library for calendar file generation

## Setup Instructions

### 1. Install Dependencies

Install Node.js dependencies:

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`.

## Data Format

The application expects events in JSON format with the following structure:

```json
{
  "id": "unique-string-id",
  "name": "Event Name",
  "sport": "Soccer",
  "date": "2024-03-15",
  "time": "10:00",
  "timezone": "America/New_York",
  "status": "scheduled",
  "location": "Central Park Field A",
  "age": "U-12",
  "gender": "Mixed",
  "participants": 24,
  "organizer": "NYC Youth Soccer League",
  "business": "Nike Sports",
  "media": "https://example.com/event",
  "contact1": "john.doe@example.com",
  "contact2": "555-0123",
  "contact3": ""
}
```

## Views and Navigation

### Calendar Views

- **Month View**: Traditional calendar grid with events displayed as tiles
- **Week View**: Seven-day view with detailed event information
- **Day View**: Single day focus with full event details
- **List View**: Sortable table format with export functionality

### Filtering Options

- **Sport**: Dropdown selection of available sports
- **Status**: Filter by event status (scheduled, confirmed, cancelled, etc.)
- **Location**: Text-based location filtering
- **Age Group**: Dropdown selection of age categories
- **Gender**: Filter by gender categories
- **Participants**: Range slider for participant count
- **Date Range**: Start and end date selectors
- **Organizer**: Text-based organizer filtering
- **Business**: Text-based business/sponsor filtering

### Keyboard Shortcuts

- `←/→`: Navigate between time periods
- `T`: Go to today
- `F`: Focus search box
- `Esc`: Close modal or clear focus

## Export Features

### Google Calendar Integration
- Click "Add to Google Calendar" in event modals
- Pre-populated with all event details
- Automatic timezone conversion

### ICS File Downloads
- Download individual events as .ics files
- Bulk export all filtered events from list view
- Compatible with all major calendar applications

## Mobile Responsiveness

- Adaptive layouts for tablets and phones
- Touch-friendly interface
- Collapsible filter drawer on mobile
- List view fallback for small screens in calendar modes

## Timezone Handling

- Automatic detection of user's timezone
- Display format: "10:00 PST (13:00 EST)" when timezones differ
- Accurate conversion for export functionality
- Support for all IANA timezone identifiers

## Development

### Project Structure

```
src/
├── components/           # React components
│   ├── Header.js        # Main header with navigation
│   ├── SearchBox.js     # Search functionality
│   ├── FiltersBar.js    # Advanced filters
│   ├── CalendarNav.js   # Date navigation
│   ├── CalendarGrid.js  # Calendar views
│   ├── ListView.js      # List/table view
│   ├── EventTile.js     # Event display component
│   └── EventModal.js    # Event detail modal
├── utils/               # Utility functions
│   ├── timezone.js      # Timezone conversion
│   └── export.js        # Export functionality
├── data/               # Data files
│   └── events.json     # Event data
├── App.js              # Main application
└── index.js            # Entry point
```

### Adding New Features

1. **New Filter Types**: Add to `FiltersBar.js` and update filter logic in `App.js`
2. **Custom Views**: Create new components and add routes in `App.js`
3. **Export Formats**: Extend `utils/export.js` with new format handlers
4. **Event Fields**: Update event structure in all components and conversion script

## Build and Deploy

```bash
# Create production build
npm run build

# The build folder contains static files ready for deployment
```

## Data Management

Events are stored and managed through Supabase. The application fetches events in real-time and supports:

- Real-time event updates
- Advanced filtering and search
- Export functionality
- Timezone conversion

## Browser Support

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your youth sports organization! 