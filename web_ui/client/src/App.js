import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, notification } from 'antd';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  RobotOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudOutlined,
  BarChartOutlined
} from '@ant-design/icons';

// 页面组件
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Models from './pages/Models';
import Datasets from './pages/Datasets';
import API from './pages/API';
import Settings from './pages/Settings';

// 工具函数
import { apiClient } from './utils/api';

const { Header, Sider, Content } = Layout;

// 菜单项配置
const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/training',
    icon: <RobotOutlined />,
    label: '模型训练',
  },
  {
    key: '/models',
    icon: <CloudOutlined />,
    label: '模型管理',
  },
  {
    key: '/datasets',
    icon: <DatabaseOutlined />,
    label: '数据集管理',
  },
  {
    key: '/api',
    icon: <ApiOutlined />,
    label: 'API管理',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '系统设置',
  },
];

// 主应用组件
function AppContent() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 检查系统健康状态
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await apiClient.get('/monitor/health');
        setSystemHealth(response.data);
      } catch (error) {
        console.error('系统健康检查失败:', error);
        notification.error({
          message: '系统连接失败',
          description: '无法连接到后端服务器，请检查服务器状态',
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    };

    checkSystemHealth();
    
    // 每30秒检查一次系统状态
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // 菜单点击处理
  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    return path === '/' ? '/' : path;
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Layout className="app-container" style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #303030',
        }}
        width={250}
      >
        {/* Logo区域 */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #303030',
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
        }}>
          <div style={{ color: '#ffffff', fontSize: collapsed ? 16 : 18, fontWeight: 'bold' }}>
            {collapsed ? 'NS' : 'NutriScan'}
          </div>
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: colorBgContainer,
            border: 'none',
            marginTop: 16,
          }}
        />

        {/* 系统状态指示器 */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          padding: 12,
          background: systemHealth?.status === 'healthy' ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
          border: `1px solid ${systemHealth?.status === 'healthy' ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 77, 79, 0.3)'}`,
          borderRadius: 8,
          fontSize: 12,
          color: systemHealth?.status === 'healthy' ? '#52c41a' : '#ff4d4f',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: systemHealth?.status === 'healthy' ? '#52c41a' : '#ff4d4f',
            }} />
            <span>{systemHealth?.status === 'healthy' ? '系统正常' : '系统异常'}</span>
          </div>
          {!collapsed && systemHealth && (
            <div style={{ marginTop: 4, opacity: 0.7 }}>
              v{systemHealth.version}
            </div>
          )}
        </div>
      </Sider>

      {/* 主内容区域 */}
      <Layout>
        {/* 顶部导航栏 */}
        <Header style={{
          padding: '0 24px',
          background: colorBgContainer,
          borderBottom: '1px solid #303030',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 折叠按钮 */}
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: 18,
                cursor: 'pointer',
                color: '#ffffff',
                padding: 8,
                borderRadius: 4,
                transition: 'background 0.3s',
              }}
              onMouseEnter={(e) => e.target.style.background = '#262626'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            {/* 页面标题 */}
            <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 500 }}>
              {menuItems.find(item => item.key === getSelectedKey())?.label || '仪表盘'}
            </div>
          </div>

          {/* 右侧操作区 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* 实时状态指示器 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: systemHealth?.status === 'healthy' ? '#52c41a' : '#ff4d4f',
                animation: systemHealth?.status === 'healthy' ? 'pulse 2s infinite' : 'none',
              }} />
              <span style={{ color: '#a6a6a6', fontSize: 12 }}>
                {systemHealth?.status === 'healthy' ? '在线' : '离线'}
              </span>
            </div>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: 0,
            padding: 0,
            background: '#0f0f0f',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/training" element={<Training />} />
            <Route path="/models" element={<Models />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/api" element={<API />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

// 主App组件
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
