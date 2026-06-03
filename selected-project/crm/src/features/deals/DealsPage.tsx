import { Button, Card, Col, Row, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DealColumn from './DealColumn';
import './DealsPage.css';

const { Title } = Typography;

const dealStages = [
  { id: '1', title: 'Lead', color: '#8e44ad' },
  { id: '2', title: 'Qualified', color: '#3498db' },
  { id: '3', title: 'Proposal', color: '#f39c12' },
  { id: '4', title: 'Negotiation', color: '#e74c3c' },
  { id: '5', title: 'Closed Won', color: '#2ecc71' },
];

const DealsPage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4}>Deals Pipeline</Title>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => alert('Add Deal clicked!')}>
                Add Deal
              </Button>
            </Col>
          </Row>
        </div>
        <div className="deal-board">
          <Row gutter={16}>
            {dealStages.map((stage) => (
              <Col key={stage.id} span={4}>
                <DealColumn stage={stage} />
              </Col>
            ))}
          </Row>
        </div>
      </Card>
    </DndProvider>
  );
};

export default DealsPage;