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
  Upload,
  message,
  Progress,
  Tooltip,
  Statistic,
  Alert,
  Tabs,
  List,
  Avatar,
  Divider
} from 'antd';
import {
  UploadOutlined,
  SyncOutlined,
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  CloudOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '../utils/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [form] = Form.useForm();
  const [syncForm] = Form.useForm();

  // 获取数据集列表
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await api.getDatasets();
        setDatasets(response.data.datasets || []);
      } catch (error) {
        console.error('获取数据集列表失败:', error);
        message.error('获取数据集列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  // 获取状态配置
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ready':
        return { color: 'success', icon: <CheckCircleOutlined />, text: '就绪' };
      case 'uploading':
        return { color: 'processing', icon: <ClockCircleOutlined />, text: '上传中' };
      case 'processing':
        return { color: 'warning', icon: <SyncOutlined />, text: '处理中' };
      case 'error':
        return { color: 'error', icon: <ExclamationCircleOutlined />, text: '错误' };
      default:
        return { color: 'default', icon: <ClockCircleOutlined />, text: '未知' };
    }
  };

  // 上传数据集
  const handleUploadDataset = async (values) => {
    try {
      const uploadData = {
        name: values.name,
        description: values.description,
        type: values.type,
        source: 'local'
      };

      const response = await api.uploadDataset(uploadData);
      
      if (response.data.success) {
        message.success('数据集上传已开始！');
        setUploadModalVisible(false);
        form.resetFields();
        
        // 刷新数据集列表
        const datasetsResponse = await api.getDatasets();
        setDatasets(datasetsResponse.data.datasets || []);
      }
    } catch (error) {
      console.error('上传数据集失败:', error);
      message.error('上传数据集失败');
    }
  };

  // 同步Roboflow数据
  const handleSyncRoboflow = async (values) => {
    try {
      const syncData = {
        roboflow_project_id: values.project_id,
        dataset_name: values.dataset_name
      };

      const response = await api.syncRoboflowData(syncData);
      
      if (response.data.success) {
        message.success('Roboflow数据同步已开始！');
        setSyncModalVisible(false);
        syncForm.resetFields();
        
        // 刷新数据集列表
        const datasetsResponse = await api.getDatasets();
        setDatasets(datasetsResponse.data.datasets || []);
      }
    } catch (error) {
      console.error('同步Roboflow数据失败:', error);
      message.error('同步Roboflow数据失败');
    }
  };

  // 分析数据集
  const handleAnalyzeDataset = async (datasetId) => {
    try {
      const response = await api.analyzeDataset(datasetId);
      setAnalysisData(response.data.analysis);
      setAnalysisModalVisible(true);
    } catch (error) {
      console.error('分析数据集失败:', error);
      message.error('分析数据集失败');
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong style={{ color: '#ffffff' }}>{text}</Text>
          <Tag color="blue">{record.type}</Tag>
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
      title: '文件数量',
      dataIndex: 'file_count',
      key: 'file_count',
      render: (count) => count ? count.toLocaleString() : '-',
    },
    {
      title: '总大小',
      dataIndex: 'total_size',
      key: 'total_size',
      render: (size) => size || '-',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        <Tag color={source === 'roboflow' ? 'green' : 'blue'}>
          {source === 'roboflow' ? 'Roboflow' : '本地'}
        </Tag>
      ),
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
          <Tooltip title="分析数据集">
            <Button 
              type="link" 
              icon={<BarChartOutlined />} 
              size="small"
              onClick={() => handleAnalyzeDataset(record.id)}
            />
          </Tooltip>
          <Tooltip title="下载数据集">
            <Button type="link" icon={<DownloadOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="删除数据集">
            <Button type="link" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 模拟数据集数据
  const mockDatasets = [
    {
      id: 'dataset_1',
      name: 'Malaysian Food Dataset v1',
      description: '包含20种马来西亚食物的数据集',
      type: 'yolo',
      source: 'roboflow',
      status: 'ready',
      created_at: '2024-01-10T09:00:00Z',
      file_count: 1000,
      total_size: '2.5GB'
    },
    {
      id: 'dataset_2',
      name: 'Custom Food Dataset',
      description: '用户自定义食物数据集',
      type: 'yolo',
      source: 'local',
      status: 'uploading',
      created_at: '2024-01-15T14:30:00Z',
      file_count: 500,
      total_size: '1.2GB'
    },
    {
      id: 'dataset_3',
      name: 'Test Dataset',
      description: '测试用数据集',
      type: 'yolo',
      source: 'local',
      status: 'processing',
      created_at: '2024-01-14T16:20:00Z',
      file_count: 200,
      total_size: '500MB'
    }
  ];

  // 使用模拟数据
  useEffect(() => {
    setDatasets(mockDatasets);
  }, []);

  return (
    <div className="main-content">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          数据集管理
        </Title>
        <Text style={{ color: '#a6a6a6' }}>
          管理训练数据集，支持本地上传和Roboflow同步
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="总数据集数"
              value={datasets.length}
              prefix={<DatabaseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="总文件数"
              value={datasets.reduce((acc, d) => acc + (d.file_count || 0), 0)}
              prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="enhanced-card">
            <Statistic
              title="就绪数据集"
              value={datasets.filter(d => d.status === 'ready').length}
              prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="datasets">
        <TabPane tab="数据集列表" key="datasets">
          <Card 
            title="数据集列表" 
            className="enhanced-card"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                >
                  上传数据集
                </Button>
                <Button 
                  icon={<SyncOutlined />}
                  onClick={() => setSyncModalVisible(true)}
                >
                  同步Roboflow
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={datasets}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="数据源管理" key="sources">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="Roboflow集成" className="enhanced-card">
                <List
                  dataSource={[
                    {
                      title: 'Malaysian Food Detection',
                      description: '主要数据集项目',
                      status: 'connected',
                      lastSync: '2024-01-15T10:30:00Z'
                    },
                    {
                      title: 'Custom Food Dataset',
                      description: '自定义数据集项目',
                      status: 'disconnected',
                      lastSync: null
                    }
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" size="small">
                          {item.status === 'connected' ? '同步' : '连接'}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<CloudOutlined />} />}
                        title={item.title}
                        description={
                          <div>
                            <div>{item.description}</div>
                            <div style={{ fontSize: 12, color: '#a6a6a6' }}>
                              状态: <Tag color={item.status === 'connected' ? 'green' : 'red'}>
                                {item.status === 'connected' ? '已连接' : '未连接'}
                              </Tag>
                              {item.lastSync && (
                                <span> | 最后同步: {new Date(item.lastSync).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="本地数据源" className="enhanced-card">
                <List
                  dataSource={[
                    {
                      title: 'raw_images/',
                      description: '原始图像文件夹',
                      fileCount: 2000,
                      size: '5.2GB'
                    },
                    {
                      title: 'test_images/',
                      description: '测试图像文件夹',
                      fileCount: 200,
                      size: '500MB'
                    }
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button type="link" size="small">扫描</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<DatabaseOutlined />} />}
                        title={item.title}
                        description={
                          <div>
                            <div>{item.description}</div>
                            <div style={{ fontSize: 12, color: '#a6a6a6' }}>
                              文件数: {item.fileCount} | 大小: {item.size}
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 上传数据集模态框 */}
      <Modal
        title="上传数据集"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUploadDataset}
        >
          <Form.Item
            name="name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="例如: Malaysian Food Dataset v2" />
          </Form.Item>

          <Form.Item
            name="description"
            label="数据集描述"
            rules={[{ required: true, message: '请输入数据集描述' }]}
          >
            <Input.TextArea rows={3} placeholder="描述数据集的内容和用途" />
          </Form.Item>

          <Form.Item
            name="type"
            label="数据集类型"
            rules={[{ required: true, message: '请选择数据集类型' }]}
          >
            <Select>
              <Option value="yolo">YOLO格式</Option>
              <Option value="coco">COCO格式</Option>
              <Option value="pascal">Pascal VOC格式</Option>
            </Select>
          </Form.Item>

          <Form.Item label="上传文件">
            <Dragger
              name="files"
              multiple
              action="/api/upload"
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个或批量上传。支持图片格式：JPG、PNG、JPEG
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                开始上传
              </Button>
              <Button onClick={() => setUploadModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 同步Roboflow模态框 */}
      <Modal
        title="同步Roboflow数据"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="Roboflow同步说明"
          description="将从Roboflow项目同步最新的数据集和标注信息。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={syncForm}
          layout="vertical"
          onFinish={handleSyncRoboflow}
        >
          <Form.Item
            name="project_id"
            label="Roboflow项目ID"
            rules={[{ required: true, message: '请输入项目ID' }]}
          >
            <Input placeholder="例如: malaysian-food-detection/1" />
          </Form.Item>

          <Form.Item
            name="dataset_name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="例如: Malaysian Food Dataset" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                开始同步
              </Button>
              <Button onClick={() => setSyncModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 数据集分析模态框 */}
      <Modal
        title="数据集分析报告"
        open={analysisModalVisible}
        onCancel={() => setAnalysisModalVisible(false)}
        footer={null}
        width={800}
      >
        {analysisData && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small" title="基本信息">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>总图像数: {analysisData.total_images}</div>
                    <div>类别数: {analysisData.classes}</div>
                    <div>平均尺寸: {analysisData.average_size}</div>
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="图像质量">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>高质量: {analysisData.image_quality.high}</div>
                    <div>中等质量: {analysisData.image_quality.medium}</div>
                    <div>低质量: {analysisData.image_quality.low}</div>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Card size="small" title="类别分布">
              <List
                dataSource={Object.entries(analysisData.class_distribution)}
                renderItem={([name, count]) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{name}</span>
                      <span>{count}</span>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Datasets;
