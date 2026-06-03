import React, { useState } from 'react';
import { Input, Button, Form } from 'antd';

interface ContactFormProps {
  onSubmit: (data: { name: string; email: string; message: string }) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit} layout="vertical">
      <Form.Item label="Name">
        <Input name="name" value={formData.name} onChange={handleChange} required />
      </Form.Item>
      <Form.Item label="Email">
        <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </Form.Item>
      <Form.Item label="Message">
        <Input.TextArea name="message" value={formData.message} onChange={handleChange} required />
      </Form.Item>
      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default ContactForm;