import { useState, useEffect } from 'react';

export const useForm = (initialValues: any) => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  return {
    values,
    handleChange,
  };
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (notification: any) => {
    setNotifications([...notifications, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};

export const useChartData = (initialData: any) => {
  const [data, setData] = useState(initialData);

  const updateData = (newData: any) => {
    setData(newData);
  };

  return {
    data,
    updateData,
  };
};

export const useTable = (initialData: any[]) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    setData,
  };
};

export const useCalendarEvents = (initialEvents: any[]) => {
  const [events, setEvents] = useState(initialEvents);

  const addEvent = (event: any) => {
    setEvents([...events, event]);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return {
    events,
    addEvent,
    removeEvent,
  };
};