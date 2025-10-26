# 🔑 API 配置说明

## Gemini AI API Key 配置

### 1. 获取API密钥
访问 [Google AI Studio](https://aistudio.google.com/) 获取API密钥：
- 登录Google账户
- 点击"Get API Key"
- 创建新的API密钥
- 复制密钥

### 2. 配置API密钥

#### 方法1: 环境变量（推荐）
```bash
# 在项目根目录创建 .env 文件
echo "GEMINI_API_KEY=your_actual_api_key_here" > .env
```

#### 方法2: 直接修改代码
编辑 `web_ui/services/nutrition-analysis-service.js` 第10行：
```javascript
this.apiKey = process.env.GEMINI_API_KEY || 'your_actual_api_key_here';
```

### 3. 测试API连接
```bash
# 启动服务器
cd web_ui
node server.js

# 在另一个终端测试API
curl -X GET http://localhost:5000/api/nutrition/test
```

### 4. 常见问题

#### API密钥无效 (404错误)
- 检查密钥是否正确复制
- 确认密钥没有过期
- 验证密钥权限

#### API配额超限 (429错误)
- 检查API使用量
- 等待配额重置
- 升级API计划

#### 网络连接问题
- 检查网络连接
- 确认防火墙设置
- 尝试使用VPN

### 5. 当前使用的API端点
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### 6. 测试命令
```bash
# 测试营养分析
curl -X POST http://localhost:5000/api/nutrition/analyze \
  -H "Content-Type: application/json" \
  -d '{"food_name": "Nasi Lemak", "language": "zh-CN"}'
```
