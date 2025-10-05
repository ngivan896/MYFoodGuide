import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Switch,
  Button,
  Select,
  message,
  Typography,
  Divider,
  Space,
  Alert,
  Upload,
  Avatar,
  Tabs
} from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // 系统设置
    system: {
      theme: 'dark',
      language: 'zh-CN',
      timezone: 'Asia/Kuala_Lumpur',
      autoRefresh: true,
      refreshInterval: 30
    },
    // 通知设置
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      trainingComplete: true,
      errorAlerts: true,
      systemUpdates: false
    },
    // 安全设置
    security: {
      twoFactorAuth: false,
      sessionTimeout: 60,
      apiRateLimit: 1000,
      logRetention: 30
    },
    // 用户设置
    user: {
      name: 'Admin User',
      email: 'admin@nutriscan.com',
      avatar: null,
      role: 'admin'
    }
  });

  // 保存设置
  const handleSaveSettings = async (values) => {
    try {
      setLoading(true);
      
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettings(prev => ({
        ...prev,
        ...values
      }));
      
      message.success('设置已保存！');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    form.resetFields();
    message.info('设置已重置为默认值');
  };

  // 导出设置
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nutriscan-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    message.success('设置已导出');
  };

  // 导入设置
  const handleImportSettings = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(importedSettings);
        form.setFieldsValue(importedSettings);
        message.success('设置已导入');
      } catch (error) {
        message.error('导入设置失败，文件格式不正确');
      }
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          系统设置
        </Title>
        <Text style={{ color: '#a6a6a6' }}>
          配置系统参数、用户偏好和安全设置
        </Text>
      </div>

      <Tabs defaultActiveKey="system">
        <TabPane tab="系统设置" key="system">
          <Card title="系统配置" className="enhanced-card">
            <Form
              form={form}
              layout="vertical"
              initialValues={settings.system}
              onFinish={(values) => handleSaveSettings({ system: values })}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="theme"
                    label="主题模式"
                    rules={[{ required: true, message: '请选择主题模式' }]}
                  >
                    <Select>
                      <Option value="dark">深色主题</Option>
                      <Option value="light">浅色主题</Option>
                      <Option value="auto">跟随系统</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="language"
                    label="界面语言"
                    rules={[{ required: true, message: '请选择界面语言' }]}
                  >
                    <Select>
                      <Option value="zh-CN">中文简体</Option>
                      <Option value="en-US">English</Option>
                      <Option value="ms-MY">Bahasa Malaysia</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="timezone"
                    label="时区设置"
                    rules={[{ required: true, message: '请选择时区' }]}
                  >
                    <Select>
                      <Option value="Asia/Kuala_Lumpur">马来西亚时间 (UTC+8)</Option>
                      <Option value="Asia/Shanghai">中国时间 (UTC+8)</Option>
                      <Option value="UTC">协调世界时 (UTC)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={12}>
                  <Form.Item
                    name="refreshInterval"
                    label="自动刷新间隔 (秒)"
                    rules={[{ required: true, message: '请输入刷新间隔' }]}
                  >
                    <Input type="number" min={10} max={300} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="autoRefresh"
                label="启用自动刷新"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />}
                    onClick={handleResetSettings}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="通知设置" key="notifications">
          <Card title="通知配置" className="enhanced-card">
            <Form
              layout="vertical"
              initialValues={settings.notifications}
              onFinish={(values) => handleSaveSettings({ notifications: values })}
            >
              <Form.Item
                name="emailNotifications"
                label="邮件通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="pushNotifications"
                label="推送通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="trainingComplete"
                label="训练完成通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="errorAlerts"
                label="错误警报"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="systemUpdates"
                label="系统更新通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="安全设置" key="security">
          <Card title="安全配置" className="enhanced-card">
            <Alert
              message="安全提醒"
              description="定期更新密码，启用双因素认证以提高账户安全性。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              layout="vertical"
              initialValues={settings.security}
              onFinish={(values) => handleSaveSettings({ security: values })}
            >
              <Form.Item
                name="twoFactorAuth"
                label="双因素认证"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="sessionTimeout"
                label="会话超时时间 (分钟)"
                rules={[{ required: true, message: '请输入会话超时时间' }]}
              >
                <Input type="number" min={5} max={480} />
              </Form.Item>

              <Form.Item
                name="apiRateLimit"
                label="API速率限制 (请求/小时)"
                rules={[{ required: true, message: '请输入API速率限制' }]}
              >
                <Input type="number" min={100} max={10000} />
              </Form.Item>

              <Form.Item
                name="logRetention"
                label="日志保留天数"
                rules={[{ required: true, message: '请输入日志保留天数' }]}
              >
                <Input type="number" min={7} max={365} />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="用户设置" key="user">
          <Card title="用户信息" className="enhanced-card">
            <Form
              layout="vertical"
              initialValues={settings.user}
              onFinish={(values) => handleSaveSettings({ user: values })}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      size={100} 
                      icon={<UserOutlined />}
                      style={{ marginBottom: 16 }}
                    />
                    <div>
                      <Upload
                        beforeUpload={handleImportSettings}
                        showUploadList={false}
                      >
                        <Button icon={<UploadOutlined />}>
                          更换头像
                        </Button>
                      </Upload>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={16}>
                  <Form.Item
                    name="name"
                    label="用户名"
                    rules={[{ required: true, message: '请输入用户名' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="邮箱地址"
                    rules={[
                      { required: true, message: '请输入邮箱地址' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="role"
                    label="用户角色"
                    rules={[{ required: true, message: '请选择用户角色' }]}
                  >
                    <Select disabled>
                      <Option value="admin">管理员</Option>
                      <Option value="user">普通用户</Option>
                      <Option value="viewer">只读用户</Option>
                    </Select>
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
                    icon={<SaveOutlined />}
                  >
                    保存设置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="数据管理" key="data">
          <Card title="数据管理" className="enhanced-card">
            <Alert
              message="数据管理说明"
              description="导出和导入系统设置，备份重要配置数据。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card size="small" title="导出设置">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>导出当前系统设置到JSON文件</Text>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      onClick={handleExportSettings}
                      block
                    >
                      导出设置
                    </Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card size="small" title="导入设置">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text>从JSON文件导入系统设置</Text>
                    <Upload
                      beforeUpload={handleImportSettings}
                      showUploadList={false}
                    >
                      <Button 
                        icon={<UploadOutlined />}
                        block
                      >
                        导入设置
                      </Button>
                    </Upload>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card size="small" title="系统信息">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>系统版本: </Text>
                  <Text>v1.0.0</Text>
                </Col>
                <Col span={12}>
                  <Text strong>构建时间: </Text>
                  <Text>2024-01-15</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Node.js版本: </Text>
                  <Text>v18.17.0</Text>
                </Col>
                <Col span={12}>
                  <Text strong>React版本: </Text>
                  <Text>v18.2.0</Text>
                </Col>
              </Row>
            </Card>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
