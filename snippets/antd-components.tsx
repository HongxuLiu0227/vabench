import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Collapse,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Pagination,
  Progress,
  Result,
  Row,
  Select,
  Skeleton,
  Slider,
  Space,
  Spin,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Tree,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps, TreeProps } from "antd";
import type { UploadProps } from "antd";
import {
  BellOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Header, Content, Sider } = Layout;
const { Panel } = Collapse;

interface CatalogueRow {
  key: string;
  product: string;
  owner: string;
  status: "Active" | "Draft" | "Paused";
  updatedAt: string;
  score: number;
}

const catalogueData: CatalogueRow[] = [
  { key: "1", product: "Realtime Insights", owner: "Helena Cho", status: "Active", updatedAt: "2025-10-09 09:30", score: 92 },
  { key: "2", product: "Workflow Studio", owner: "Luis Gómez", status: "Draft", updatedAt: "2025-10-08 15:45", score: 68 },
  { key: "3", product: "Compliance Radar", owner: "Mira Patel", status: "Paused", updatedAt: "2025-10-05 11:12", score: 41 },
  { key: "4", product: "Revenue Planner", owner: "Simon Lee", status: "Active", updatedAt: "2025-10-04 08:05", score: 77 },
  { key: "5", product: "Edge Gateway", owner: "Aria Singh", status: "Draft", updatedAt: "2025-09-30 17:20", score: 55 },
  { key: "6", product: "Mobile Companion", owner: "Ibrahim El-Sayed", status: "Active", updatedAt: "2025-09-28 10:02", score: 84 },
];

const statusColors: Record<CatalogueRow["status"], string> = {
  Active: "green",
  Draft: "orange",
  Paused: "red",
};

const tableColumns: ColumnsType<CatalogueRow> = [
  {
    title: "Product",
    dataIndex: "product",
    render: (text: string) => (
      <Space>
        <Avatar shape="square" icon={<UserOutlined />} />
        <span>{text}</span>
      </Space>
    ),
  },
  {
    title: "Owner",
    dataIndex: "owner",
  },
  {
    title: "Status",
    dataIndex: "status",
    filters: [
      { text: "Active", value: "Active" },
      { text: "Draft", value: "Draft" },
      { text: "Paused", value: "Paused" },
    ],
    render: (value: CatalogueRow["status"]) => <Tag color={statusColors[value]}>{value}</Tag>,
  },
  {
    title: "Updated",
    dataIndex: "updatedAt",
  },
  {
    title: "Quality",
    dataIndex: "score",
    sorter: (a, b) => a.score - b.score,
    render: (value: number) => <Progress percent={value} size="small" status={value > 70 ? "active" : "normal"} />,
  },
];

const menuItems: MenuProps["items"] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "catalogue", label: "Catalogue" },
  { key: "automation", label: "Automation" },
  { key: "insights", label: "Insights" },
];

const treeData: TreeProps["treeData"] = [
  {
    title: "Portfolio",
    key: "portfolio",
    children: [
      { title: "North America", key: "north-america" },
      { title: "EMEA", key: "emea" },
      {
        title: "APAC",
        key: "apac",
        children: [
          { title: "Japan", key: "apac-japan" },
          { title: "Australia", key: "apac-aus" },
        ],
      },
    ],
  },
];

const uploadProps: UploadProps = {
  beforeUpload(file) {
    // eslint-disable-next-line no-console
    console.log("Queued file:", file.name);
    return false;
  },
  multiple: true,
  showUploadList: true,
};

export const AntdPatternLibrary: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [qualityGate, setQualityGate] = useState(true);
  const [effort, setEffort] = useState(45);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().subtract(6, "day"), dayjs()]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [form] = Form.useForm();

  const paginatedData = useMemo(
    () => catalogueData.slice((page - 1) * 4, page * 4),
    [page],
  );

  const handleFilterSubmit = (values: Record<string, unknown>) => {
    setTableLoading(true);
    window.setTimeout(() => {
      setTableLoading(false);
      // eslint-disable-next-line no-console
      console.log("Applied filters:", values);
    }, 900);
  };

  const stats = [
    { title: "Active launches", value: 18, suffix: "campaigns" },
    { title: "Monthly ARR", value: 2.6, prefix: "$", suffix: "M" },
    { title: "Net promoter", value: 67, suffix: "NPS" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={240} theme="light">
        <div style={{ padding: 16, textAlign: "center" }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <div style={{ marginTop: 12, fontWeight: 600 }}>Product Operations</div>
          <Tag color="blue">Enterprise</Tag>
        </div>
        <Menu mode="inline" defaultSelectedKeys={["dashboard"]} items={menuItems} />
        <Divider style={{ margin: "16px 0" }} />
        <Tree
          defaultExpandAll
          treeData={treeData}
          height={240}
          onSelect={(keys) => setSelectedNodes(keys as string[])}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px" }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Breadcrumb items={[{ title: "Home" }, { title: "Operations" }, { title: "Product Console" }]} />
              <h1 style={{ margin: "8px 0 0" }}>Product Console</h1>
            </Col>
            <Col>
              <Space>
                <Badge dot>
                  <Button type="text" icon={<BellOutlined />} />
                </Badge>
                <Tooltip title="Refresh KPI data">
                  <Button icon={<ReloadOutlined />} onClick={() => setTableLoading(true)}>
                    Refresh
                  </Button>
                </Tooltip>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                  New release
                </Button>
              </Space>
            </Col>
          </Row>
        </Header>
        <Content style={{ padding: "24px 32px" }}>
          <Row gutter={[16, 16]}>
            {stats.map((item) => (
              <Col xs={24} sm={12} lg={8} key={item.title}>
                <Card>
                  <Statistic {...item} precision={item.prefix ? 2 : undefined} />
                  <Progress
                    percent={Math.min(100, (item.value / (item.prefix ? 5 : 100)) * 100)}
                    status="active"
                    size="small"
                    style={{ marginTop: 12 }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Tabs
            defaultActiveKey="summary"
            style={{ marginTop: 24 }}
            items={[
              {
                key: "summary",
                label: "Summary",
                children: (
                  <Card>
                    <Descriptions title="Portfolio health" bordered size="small" column={2}>
                      <Descriptions.Item label="Regions">{selectedNodes.join(", ") || "Global"}</Descriptions.Item>
                      <Descriptions.Item label="Verified">{qualityGate ? "Enabled" : "Disabled"}</Descriptions.Item>
                      <Descriptions.Item label="Current sprint effort">{effort}%</Descriptions.Item>
                      <Descriptions.Item label="Release window">
                        {dateRange[0].format("MMM DD")} - {dateRange[1].format("MMM DD")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ),
              },
              {
                key: "workflow",
                label: "Workflow",
                children: (
                  <Card>
                    <Steps
                      current={currentStep}
                      onChange={setCurrentStep}
                      items={[
                        { title: "Ideation" },
                        { title: "Design" },
                        { title: "Engineering" },
                        { title: "Launch" },
                      ]}
                    />
                    <Divider />
                    <Timeline>
                      <Timeline.Item color="green">Requirements frozen</Timeline.Item>
                      <Timeline.Item color="blue">Design prototypes validated</Timeline.Item>
                      <Timeline.Item color="orange">QA checklist in progress</Timeline.Item>
                    </Timeline>
                  </Card>
                ),
              },
              {
                key: "history",
                label: "History",
                children: (
                  <Card>
                    <Result
                      status="success"
                      title="Q3 objectives completed"
                      subTitle="Availability stayed above 99.95% with three successful releases."
                    />
                  </Card>
                ),
              },
            ]}
          />

          <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={16}>
              <Card
                title="Launch readiness"
                extra={
                  <Space>
                    <Switch checked={tableLoading} onChange={setTableLoading} checkedChildren="Loading" unCheckedChildren="Ready" />
                    <Tooltip title="Open incident log">
                      <Button type="link" onClick={() => setDrawerOpen(true)}>
                        Incident log
                      </Button>
                    </Tooltip>
                  </Space>
                }
              >
                <Spin spinning={tableLoading} indicator={<LoadingOutlined spin />}>
                  <Table<CatalogueRow>
                    columns={tableColumns}
                    dataSource={paginatedData}
                    pagination={false}
                    rowKey="key"
                  />
                </Spin>
                <Pagination
                  style={{ marginTop: 16, textAlign: "right" }}
                  current={page}
                  pageSize={4}
                  total={catalogueData.length}
                  onChange={(nextPage) => setPage(nextPage)}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Filters">
                <Form form={form} layout="vertical" onFinish={handleFilterSubmit}>
                  <Form.Item label="Search" name="search">
                    <Input placeholder="Search product or owner" allowClear />
                  </Form.Item>
                  <Form.Item label="Status" name="status">
                    <Select
                      allowClear
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Draft", label: "Draft" },
                        { value: "Paused", label: "Paused" },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="Date range" name="range">
                    <DatePicker.RangePicker
                      value={dateRange}
                      onChange={(values) => values && setDateRange(values as [Dayjs, Dayjs])}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        Apply
                      </Button>
                      <Button
                        onClick={() => {
                          form.resetFields();
                          setDateRange([dayjs().subtract(6, "day"), dayjs()]);
                        }}
                      >
                        Reset
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Quality gates" style={{ marginTop: 16 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Switch checked={qualityGate} onChange={setQualityGate} checkedChildren="Enabled" unCheckedChildren="Disabled" />
                  <Slider value={effort} onChange={setEffort} />
                  <Progress percent={effort} />
                </Space>
              </Card>

              <Card title="Assets" style={{ marginTop: 16 }}>
                <Upload {...uploadProps}>
                  <Button icon={<CloudUploadOutlined />}>Upload assets</Button>
                </Upload>
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
              </Card>
            </Col>
          </Row>

          <Collapse bordered defaultActiveKey={["1"]} style={{ marginTop: 24 }}>
            <Panel header="Release summary" key="1">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Scope">Rebuild onboarding flow with feature flags.</Descriptions.Item>
                <Descriptions.Item label="Owner">{catalogueData[0].owner}</Descriptions.Item>
                <Descriptions.Item label="Risk">Medium</Descriptions.Item>
                <Descriptions.Item label="Next review">{dayjs().add(4, "day").format("MMM DD, YYYY")}</Descriptions.Item>
              </Descriptions>
            </Panel>
          </Collapse>

          <Modal
            title="Create release"
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            onOk={() => {
              setModalOpen(false);
              // eslint-disable-next-line no-console
              console.log("Release created");
            }}
          >
            <Form layout="vertical">
              <Form.Item label="Name">
                <Input placeholder="Customer 360 portal" />
              </Form.Item>
              <Form.Item label="Category">
                <Select
                  options={[
                    { value: "Web", label: "Web" },
                    { value: "Mobile", label: "Mobile" },
                    { value: "Platform", label: "Platform" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Launch date">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Form>
          </Modal>

          <Drawer
            title="Incident history"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width={420}
            extra={<Button onClick={() => setDrawerOpen(false)}>Close</Button>}
          >
            <Alert
              type="warning"
              showIcon
              message="Region APAC experiencing elevated latency"
              description="Traffic is being rebalanced while edge nodes warm their caches."
            />
            <Timeline style={{ marginTop: 24 }}>
              <Timeline.Item color="orange">09:10 - Alert triggered</Timeline.Item>
              <Timeline.Item color="blue">09:18 - Auto scaling engaged</Timeline.Item>
              <Timeline.Item color="green">09:32 - Latency normalised</Timeline.Item>
            </Timeline>
          </Drawer>

          <Result
            style={{ marginTop: 32 }}
            status="success"
            title="All systems operational"
            extra={[
              <Button type="primary" key="dashboard">
                Go to dashboard
              </Button>,
              <Button key="feedback">Share feedback</Button>,
            ]}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntdPatternLibrary;
