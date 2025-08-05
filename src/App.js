import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CalendarNav from './components/CalendarNav';
import CalendarGrid from './components/CalendarGrid';
import ListView from './components/ListView';
import EventModal from './components/EventModal';
import { getUserTimezone } from './utils/timezone';
import { fetchEvents, subscribeToEvents } from './lib/supabase';
import './index.css';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userTimezone] = useState(getUserTimezone());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync currentView with current route
  useEffect(() => {
    const pathToView = {
      '/month': 'month',
      '/week': 'week', 
      '/day': 'day',
      '/list': 'list'
    };
    const viewFromPath = pathToView[location.pathname];
    if (viewFromPath && viewFromPath !== currentView) {
      setCurrentView(viewFromPath);
    }
  }, [location.pathname, currentView]);

  // Load events from Supabase
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    // Set up real-time subscription
    const subscription = subscribeToEvents((payload) => {
      // Reload events when data changes
      loadEvents();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sport: '',
    location: '',
    age: '',
    gender: '',
    eventType: '',
    dateRange: { start: null, end: null }
  });

  // Apply filters and search
  const applyFilters = useCallback(() => {
    let filtered = events.filter(event => {
      // Ensure all relevant event properties are strings
      const eventName = (event.name || '').toString();
      const eventLocation = (event.location || '').toString();

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !eventName.toLowerCase().includes(query) &&
          !eventLocation.toLowerCase().includes(query) &&
          !(event.sport || '').toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Individual filters
      if (filters.sport && event.sport !== filters.sport) return false;
      if (filters.location && !eventLocation.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.age && event.age !== filters.age) return false;
      if (filters.gender && event.gender !== filters.gender) return false;
      if (filters.eventType && event.event_type !== filters.eventType) return false;

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const eventDate = new Date(event.start_date);
        if (filters.dateRange.start && eventDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && eventDate > filters.dateRange.end) return false;
      }

      return true;
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const navigateDate = useCallback((direction) => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + direction);
        break;
      default:
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // Only handle shortcuts when modal is not open and not typing in input
      if (isModalOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape' && isModalOpen) {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          navigateDate(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateDate(1);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          setCurrentDate(new Date());
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          const searchInput = document.querySelector('input[type="text"]');
          if (searchInput) searchInput.focus();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isModalOpen, currentView, navigateDate]);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date) => {
    setCurrentView('day');
    setCurrentDate(date);
    navigate('/day');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        events={events}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-none">
        <CalendarNav
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          currentView={currentView}
          goToToday={goToToday}
          navigateDate={navigateDate}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <Routes>
          <Route path="/" element={<Navigate to="/month" replace />} />
          <Route 
            path="/month" 
            element={
              <CalendarGrid
                view="month"
                events={filteredEvents}
                currentDate={currentDate}
                timezone={userTimezone}
                onEventClick={openEventModal}
                onDayClick={handleDayClick}
              />
            } 
          />
          <Route 
            path="/week" 
            element={
              <CalendarGrid
                view="week"
                events={filteredEvents}
                currentDate={currentDate}
                timezone={userTimezone}
                onEventClick={openEventModal}
                onDayClick={handleDayClick}
              />
            } 
          />
          <Route 
            path="/day" 
            element={
              <CalendarGrid
                view="day"
                events={filteredEvents}
                currentDate={currentDate}
                timezone={userTimezone}
                onEventClick={openEventModal}
                onDayClick={handleDayClick}
              />
            } 
          />
          <Route 
            path="/list" 
            element={
              <ListView
                events={filteredEvents}
                timezone={userTimezone}
                onEventClick={openEventModal}
              />
            } 
          />
        </Routes>
        )}
        
        {isModalOpen && selectedEvent && (
          <EventModal
            event={selectedEvent}
            timezone={userTimezone}
            onClose={closeEventModal}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 