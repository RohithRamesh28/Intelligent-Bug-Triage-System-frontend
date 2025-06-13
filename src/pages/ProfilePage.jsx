import { useEffect, useState } from 'react';
import { Form, Input, Button, message as antMessage, Skeleton, Typography } from 'antd';
import api from '../api';

const { Title, Text } = Typography;

function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/me');
        setProfile(res.data);
        form.setFieldsValue({
          new_username: res.data.username,
        });
      } catch (err) {
        antMessage.error('Failed to load profile.',err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  const onFinish = async (values) => {
    try {
      await api.put('/me', {
        new_username: values.new_username,
        new_password: values.new_password || undefined,
      });

      const usernameChanged = values.new_username !== profile.username;
      const passwordChanged = !!values.new_password;

      let newMessage = '';
      if (usernameChanged && passwordChanged) {
        newMessage = 'Username and Password updated!';
      } else if (usernameChanged) {
        newMessage = 'Username updated!';
      } else if (passwordChanged) {
        newMessage = 'Password updated!';
      } else {
        newMessage = 'Profile updated!';
      }

      setStatusMessage(newMessage);
      setStatusType('success');

      setProfile((prev) => ({
        ...prev,
        username: values.new_username,
      }));
      form.setFieldsValue({
        new_password: '',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Profile update failed.';
      setStatusMessage(errorMsg);
      setStatusType('error');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <>
          <Title level={2}>My Profile</Title>
          <Text type="secondary">Manage your username and password for this project.</Text>

          {/* Inline status message */}
          {statusMessage && (
            <Text
              type={statusType === 'success' ? 'success' : 'danger'}
              style={{ display: 'block', marginBottom: 16 }}
            >
              {statusMessage}
            </Text>
          )}

          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: '24px' }}
            onFinish={onFinish}
            onValuesChange={() => {
              setStatusMessage('');
            }}
          >
            <Form.Item label="Project Name">
              <Input value={profile?.project_name} disabled />
            </Form.Item>

            <Form.Item
              name="new_username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter your username.' },
                { min: 3, message: 'Username must be at least 3 characters.' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="New Password"
              rules={[{ min: 6, message: 'Password must be at least 6 characters.' }]}
            >
              <Input.Password placeholder="Leave blank to keep current password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
}

export default ProfilePage;
