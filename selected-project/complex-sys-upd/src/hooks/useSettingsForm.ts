import { useState, useEffect } from 'react';
import { notification } from 'antd';
import { updateUserSettings } from '../services/userService';

type SettingsFormValues = {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
};

export const useSettingsForm = (initialValues: SettingsFormValues) => {
  const [formValues, setFormValues] = useState<SettingsFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [api] = notification.useNotification();

  const handleChange = (field: keyof SettingsFormValues, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type: keyof SettingsFormValues['notifications'], checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateUserSettings(formValues);
      api.success({
        message: 'Settings Saved',
        description: 'Your preferences have been updated successfully.'
      });
    } catch (error) {
      api.error({
        message: 'Save Failed',
        description: 'There was an error saving your settings. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Load initial settings from API or localStorage
    const loadSettings = async () => {
      // In a real app, you would fetch these from an API
      const defaultSettings: SettingsFormValues = {
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        language: 'en-US',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      setFormValues(defaultSettings);
    };

    loadSettings();
  }, []);

  return {
    formValues,
    isSubmitting,
    handleChange,
    handleNotificationChange,
    handleSubmit
  };
};