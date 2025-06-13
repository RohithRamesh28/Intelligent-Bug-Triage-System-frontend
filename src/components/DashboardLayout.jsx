import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  FolderOpenOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;

function DashboardLayout({ children }) {
  const [hovering, setHovering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('project_id');
    navigate('/');
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'settings') {
      navigate('/settings');
    } else {
      navigate(`/${key}`);
    }
  };

  // Map location.pathname to current menu key
  const currentPath = location.pathname;
  const currentPage = currentPath.startsWith('/profile')
    ? 'profile'
    : currentPath.startsWith('/uploads') && !currentPath.startsWith('/my-uploads')
    ? 'uploads'
    : currentPath.startsWith('/my-uploads')
    ? 'my-uploads'
    : currentPath.startsWith('/dashboard')
    ? 'dashboard'
    : currentPath.startsWith('/settings')
    ? 'settings'
    : ''; // fallback

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsed={!hovering}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        width={200}
        collapsedWidth={80}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start', 
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <div style={{ color: 'white', padding: 16, textAlign: 'center', fontWeight: 'bold' }}>
            Bug Triage
          </div>
<Menu
  theme="dark"
  mode="inline"
  selectedKeys={[currentPage]}
  onClick={handleMenuClick}
  style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
  items={[
    {
      type: 'group',
      label: '',
      children: [
        { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
        { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: 'uploads', icon: <UploadOutlined />, label: 'Uploads' },
        { key: 'my-uploads', icon: <FolderOpenOutlined />, label: 'My Uploads' },
      ],
    },
    {
      type: 'group',
      label: '',
      children: [
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
      ],
    },
  ]}
/>
</div>
      </Sider>
      <Layout style={{ marginLeft: hovering ? 200 : 80, transition: 'margin-left 0.2s' }}>
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;
