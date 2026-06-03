import React from 'react';
import { Badge, Card, List, Typography } from 'antd';
import { TrophyOutlined, StarOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Badge as BadgeType } from '../../types';
type BadgesProps = { badges: BadgeType[] };
const { Text } = Typography;
const Badges: React.FC<BadgesProps> = ({ badges }) => (
  <Card title="Achievement Badges" bordered={false}>
    <List
      dataSource={badges}
      renderItem={(item) => (
        <List.Item>
          <Badge
            count={item.iconUrl ? <img src={item.iconUrl} alt="icon" style={{ width: 20 }} /> : null}
            style={{ backgroundColor: '#52c41a' }}
          >
            <div style={{ marginLeft: 16 }}>
              <Text strong>{item.label}</Text>
            </div>
          </Badge>
        </List.Item>
      )}
    />
  </Card>
);
export default Badges;