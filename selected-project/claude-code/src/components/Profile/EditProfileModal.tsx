import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, Select, DatePicker, message } from 'antd';
import { UploadOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<UploadFile | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<UploadFile | null>(null);
  const { user, updateUser } = useAuth();

  React.useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      });
    }
  }, [visible, user, form]);

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    
    return true;
  };

  const handleProfilePictureChange = (info: any) => {
    if (info.file.status === 'done') {
      setProfilePictureFile(info.file);
    }
  };

  const handleCoverPhotoChange = (info: any) => {
    if (info.file.status === 'done') {
      setCoverPhotoFile(info.file);
    }
  };

  const onFinish = async (values: any) => {
    if (!user) return;

    setLoading(true);
    
    try {
      const updatedData: Partial<User> = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        bio: values.bio,
        location: values.location,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined,
      };

      // In a real app, we would upload the files and get URLs
      if (profilePictureFile) {
        updatedData.profilePicture = URL.createObjectURL(profilePictureFile.originFileObj as File);
      }
      
      if (coverPhotoFile) {
        updatedData.coverPhoto = URL.createObjectURL(coverPhotoFile.originFileObj as File);
      }

      updateUser(updatedData);
      message.success('Profile updated successfully!');
      onSuccess();
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[{ required: true, message: 'Please input your full name!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter your full name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Please choose a username!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Choose a username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter your email"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="bio"
          label="Bio"
        >
          <TextArea
            placeholder="Tell us about yourself"
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="location"
          label="Location"
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Enter your location"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
        >
          <Select placeholder="Select gender" size="large">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dateOfBirth"
          label="Date of Birth"
        >
          <DatePicker
            style={{ width: '100%' }}
            size="large"
            placeholder="Select your birth date"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Form.Item label="Profile Picture">
          <Upload
            name="profilePicture"
            listType="picture"
            maxCount={1}
            beforeUpload={beforeUpload}
            onChange={handleProfilePictureChange}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Cover Photo">
          <Upload
            name="coverPhoto"
            listType="picture"
            maxCount={1}
            beforeUpload={beforeUpload}
            onChange={handleCoverPhotoChange}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Upload Cover Photo</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: '8px' }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;