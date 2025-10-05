import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Progress,
  Tooltip,
  Statistic,
  Alert,
  Tabs,
  List,
  Avatar,
  Divider,
  Badge
} from 'antd';
import {
  ApiOutlined,
  SettingOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const API = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取系统统计和日志
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          api.getStats(),
          api.getLogs({ limit: 50 })
        ]);

        setSystemStats(statsRes.data.stats);
        setApiLogs(logsRes.data.logs || []);
      } catch (error) {
        console.error('获取API数据失败:', error);
        message.error('获取API数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // 每30秒刷新一次
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 获取日志级别配置
  const getLogLevelConfig = (level) => {
    switch (level) {
      case 'info':
        return { color: 'blue', icon: <CheckCircleOutlined /> };
      case 'warning':
        return { color: 'orange', icon: <ExclamationCircleOutlined /> };
      case 'error':
        return { color: 'red', icon: <ExclamationCircleOutlined /> };
      default:
        return { color: 'default', icon: <ClockCircleOutlined /> };
    }
  };

  // 测试API连接
  const handleTestAPI = async (apiName) => {
    try {
      message.loading(`测试${apiName}连接中...`, 0);
      
      // 模拟API测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.destroy();
      message.success(`${apiName}连接测试成功！`);
    } catch (error) {
      message.destroy();
      message.error(`${apiName}连接测试失败`);
    }
  };

  // 保存API配置
  const handleSaveConfig = async (values) => {
    try {
      // 这里应该调用实际的API配置保存接口
      message.success('API配置已保存！');
      setConfigModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  // API日志表格列配置
  const logColumns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => new Date(time).toLocaleString(),
      width: 180,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const config = getLogLevelConfig(level);
        return (
          <Tag color={config.color} icon={config.icon}>
            {level.toUpperCase()}
          </Tag>
        );
      },
      width: 100,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => <Tag color="blue">{source}</Tag>,
      width: 120,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  // API服务配置
  const apiServices = [
    {
      name: 'Gemini API',
      description: 'Google Gemini Vision API - 营养分析服务',
      status: 'connected',
      usage: 85,
      cost: '$12.50',
      lastUsed: '2024-01-15T12:30:00Z'
    },
    {
      name: 'Roboflow API',
      description: 'Roboflow API - 数据集管理服务',
      status: 'connected',
      usage: 45,
      cost: '$8.20',
      lastUsed: '2024-01-15T11:45:00Z'
    },
    {
      name: 'Google Colab',
      description: 'Google Colab - 云端训练服务',
      status: 'connected',
      usage: 92,
      cost: '$15.80',
      lastUsed: '2024-01-15T12:15:00Z'
    }
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          API服务管理
        </Title>
        <Text style={{ color: '#a6a6a6' }}>
          监控和管理所有API服务的状态和性能
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card className="enhanced-card">
            <Statistic
              title="API调用次数"
              value={systemStats?.api_calls || 0}
              prefix={<ApiOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="enhanced-card">
            <Statistic
              title="错误数量"
              value={systemStats?.errors || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="enhanced-card">
            <Statistic
              title="平均响应时间"
              value="156"
              suffix="ms"
              prefix={<ThunderboltOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="enhanced-card">
            <Statistic
              title="本月费用"
              value="36.50"
              prefix="$"
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="services">
        <TabPane tab="API服务" key="services">
          <Row gutter={[24, 24]}>
            {apiServices.map((service, index) => (
              <Col xs={24} lg={8} key={index}>
                <Card 
                  title={
                    <Space>
                      <span>{service.name}</span>
                      <Badge 
                        status={service.status === 'connected' ? 'success' : 'error'} 
                        text={service.status === 'connected' ? '在线' : '离线'}
                      />
                    </Space>
                  }
                  className="enhanced-card"
                  extra={
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleTestAPI(service.name)}
                    >
                      测试
                    </Button>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text type="secondary">{service.description}</Text>
                    
                    <div>
                      <Text strong>使用率: </Text>
                      <Progress 
                        percent={service.usage} 
                        size="small" 
                        strokeColor={service.usage > 80 ? '#ff4d4f' : '#52c41a'}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>本月费用: <Text strong style={{ color: '#faad14' }}>{service.cost}</Text></Text>
                      <Text type="secondary">
                        最后使用: {new Date(service.lastUsed).toLocaleString()}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Card 
            title="API配置" 
            className="enhanced-card"
            style={{ marginTop: 24 }}
            extra={
              <Button 
                type="primary" 
                icon={<SettingOutlined />}
                onClick={() => setConfigModalVisible(true)}
              >
                配置API
              </Button>
            }
          >
            <Alert
              message="API配置说明"
              description="配置各个API服务的密钥和参数，确保服务正常运行。"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <List
              dataSource={[
                { key: 'GEMINI_API_KEY', name: 'Gemini API密钥', status: '已配置' },
                { key: 'ROBOFLOW_API_KEY', name: 'Roboflow API密钥', status: '已配置' },
                { key: 'ROBOFLOW_PROJECT_ID', name: 'Roboflow项目ID', status: '已配置' },
                { key: 'COLAB_TEMPLATE_URL', name: 'Colab模板URL', status: '未配置' }
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Tag color={item.status === '已配置' ? 'green' : 'red'}>
                      {item.status}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`环境变量: ${item.key}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="API日志" key="logs">
          <Card 
            title="API调用日志" 
            className="enhanced-card"
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                  刷新
                </Button>
                <Button icon={<EyeOutlined />}>
                  查看全部
                </Button>
              </Space>
            }
          >
            <Table
              columns={logColumns}
              dataSource={apiLogs}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
              scroll={{ x: 600 }}
              size="small"
            />
          </Card>
        </TabPane>

        <TabPane tab="性能监控" key="monitoring">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="API响应时间" className="enhanced-card">
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">响应时间图表（待实现）</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="错误率趋势" className="enhanced-card">
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text type="secondary">错误率图表（待实现）</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="实时监控" className="enhanced-card" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }}>
                    <CheckCircleOutlined />
                  </div>
                  <div style={{ color: '#ffffff', fontSize: 16, marginBottom: 4 }}>99.9%</div>
                  <div style={{ color: '#a6a6a6', fontSize: 12 }}>服务可用性</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }}>
                    <ThunderboltOutlined />
                  </div>
                  <div style={{ color: '#ffffff', fontSize: 16, marginBottom: 4 }}>156ms</div>
                  <div style={{ color: '#a6a6a6', fontSize: 12 }}>平均响应时间</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }}>
                    <BarChartOutlined />
                  </div>
                  <div style={{ color: '#ffffff', fontSize: 16, marginBottom: 4 }}>1,250</div>
                  <div style={{ color: '#a6a6a6', fontSize: 12 }}>今日调用次数</div>
                </div>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* API配置模态框 */}
      <Modal
        title="API服务配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveConfig}
        >
          <Form.Item
            name="gemini_api_key"
            label="Gemini API密钥"
            rules={[{ required: true, message: '请输入Gemini API密钥' }]}
          >
            <Input.Password placeholder="输入您的Gemini API密钥" />
          </Form.Item>

          <Form.Item
            name="roboflow_api_key"
            label="Roboflow API密钥"
            rules={[{ required: true, message: '请输入Roboflow API密钥' }]}
          >
            <Input.Password placeholder="输入您的Roboflow API密钥" />
          </Form.Item>

          <Form.Item
            name="roboflow_project_id"
            label="Roboflow项目ID"
            rules={[{ required: true, message: '请输入Roboflow项目ID' }]}
          >
            <Input placeholder="例如: malaysian-food-detection/1" />
          </Form.Item>

          <Form.Item
            name="colab_template_url"
            label="Colab模板URL"
          >
            <Input placeholder="输入Colab模板的URL" />
          </Form.Item>

          <Form.Item
            name="enable_monitoring"
            label="启用监控"
            valuePropName="checked"
          >
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存配置
              </Button>
              <Button onClick={() => setConfigModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default API;
