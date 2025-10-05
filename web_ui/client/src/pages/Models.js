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
  Select,
  message,
  Progress,
  Tooltip,
  Statistic,
  Alert
} from 'antd';
import {
  CloudDownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;

const Models = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [form] = Form.useForm();

  // 获取模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await api.getModelVersions();
        setModels(response.data.models || []);
      } catch (error) {
        console.error('获取模型列表失败:', error);
        message.error('获取模型列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  // 获取状态配置
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: 'success', icon: <CheckCircleOutlined />, text: '活跃' };
      case 'training':
        return { color: 'processing', icon: <ClockCircleOutlined />, text: '训练中' };
      case 'deploying':
        return { color: 'warning', icon: <PlayCircleOutlined />, text: '部署中' };
      case 'error':
        return { color: 'error', icon: <ExclamationCircleOutlined />, text: '错误' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: '未知' };
    }
  };

  // 部署模型
  const handleDeployModel = async (values) => {
    try {
      const deployData = {
        model_id: selectedModel.id,
        deployment_type: values.deployment_type,
        target_platform: values.target_platform,
        config: {
          quantization: values.quantization,
          optimization: values.optimization
        }
      };

      const response = await api.deployModel(deployData);
      
      if (response.data.success) {
        message.success('模型部署已开始！');
        setDeployModalVisible(false);
        form.resetFields();
        
        // 更新模型状态
        setModels(prev => 
          prev.map(model => 
            model.id === selectedModel.id 
              ? { ...model, status: 'deploying' }
              : model
          )
        );
      }
    } catch (error) {
      console.error('部署模型失败:', error);
      message.error('部署模型失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong style={{ color: '#ffffff' }}>{text}</Text>
          <Tag color="blue">v{record.version}</Tag>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => (
        <div style={{ width: 100 }}>
          <Progress 
            percent={Math.round(accuracy * 100)} 
            size="small" 
            strokeColor="#52c41a"
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (size) => `${size}MB`,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="link" icon={<EyeOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="下载模型">
            <Button type="link" icon={<CloudDownloadOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="部署到移动端">
            <Button 
              type="link" 
              icon={<MobileOutlined />} 
              size="small"
              onClick={() => {
                setSelectedModel(record);
                setDeployModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="删除模型">
            <Button type="link" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 模拟模型数据
  const mockModels = [
    {
      id: 'model_1',
      name: 'YOLOv8n Malaysian Food',
      version: '1.0.0',
      accuracy: 0.89,
      status: 'active',
      file_size: 6.2,
      created_at: '2024-01-15T12:00:00Z',
      inference_time: 15,
      classes: 20
    },
    {
      id: 'model_2',
      name: 'YOLOv8s Malaysian Food',
      version: '1.1.0',
      accuracy: 0.92,
      status: 'training',
      file_size: 21.5,
      created_at: '2024-01-14T10:30:00Z',
      inference_time: 22,
      classes: 20
    },
    {
      id: 'model_3',
      name: 'YOLOv8m Malaysian Food',
      version: '0.9.0',
      accuracy: 0.87,
      status: 'deploying',
      file_size: 49.7,
      created_at: '2024-01-13T15:45:00Z',
      inference_time: 35,
      classes: 20
    }
  ];

  // 使用模拟数据
  useEffect(() => {
    setModels(mockModels);
  }, []);

  return (
    <div className="main-content">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          模型管理
        </Title>
        <Text style={{ color: '#a6a6a6' }}>
          管理训练好的模型，部署到不同平台
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="总模型数"
              value={models.length}
              prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="活跃模型"
              value={models.filter(m => m.status === 'active').length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="平均准确率"
              value={Math.round(models.reduce((acc, m) => acc + m.accuracy, 0) / models.length * 100)}
              suffix="%"
              prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 模型列表 */}
      <Card 
        title="模型列表" 
        className="enhanced-card"
        extra={
          <Space>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              新建训练
            </Button>
            <Button icon={<BarChartOutlined />}>
              性能对比
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={models}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 部署模态框 */}
      <Modal
        title="部署模型到移动端"
        open={deployModalVisible}
        onCancel={() => setDeployModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="移动端部署说明"
          description="模型将被转换为TensorFlow Lite格式，并进行优化以适合移动设备运行。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleDeployModel}
          initialValues={{
            deployment_type: 'mobile',
            target_platform: 'android',
            quantization: true,
            optimization: 'speed'
          }}
        >
          <Form.Item
            name="deployment_type"
            label="部署类型"
            rules={[{ required: true, message: '请选择部署类型' }]}
          >
            <Select>
              <Option value="mobile">移动端</Option>
              <Option value="web">Web端</Option>
              <Option value="edge">边缘设备</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="target_platform"
            label="目标平台"
            rules={[{ required: true, message: '请选择目标平台' }]}
          >
            <Select>
              <Option value="android">Android</Option>
              <Option value="ios">iOS</Option>
              <Option value="both">Android + iOS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantization"
            label="量化处理"
            valuePropName="checked"
          >
            <Select>
              <Option value={true}>启用量化（推荐）</Option>
              <Option value={false}>禁用量化</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="optimization"
            label="优化策略"
            rules={[{ required: true, message: '请选择优化策略' }]}
          >
            <Select>
              <Option value="speed">速度优先</Option>
              <Option value="size">大小优先</Option>
              <Option value="balanced">平衡模式</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                开始部署
              </Button>
              <Button onClick={() => setDeployModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Models;
