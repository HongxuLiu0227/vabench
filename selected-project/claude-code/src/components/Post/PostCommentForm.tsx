import React from 'react';
import { Form, Input, Button, Avatar, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const { TextArea } = Input;

interface PostCommentFormProps {
  postId: string;
  parentId?: string;
  onCancel?: () => void;
}

const PostCommentForm: React.FC<PostCommentFormProps> = ({ 
  parentId, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const { user } = useAuth();

  const onFinish = () => {
    if (!user) return;

    // Comment creation would go here
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Space.Compact style={{ width: '100%' }}>
        <Avatar
          size="small"
          src={user?.profilePicture}
          style={{ marginRight: '8px' }}
        />
        <Form.Item
          name="content"
          style={{ flex: 1, margin: 0 }}
          rules={[
            { required: true, message: 'Please write a comment!' },
            { max: 500, message: 'Comment cannot exceed 500 characters!' },
          ]}
        >
          <TextArea
            placeholder="Write a comment..."
            rows={2}
            maxLength={500}
            showCount
          />
        </Form.Item>
        <Form.Item style={{ margin: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            style={{ height: 'auto' }}
          >
            {parentId ? 'Reply' : 'Comment'}
          </Button>
          {onCancel && (
            <Button
              onClick={onCancel}
              style={{ marginLeft: '8px', height: 'auto' }}
            >
              Cancel
            </Button>
          )}
        </Form.Item>
      </Space.Compact>
    </Form>
  );
};

export default PostCommentForm;