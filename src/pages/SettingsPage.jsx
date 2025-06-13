import { Card, Switch, Typography } from 'antd';

const { Title } = Typography;

function SettingsPage({ onThemeChange, isDarkMode }) {
  const handleThemeToggle = (checked) => {
    onThemeChange(checked);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Settings</Title>

      <Card style={{ marginTop: '24px' }} title="Theme">
        <p>
          Dark Mode:{' '}
          <Switch checked={isDarkMode} onChange={handleThemeToggle} />
        </p>
      </Card>
    </div>
  );
}

export default SettingsPage;
