import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

type KPICardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
};

export const KPICard: React.FC<KPICardProps> = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color={isPositive ? 'success.main' : 'error.main'}>
          {isPositive ? '+' : ''}{change}% from last month
        </Typography>
        {icon}
      </CardContent>
    </Card>
  );
};