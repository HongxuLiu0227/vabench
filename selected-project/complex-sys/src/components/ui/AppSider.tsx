import { Layout, Menu } from 'antd';
import { DashboardOutlined, UserOutlined, LineChartOutlined, ProjectOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export default function AppSider() {
  const navigate = useNavigate();
  
  return (
    <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
        items={[
          {
            key: '1',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/')
          },
          {
            key: '2',
            icon: <UserOutlined />,
            label: 'Profile',
            onClick: () => navigate('/profile')
          },
          {
            key: '3',
            icon: <LineChartOutlined />,
            label: 'Analytics',
            onClick: () => navigate('/analytics')
          },
          {
            key: '4',
            icon: <ProjectOutlined />,
            label: 'Projects',
            onClick: () => navigate('/projects')
          },
          {
            key: '5',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => navigate('/settings')
          },
        ]}
      />
    </Sider>
  );
}