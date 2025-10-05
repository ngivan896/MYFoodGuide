import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Table,
  Tag,
  Progress,
  Modal,
  message,
  Space,
  Typography,
  Divider,
  Alert,
  Tabs,
  List,
  Avatar,
  Tooltip
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  CloudOutlined,
  SettingOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Training = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [form] = Form.useForm();
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // 获取Colab模板
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await api.getColabTemplates();
        setTemplates(response.data.templates);
      } catch (error) {
        console.error('获取模板失败:', error);
        message.error('获取训练模板失败');
      }
    };

    fetchTemplates();
  }, []);

  // 模拟训练会话数据
  useEffect(() => {
    const mockSessions = [
      {
        id: 'session_1',
        name: 'YOLOv8n 基础训练',
        template: 'yolov8_basic',
        status: 'running',
        progress: 65,
        startTime: '2024-01-15T10:30:00Z',
        estimatedTime: '2h 30m',
        config: {
          epochs: 100,
          batch_size: 16,
          learning_rate: 0.01,
          img_size: 640
        }
      },
      {
        id: 'session_2',
        name: 'YOLOv8s 高级训练',
        template: 'yolov8_advanced',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-14T14:20:00Z',
        endTime: '2024-01-15T08:45:00Z',
        config: {
          epochs: 150,
          batch_size: 32,
          learning_rate: 0.005,
          img_size: 640
        }
      }
    ];
    setTrainingSessions(mockSessions);
  }, []);

  // 获取状态配置
  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return { 
          color: 'processing', 
          icon: <PlayCircleOutlined />, 
          text: '训练中' 
        };
      case 'completed':
        return { 
          color: 'success', 
          icon: <CheckCircleOutlined />, 
          text: '已完成' 
        };
      case 'pending':
        return { 
          color: 'warning', 
          icon: <ClockCircleOutlined />, 
          text: '等待中' 
        };
      case 'error':
        return { 
          color: 'error', 
          icon: <ExclamationCircleOutlined />, 
          text: '错误' 
        };
      default:
        return { 
          color: 'default', 
          icon: <ClockCircleOutlined />, 
          text: '未知' 
        };
    }
  };

  // 启动训练
  const handleStartTraining = async (values) => {
    try {
      setLoading(true);
      
      const trainingData = {
        dataset_id: values.dataset_id || 'default_dataset',
        model_config: {
          model_type: values.model_type,
          epochs: values.epochs,
          batch_size: values.batch_size,
          learning_rate: values.learning_rate,
          img_size: values.img_size
        },
        training_params: {
          augment: values.augment,
          optimizer: values.optimizer,
          loss_function: values.loss_function
        }
      };

      const response = await api.launchColabTraining(trainingData);
      
      if (response.data.success) {
        message.success('训练会话已创建！');
        
        // 打开Colab链接
        window.open(response.data.colab_url, '_blank');
        
        // 重置表单
        form.resetFields();
      }
    } catch (error) {
      console.error('启动训练失败:', error);
      message.error('启动训练失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 停止训练
  const handleStopTraining = async (sessionId) => {
    try {
      await api.stopTraining(sessionId);
      message.success('训练已停止');
      
      // 更新本地状态
      setTrainingSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'stopped' }
            : session
        )
      );
    } catch (error) {
      console.error('停止训练失败:', error);
      message.error('停止训练失败');
    }
  };

  // 配置训练参数
  const handleConfigureTraining = (template) => {
    setSelectedTemplate(template);
    setConfigModalVisible(true);
    
    // 设置表单默认值
    form.setFieldsValue({
      model_type: 'yolov8n',
      epochs: 100,
      batch_size: 16,
      learning_rate: 0.01,
      img_size: 640,
      augment: true,
      optimizer: 'AdamW',
      loss_function: 'focal_loss'
    });
  };

  // 表格列配置
  const columns = [
    {
      title: '训练名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong style={{ color: '#ffffff' }}>{text}</Text>
          <Tag color="blue">{record.template}</Tag>
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
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress, record) => (
        <div style={{ width: 120 }}>
          <Progress 
            percent={progress} 
            size="small" 
            strokeColor={record.status === 'running' ? '#1890ff' : '#52c41a'}
          />
        </div>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '预计时间',
      dataIndex: 'estimatedTime',
      key: 'estimatedTime',
      render: (time) => time || '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small">查看详情</Button>
          {record.status === 'running' && (
            <Button 
              type="link" 
              size="small" 
              danger
              onClick={() => handleStopTraining(record.id)}
            >
              停止
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="main-content">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          模型训练管理
        </Title>
        <Text style={{ color: '#a6a6a6' }}>
          通过Google Colab进行云端模型训练
        </Text>
      </div>

      <Tabs defaultActiveKey="new-training">
        <TabPane tab="新建训练" key="new-training">
          <Row gutter={[24, 24]}>
            {/* 训练模板选择 */}
            <Col xs={24} lg={8}>
              <Card title="选择训练模板" className="enhanced-card">
                <List
                  dataSource={templates}
                  renderItem={(template) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="primary" 
                          size="small"
                          onClick={() => handleConfigureTraining(template)}
                        >
                          配置
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<CloudOutlined />} />}
                        title={template.name}
                        description={template.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* 训练配置表单 */}
            <Col xs={24} lg={16}>
              <Card title="训练配置" className="enhanced-card">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleStartTraining}
                  initialValues={{
                    model_type: 'yolov8n',
                    epochs: 100,
                    batch_size: 16,
                    learning_rate: 0.01,
                    img_size: 640,
                    augment: true,
                    optimizer: 'AdamW',
                    loss_function: 'focal_loss'
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="model_type"
                        label="模型类型"
                        rules={[{ required: true, message: '请选择模型类型' }]}
                      >
                        <Select>
                          <Option value="yolov8n">YOLOv8n (轻量级)</Option>
                          <Option value="yolov8s">YOLOv8s (标准)</Option>
                          <Option value="yolov8m">YOLOv8m (中等)</Option>
                          <Option value="yolov8l">YOLOv8l (大型)</Option>
                          <Option value="yolov8x">YOLOv8x (超大型)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="epochs"
                        label="训练轮数"
                        rules={[{ required: true, message: '请输入训练轮数' }]}
                      >
                        <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="batch_size"
                        label="批次大小"
                        rules={[{ required: true, message: '请输入批次大小' }]}
                      >
                        <InputNumber min={1} max={128} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="learning_rate"
                        label="学习率"
                        rules={[{ required: true, message: '请输入学习率' }]}
                      >
                        <InputNumber 
                          min={0.0001} 
                          max={1} 
                          step={0.001} 
                          style={{ width: '100%' }} 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="img_size"
                        label="图像尺寸"
                        rules={[{ required: true, message: '请输入图像尺寸' }]}
                      >
                        <InputNumber min={320} max={1280} step={32} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="optimizer"
                        label="优化器"
                        rules={[{ required: true, message: '请选择优化器' }]}
                      >
                        <Select>
                          <Option value="AdamW">AdamW</Option>
                          <Option value="SGD">SGD</Option>
                          <Option value="Adam">Adam</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="loss_function"
                        label="损失函数"
                        rules={[{ required: true, message: '请选择损失函数' }]}
                      >
                        <Select>
                          <Option value="focal_loss">Focal Loss</Option>
                          <Option value="cross_entropy">Cross Entropy</Option>
                          <Option value="mse">MSE</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="augment"
                        label="数据增强"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Form.Item>
                    <Space>
                      <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        icon={<PlayCircleOutlined />}
                        size="large"
                      >
                        启动Colab训练
                      </Button>
                      <Button 
                        icon={<SettingOutlined />}
                        onClick={() => setConfigModalVisible(true)}
                      >
                        高级配置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="训练历史" key="training-history">
          <Card className="enhanced-card">
            <Table
              columns={columns}
              dataSource={trainingSessions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 高级配置模态框 */}
      <Modal
        title="高级训练配置"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="高级配置说明"
          description="这些参数将影响训练的性能和结果，建议根据数据集大小和硬件配置进行调整。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="预热轮数">
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="权重衰减">
                <InputNumber min={0} max={0.1} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="梯度裁剪">
                <InputNumber min={0} max={10} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="早停耐心值">
                <InputNumber min={5} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Training;
