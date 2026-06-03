import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

type KpiCardProps = {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
};

const KpiCards: React.FC = () => {
  const kpiData: KpiCardProps[] = [
    {
      title: 'Monthly Revenue',
      value: '$48,290',
      change: 12.5,
      icon: <ArrowUpOutlined />
    },
    {
      title: 'Active Users',
      value: '1,429',
      change: 8.2,
      icon: <ArrowUpOutlined />
    },
    {
      title: 'Task Completion',
      value: '83%',
      change: -2.4,
      icon: <ArrowDownOutlined />
    },
    {
      title: 'Support Tickets',
      value: '127',
      change: 5.7,
      icon: <ArrowUpOutlined />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <Card key={index} className="shadow-md">
          <Statistic
            title={kpi.title}
            value={kpi.value}
            precision={kpi.title === 'Task Completion' ? 0 : 2}
            valueStyle={{ color: kpi.change >= 0 ? '#3f8600' : '#cf1322' }}
            prefix={kpi.icon}
            suffix={kpi.change >= 0 ? `+${kpi.change}%` : `${kpi.change}%`}
          />
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;