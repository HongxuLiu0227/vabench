import { useState, useEffect } from 'react';
import { TimelineEvent } from '../../data/timelineData';

export const useTimelineEvents = (initialEvents: TimelineEvent[]) => {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addEvent = (newEvent: TimelineEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updatedEvent: Partial<TimelineEvent>) => {
    setEvents(prev =>
      prev.map(event => (event.id === id ? { ...event, ...updatedEvent } : event))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setEvents(initialEvents);
    } catch (err) {
      setError('Failed to fetch timeline events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};
