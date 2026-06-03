import { Card, Row, Col, List, Tag, Progress, Button, Input, Avatar } from 'antd';
import { Comment } from '@ant-design/compatible';
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function ProjectsPage() {
  const projects = [
    {
      title: 'Website Redesign',
      status: 'active',
      progress: 65,
      dueDate: '2023-12-15',
      team: ['John', 'Jane', 'Mike'],
    },
    {
      title: 'Mobile App Development',
      status: 'on-hold',
      progress: 30,
      dueDate: '2024-02-20',
      team: ['Sarah', 'Alex', 'Emily'],
    },
    {
      title: 'Marketing Campaign',
      status: 'completed',
      progress: 100,
      dueDate: '2023-10-30',
      team: ['David', 'Lisa', 'Tom'],
    },
  ];

  const tasks = [
    { id: 1, title: 'Design homepage layout', status: 'done', project: 'Website Redesign' },
    { id: 2, title: 'Implement user authentication', status: 'in-progress', project: 'Mobile App Development' },
    { id: 3, title: 'Create social media content', status: 'todo', project: 'Marketing Campaign' },
    { id: 4, title: 'Optimize database queries', status: 'in-progress', project: 'Website Redesign' },
  ];

  const comments = [
    {
      author: 'Jane Smith',
      avatar: 'J',
      content: 'The design mockups look great! Just a few minor tweaks needed.',
      datetime: '2 hours ago',
    },
    {
      author: 'Mike Johnson',
      avatar: 'M',
      content: 'I\'ve pushed the latest changes to the staging environment.',
      datetime: '1 day ago',
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        {projects.map((project, index) => (
          <Col span={8} key={index}>
            <Card 
              title={project.title} 
              extra={<Tag color={project.status === 'active' ? 'blue' : project.status === 'completed' ? 'green' : 'orange'}>
                {project.status}
              </Tag>}
            >
              <div style={{ marginBottom: '16px' }}>
                <Progress percent={project.progress} status={project.status === 'completed' ? 'success' : 'active'} />
              </div>
              <div style={{ marginBottom: '8px' }}>Due: {project.dueDate}</div>
              <div>Team: {project.team.join(', ')}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Tasks">
            <List
              dataSource={tasks}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.status === 'done' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#faad14' }} />}
                    title={item.title}
                    description={item.project}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Team Discussion">
            <Comment
              avatar={<Avatar icon={<UserOutlined />} />}
              content={<TextArea rows={4} placeholder="Add a comment..." />}
            />
            <Button type="primary" icon={<MessageOutlined />} style={{ marginTop: '8px' }}>
              Post Comment
            </Button>
            <div style={{ marginTop: '24px' }}>
              {comments.map((comment, index) => (
                <Comment
                  key={index}
                  author={comment.author}
                  avatar={<Avatar>{comment.avatar}</Avatar>}
                  content={comment.content}
                  datetime={comment.datetime}
                />
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}