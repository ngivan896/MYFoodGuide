import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// 深色主题配置
const darkTheme = {
  token: {
    colorPrimary: '#1890ff',
    colorBgBase: '#0f0f0f',
    colorBgContainer: '#1a1a1a',
    colorBgElevated: '#262626',
    colorBorder: '#303030',
    colorText: '#ffffff',
    colorTextSecondary: '#a6a6a6',
    colorTextTertiary: '#737373',
    colorTextQuaternary: '#404040',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#0f0f0f',
      headerBg: '#1a1a1a',
      siderBg: '#1a1a1a',
    },
    Menu: {
      darkItemBg: '#1a1a1a',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#262626',
    },
    Card: {
      colorBgContainer: '#1a1a1a',
    },
    Table: {
      headerBg: '#262626',
      rowHoverBg: '#262626',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
    },
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN} theme={darkTheme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
