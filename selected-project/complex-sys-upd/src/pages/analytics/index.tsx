import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Select } from 'antd';
import { LineChart, BarChart, PieChart } from '../../components/AnalyticsComponents';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import './analytics.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('sessions');
  const [exportLoading, setExportLoading] = useState(false);
  const { data, loading, fetchData } = useAnalyticsData();

  useEffect(() => {
    fetchData(dateRange, selectedMetric);
  }, [dateRange, selectedMetric]);

  const handleExport = () => {
    setExportLoading(true);
    // Simulate export
    setTimeout(() => {
      setExportLoading(false);
    }, 1500);
  };

  const metrics = [
    { label: 'Sessions', value: 'sessions' },
    { label: 'Users', value: 'users' },
    { label: 'Page Views', value: 'pageViews' },
    { label: 'Bounce Rate', value: 'bounceRate' },
  ];

  const tableColumns = [
    { title: 'Page', dataIndex: 'page', key: 'page' },
    { title: 'Sessions', dataIndex: 'sessions', key: 'sessions' },
    { title: 'Users', dataIndex: 'users', key: 'users' },
    { title: 'Avg. Duration', dataIndex: 'avgDuration', key: 'avgDuration' },
    { title: 'Bounce Rate', dataIndex: 'bounceRate', key: 'bounceRate' },
  ];

  return (
    <div className="analytics-page">
      <Row gutter={[16, 16]} className="filters-row">
        <Col span={12}>
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={8}>
          <Select
            value={selectedMetric}
            onChange={setSelectedMetric}
            style={{ width: '100%' }}
          >
            {metrics.map((metric) => (
              <Option key={metric.value} value={metric.value}>
                {metric.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Button
            type="primary"
            loading={exportLoading}
            onClick={handleExport}
            block
          >
            Export Data
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="summary-cards">
        <Col span={6}>
          <Card title="Total Sessions" loading={loading}>
            <h2>{data?.summary?.sessions || '--'}</h2>
            <p>12% increase from last period</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Unique Users" loading={loading}>
            <h2>{data?.summary?.users || '--'}</h2>
            <p>8% increase from last period</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Avg. Session Duration" loading={loading}>
            <h2>{data?.summary?.avgDuration || '--'} min</h2>
            <p>2% decrease from last period</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Bounce Rate" loading={loading}>
            <h2>{data?.summary?.bounceRate || '--'}%</h2>
            <p>5% improvement from last period</p>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col span={12}>
          <Card title="Sessions Over Time" loading={loading}>
            <LineChart
              data={data?.trends || []}
              xField="date"
              yField="sessions"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Traffic Sources" loading={loading}>
            <PieChart
              data={data?.sources || []}
              angleField="value"
              colorField="name"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="charts-row">
        <Col span={12}>
          <Card title="Top Pages by Engagement" loading={loading}>
            <BarChart
              data={data?.topPages || []}
              xField="page"
              yField="engagement"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Device Distribution" loading={loading}>
            <BarChart
              data={data?.devices || []}
              xField="device"
              yField="percentage"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Page Performance" loading={loading} className="page-table">
        <Table
          columns={tableColumns}
          dataSource={data?.pages || []}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default AnalyticsPage;