import { useState, useEffect } from 'react';
import { Event } from '../data/events';

export const useCalendarEvents = (initialDate: Date = new Date()) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data would normally come from an API
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Team Meeting',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 10, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 11, 30),
            color: '#1890ff',
            description: 'Quarterly planning session'
          },
          {
            id: '2',
            title: 'Client Call',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16, 14, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16, 15, 0),
            color: '#52c41a',
            description: 'Discuss project requirements'
          },
          {
            id: '3',
            title: 'Code Review',
            start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17, 16, 0),
            end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 17, 17, 0),
            color: '#faad14',
            description: 'Review PR #1234'
          }
        ];
        
        setEvents(mockEvents);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

  const addEvent = (newEvent: Omit<Event, 'id'>) => {
    const eventWithId = {
      ...newEvent,
      id: Math.random().toString(36).substring(2, 9)
    };
    setEvents([...events, eventWithId]);
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  return {
    events,
    loading,
    error,
    currentDate,
    setCurrentDate,
    addEvent,
    updateEvent,
    deleteEvent
  };
};
