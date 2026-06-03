import { Layout, Dropdown, Avatar, Badge } from 'antd';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header } = Layout;

const items: MenuProps['items'] = [
  {
    key: '1',
    label: 'Profile',
  },
  {
    key: '2',
    label: 'Settings',
  },
  {
    key: '3',
    label: 'Logout',
  },
];

export default function AppHeader() {
  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff' }}>
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Complex System</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Badge count={5}>
          <BellOutlined style={{ fontSize: '18px' }} />
        </Badge>
        <Badge count={2}>
          <MailOutlined style={{ fontSize: '18px' }} />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}>U</Avatar>
        </Dropdown>
      </div>
    </Header>
  );
}