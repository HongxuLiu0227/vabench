import "./style.css"
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Modal, Form, Input, Select, Collapse, message } from 'antd';
import { CaretRightOutlined, DownloadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const PolicyModalContainer = styled.div`
  .ant-modal-body {
    padding: 24px;
  }
`;

const FormItem = styled(Form.Item)`
  margin-bottom: 16px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 8px;
`;

const RegulationSection = styled.div`
  margin-bottom: 16px;
`;

const RegulationHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  font-weight: 500;
`;

const RegulationContent = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-top: 8px;
`;

const ExportButton = styled(Button)`
  margin-left: 8px;
`;

const PolicyModal = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    gdpr: true,
    ccpa: false,
    hipaa: false
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      onSave(values);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (regulation) => {
    setExpandedSections(prev => ({
      ...prev,
      [regulation]: !prev[regulation]
    }));
  };

  const handleExport = (format) => {
    setExportLoading(true);
    message.loading('Preparing export...', 1.5);
    
    setTimeout(() => {
      const data = form.getFieldsValue();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: `application/${format}` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `policy_export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExportLoading(false);
      message.success('Export completed successfully');
    }, 1500);
  };

  const renderRegulationSection = (regulation, title) => {
    return (
      <RegulationSection>
        <RegulationHeader 
          onClick={() => toggleSection(regulation)}
          aria-expanded={expandedSections[regulation]}
          aria-controls={`${regulation}-content`}
        >
          <CaretRightOutlined 
            style={{
              transform: expandedSections[regulation] ? 'rotate(90deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
              marginRight: 8
            }} 
          />
          {title}
        </RegulationHeader>
        {expandedSections[regulation] && (
          <RegulationContent id={`${regulation}-content`}>
            <FormItem
              name={`${regulation}_description`}
              label="Description"
              rules={[{ required: true, message: 'Please input description' }]}
            >
              <TextArea rows={4} placeholder={`Enter ${title} description`} />
            </FormItem>
            <FormItem
              name={`${regulation}_status`}
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="active">Active</Option>
                <Option value="draft">Draft</Option>
                <Option value="archived">Archived</Option>
              </Select>
            </FormItem>
          </RegulationContent>
        )}
      </RegulationSection>
    );
  };

  return (
    <PolicyModalContainer>
      <Modal
        title="Edit Policy"
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
        >
          <FormItem
            name="name"
            label="Policy Name"
            rules={[{ required: true, message: 'Please input policy name' }]}
          >
            <Input placeholder="Enter policy name" />
          </FormItem>

          <FormItem
            name="regulation"
            label="Regulation"
            rules={[{ required: true, message: 'Please select regulation' }]}
          >
            <Select placeholder="Select regulation">
              <Option value="gdpr">GDPR</Option>
              <Option value="ccpa">CCPA</Option>
              <Option value="hipaa">HIPAA</Option>
            </Select>
          </FormItem>

          {renderRegulationSection('gdpr', 'GDPR')}
          {renderRegulationSection('ccpa', 'CCPA')}
          {renderRegulationSection('hipaa', 'HIPAA')}

          <ModalActions>
            <ExportButton 
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={() => handleExport('json')}
            >
              Export JSON
            </ExportButton>
            <ExportButton 
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </ExportButton>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" loading={loading} onClick={handleSave}>
              Save Changes
            </Button>
          </ModalActions>
        </Form>
      </Modal>
    </PolicyModalContainer>
  );
};

export default PolicyModal;