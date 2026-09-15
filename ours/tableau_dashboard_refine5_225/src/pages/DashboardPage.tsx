import React from 'react';
import { useData } from '../hooks/useData';
import { Dashboard } from '../components/Dashboard';
import { LoadingSpinner, ErrorMessage } from '../components/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { data, loading, error } = useData();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data) {
    return <ErrorMessage error={new Error('No data available')} />;
  }

  return <Dashboard data={data} />;
};
