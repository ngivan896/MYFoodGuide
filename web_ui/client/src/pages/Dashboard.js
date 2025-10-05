import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  List, 
  Avatar, 
  Tag, 
  Button,
  Space,
  Typography,
  Alert,
  Spin
} from 'antd';
import {
  RobotOutlined,
  DatabaseOutlined,
  CloudOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { api } from '../utils/api';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const { Title: AntTitle, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);

  // 获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 并行获取所有数据
        const [statsRes, datasetsRes, modelsRes] = await Promise.all([
          api.getStats(),
          api.getDatasets(),
          api.getModelVersions()
        ]);

        setSystemStats(statsRes.data.stats);
        setDatasets(datasetsRes.data.datasets || []);
        setModels(modelsRes.data.models || []);

        // 模拟训练会话数据（实际应该从API获取）
        setTrainingSessions([
          {
            id: 'session_1',
            name: 'YOLOv8n 基础训练',
            status: 'running',
            progress: 65,
            startTime: '2024-01-15T10:30:00Z',
            estimatedTime: '2h 30m'
          },
          {
            id: 'session_2',
            name: 'YOLOv8s 高级训练',
            status: 'completed',
            progress: 100,
            startTime: '2024-01-14T14:20:00Z',
            endTime: '2024-01-15T08:45:00Z'
          },
          {
            id: 'session_3',
            name: '自定义模型训练',
            status: 'pending',
            progress: 0,
            startTime: null
          }
        ]);

      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // 每30秒刷新一次数据
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 获取状态图标和颜色
  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return { icon: <PlayCircleOutlined />, color: '#52c41a', text: '训练中' };
      case 'completed':
        return { icon: <CheckCircleOutlined />, color: '#1890ff', text: '已完成' };
      case 'pending':
        return { icon: <ClockCircleOutlined />, color: '#faad14', text: '等待中' };
      case 'error':
        return { icon: <ExclamationCircleOutlined />, color: '#ff4d4f', text: '错误' };
      default:
        return { icon: <ClockCircleOutlined />, color: '#a6a6a6', text: '未知' };
    }
  };

  // 图表数据配置
  const accuracyChartData = {
    labels: ['Epoch 1', 'Epoch 20', 'Epoch 40', 'Epoch 60', 'Epoch 80', 'Epoch 100'],
    datasets: [
      {
        label: '训练准确率',
        data: [0.45, 0.68, 0.78, 0.85, 0.89, 0.92],
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.4,
      },
      {
        label: '验证准确率',
        data: [0.42, 0.65, 0.75, 0.82, 0.86, 0.89],
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const datasetDistributionData = {
    labels: ['Nasi Lemak', 'Roti Canai', 'Char Kway Teow', 'Bak Kut Teh', '其他'],
    datasets: [
      {
        data: [15, 12, 10, 8, 55],
        backgroundColor: [
          '#1890ff',
          '#52c41a',
          '#faad14',
          '#ff4d4f',
          '#722ed1',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#a6a6a6',
        },
        grid: {
          color: '#303030',
        },
      },
      y: {
        ticks: {
          color: '#a6a6a6',
        },
        grid: {
          color: '#303030',
        },
      },
    },
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* 欢迎信息 */}
      <div style={{ marginBottom: 24 }}>
        <AntTitle level={2} style={{ color: '#ffffff', margin: 0 }}>
          欢迎使用 NutriScan Dashboard
        </AntTitle>
        <Text style={{ color: '#a6a6a6' }}>
          马来西亚食物智能识别系统管理平台
        </Text>
      </div>

      {/* 系统状态警告 */}
      {systemStats && systemStats.errors > 0 && (
        <Alert
          message="系统警告"
          description={`检测到 ${systemStats.errors} 个错误，请检查系统日志`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="enhanced-card">
            <Statistic
              title="活跃训练会话"
              value={trainingSessions.filter(s => s.status === 'running').length}
              prefix={<RobotOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="enhanced-card">
            <Statistic
              title="数据集总数"
              value={datasets.length}
              prefix={<DatabaseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="enhanced-card">
            <Statistic
              title="模型版本"
              value={models.length}
              prefix={<CloudOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#ffffff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="enhanced-card">
            <Statistic
              title="API调用次数"
              value={systemStats?.api_calls || 0}
              prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#ffffff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="训练准确率趋势" 
            className="enhanced-card"
            extra={<Button type="link">查看详情</Button>}
          >
            <div style={{ height: 300 }}>
              <Line data={accuracyChartData} options={chartOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="数据集分布" 
            className="enhanced-card"
            extra={<Button type="link">查看详情</Button>}
          >
            <div style={{ height: 300 }}>
              <Doughnut data={datasetDistributionData} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 训练会话列表 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title="训练会话" 
            className="enhanced-card"
            extra={
              <Space>
                <Button type="primary" icon={<PlayCircleOutlined />}>
                  新建训练
                </Button>
                <Button>查看全部</Button>
              </Space>
            }
          >
            <List
              dataSource={trainingSessions}
              renderItem={(session) => {
                const statusConfig = getStatusConfig(session.status);
                return (
                  <List.Item
                    actions={[
                      <Button type="link" size="small">查看详情</Button>,
                      session.status === 'running' && (
                        <Button type="link" size="small" danger>停止</Button>
                      )
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={statusConfig.icon} 
                          style={{ backgroundColor: statusConfig.color }}
                        />
                      }
                      title={
                        <Space>
                          <span style={{ color: '#ffffff' }}>{session.name}</span>
                          <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Progress 
                              percent={session.progress} 
                              size="small" 
                              strokeColor={statusConfig.color}
                            />
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            开始时间: {session.startTime ? new Date(session.startTime).toLocaleString() : '未开始'}
                            {session.estimatedTime && ` | 预计剩余: ${session.estimatedTime}`}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="系统状态" 
            className="enhanced-card"
            extra={<Button type="link">刷新</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>系统运行时间</Text>
                <Text strong>{systemStats ? Math.floor(systemStats.uptime / 3600) : 0} 小时</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>内存使用率</Text>
                <Text strong>{systemStats?.memory_usage || 'N/A'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>CPU使用率</Text>
                <Text strong>{systemStats?.cpu_usage || 'N/A'}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>错误数量</Text>
                <Text strong style={{ color: systemStats?.errors > 0 ? '#ff4d4f' : '#52c41a' }}>
                  {systemStats?.errors || 0}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
