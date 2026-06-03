import React, { useState } from 'react';
import { Form, Input, Button, Upload, Space, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Post } from '../../types';

const { TextArea } = Input;
const { Text } = Typography;

const PostForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useAppContext();
  const { user } = useAuth();

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isValidType = isImage || isVideo;
    
    if (!isValidType) {
      message.error('You can only upload image or video files!');
      return false;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return false;
    }
    
    return true;
  };

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const onFinish = async (values: { content: string }) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Extract hashtags and mentions
      const hashtags = values.content.match(/#\w+/g) || [];
      const mentions = values.content.match(/@\w+/g) || [];
      
      const newPost: Post = {
        id: Date.now().toString(),
        authorId: user.id,
        content: values.content,
        media: fileList.map(file => URL.createObjectURL(file.originFileObj as File)),
        hashtags: hashtags.map(tag => tag.slice(1)),
        mentions: mentions.map(mention => mention.slice(1)),
        likes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_POST', payload: newPost });
      
      form.resetFields();
      setFileList([]);
      message.success('Post created successfully!');
    } catch (error) {
      message.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="content"
        rules={[
          { required: true, message: 'Please write something!' },
          { max: 1000, message: 'Post cannot exceed 1000 characters!' },
        ]}
      >
        <TextArea
          placeholder="What's on your mind?"
          rows={4}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            Add photos or videos (max 5 files, 5MB each)
          </Text>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={beforeUpload}
            multiple
            maxCount={5}
            accept="image/*,video/*"
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
          >
            {fileList.length >= 5 ? null : uploadButton}
          </Upload>
        </Space>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
          size="large"
        >
          Post
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PostForm;