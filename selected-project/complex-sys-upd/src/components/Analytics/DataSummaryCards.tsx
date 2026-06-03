import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  icon: React.ReactNode;
};

export const DataSummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
}) => {
  const trendColor = trend >= 0 ? 'success.main' : 'error.main';
  const trendText = trend >= 0 ? `+${trend}%` : `${trend}%`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <div>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </div>
          {icon}
        </Box>
        <Typography variant="caption" color={trendColor} sx={{ mt: 1 }}>
          {trendText} vs previous period
        </Typography>
      </CardContent>
    </Card>
  );
};