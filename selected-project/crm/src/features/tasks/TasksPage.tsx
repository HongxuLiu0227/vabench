import { Button, Card, DatePicker, List, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './TasksPage.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface TaskType {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

const data: TaskType[] = [
  {
    id: '1',
    title: 'Follow up with client',
    description: 'Discuss project requirements',
    dueDate: '2023-06-15',
    completed: false,
  },
  {
    id: '2',
    title: 'Prepare proposal',
    description: 'Create sales proposal for new client',
    dueDate: '2023-06-20',
    completed: false,
  },
  {
    id: '3',
    title: 'Team meeting',
    description: 'Weekly team sync',
    dueDate: '2023-06-10',
    completed: true,
  },
];

const TasksPage = () => {
  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Tasks</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <RangePicker style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => alert('Add Task clicked!')}>
            Add Task
          </Button>
        </div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => alert(`Edit task: ${item.title}`)}>Edit</Button>,
              <Button type="link" danger onClick={() => alert(`Delete task: ${item.title}`)}>
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={item.description}
            />
            <div>{item.dueDate}</div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TasksPage;