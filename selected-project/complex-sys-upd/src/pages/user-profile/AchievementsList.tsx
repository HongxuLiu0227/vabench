import React from 'react';
import { TrophyOutlined, StarOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Card, List, Tag } from 'antd';
import type { Achievement } from '../../types';
type AchievementsListProps = { achievements: Achievement[] };
const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => (
  <Card title="Achievements">
    <List
      itemLayout="horizontal"
      dataSource={achievements}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.title}
            description={<>
              <div>{item.date}</div>
            </>}
          />
        </List.Item>
      )}
    />
  </Card>
);
export default AchievementsList;