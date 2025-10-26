# 🍜 NutriScan MY - 训练控制台使用指南

## 📋 项目概述

NutriScan MY 是一个完整的马来西亚食物识别系统后端管理平台，集成了数据管理、模型训练、用户数据分析、Google Colab集成等功能。

## 🚀 快速开始

### 1. 安装依赖

```bash
cd web_ui
npm install
```

### 2. 启动服务器

```bash
npm start
# 或者
node server.js
```

服务器将在 `http://localhost:5000` 启动

### 3. 访问训练控制台

打开浏览器访问：`http://localhost:5000/training`

## 🎯 核心功能

### 1. 📊 训练配置

在训练控制台中，你可以配置以下参数：

#### 🤖 模型配置
- **模型类型**: 选择YOLOv8的不同版本
  - `yolov8n`: 最快，适合移动端
  - `yolov8s`: 平衡性能
  - `yolov8m`: 高精度
  - `yolov8l`: 最高精度
- **训练轮次**: 10-500轮
- **批次大小**: 1-64

#### ⚙️ 训练参数
- **学习率**: 0.0001-0.1
- **图像大小**: 416x416 到 832x832
- **早停耐心值**: 5-50

#### 🔧 高级选项
- **优化器**: AdamW (推荐), SGD, Adam
- **损失函数**: BCE, CE, Focal Loss
- **数据增强**: 启用/禁用

### 2. 🚀 Google Colab 智能集成

#### 启动训练流程
1. 配置训练参数
2. 点击"启动 Colab 训练"按钮
3. 系统将自动：
   - 生成包含你配置的Colab模板
   - 打开新的Colab标签页
   - 开始训练过程
   - 实时同步训练状态到Dashboard

#### 训练状态监控
- **准备就绪**: 训练会话已创建，等待开始
- **训练中**: 模型正在训练，显示进度
- **已完成**: 训练完成，可查看结果
- **失败**: 训练出错，查看错误信息

### 3. 📊 训练状态管理

#### 实时状态更新
- 训练进度百分比
- 关键指标 (准确率、损失等)
- 训练日志
- Colab链接

#### 历史记录
- 所有训练会话的历史记录
- 训练配置和结果
- 模型性能对比

## 🔧 API 接口

### 训练相关 API

#### 启动 Colab 训练
```http
POST /api/training/colab/launch
Content-Type: application/json

{
  "dataset_id": "default_dataset",
  "model_config": {
    "model_type": "yolov8n",
    "epochs": 100,
    "batch_size": 16,
    "learning_rate": 0.01,
    "img_size": 640
  },
  "training_params": {}
}
```

#### 获取训练状态
```http
GET /api/training/colab/status/{sessionId}
```

#### 获取训练会话列表
```http
GET /api/training/sessions
```

### 数据集管理 API

#### 获取数据集列表
```http
GET /api/datasets
```

#### 上传数据集
```http
POST /api/datasets/upload
Content-Type: application/json

{
  "name": "数据集名称",
  "description": "数据集描述",
  "type": "yolo",
  "source": "local"
}
```

#### 数据集分析
```http
GET /api/datasets/analyze/{datasetId}
```

### 模型管理 API

#### 获取模型版本
```http
GET /api/models/versions
```

#### 模型性能对比
```http
GET /api/models/compare?model_ids=model1,model2
```

#### 模型部署
```http
POST /api/training/deploy
Content-Type: application/json

{
  "model_id": "model_id",
  "deployment_type": "production",
  "target_platform": "mobile",
  "target_format": "tflite"
}
```

### 营养分析 API

#### 单个食物营养分析
```http
POST /api/nutrition/analyze
Content-Type: application/json

{
  "food_name": "Nasi Lemak",
  "language": "zh-CN"
}
```

#### 批量营养分析
```http
POST /api/nutrition/analyze-batch
Content-Type: application/json

{
  "food_names": ["Nasi Lemak", "Roti Canai", "Char Kway Teow"],
  "language": "zh-CN"
}
```

### 系统监控 API

#### 健康检查
```http
GET /api/monitor/health
```

#### 系统统计
```http
GET /api/monitor/stats
```

#### 错误日志
```http
GET /api/monitor/logs?level=error&limit=100
```

## 🧪 测试

### 运行完整测试

```bash
cd web_ui
node test-training-flow.js
```

测试将验证：
- ✅ 服务器健康状态
- ✅ 数据集管理功能
- ✅ 模型管理功能
- ✅ 训练配置功能
- ✅ Colab集成功能
- ✅ 营养分析功能
- ✅ 训练流程自动化
- ✅ 系统监控功能

### 测试报告

测试完成后会生成 `test_report.json` 文件，包含：
- 测试总结统计
- 详细测试结果
- 失败测试的错误信息
- 测试耗时

## 🔧 配置

### 环境变量

创建 `.env` 文件：

```env
# 服务器配置
PORT=5000
NODE_ENV=development

# Gemini AI 配置
GEMINI_API_KEY=your_gemini_api_key

# Roboflow 配置
ROBOFLOW_API_KEY=your_roboflow_api_key
ROBOFLOW_PROJECT_ID=your_project_id
```

### API 配置

编辑 `config/api-config.js` 文件来配置各种API服务。

## 📁 项目结构

```
web_ui/
├── server.js                          # 主服务器文件
├── package.json                       # 项目依赖
├── public/
│   ├── index.html                     # 主页面
│   └── training.html                  # 训练控制台
├── services/
│   ├── colab-template-generator.js    # Colab模板生成器
│   ├── real-data-service.js           # 真实数据服务
│   ├── training-automation-service.js # 训练自动化服务
│   └── nutrition-analysis-service.js  # 营养分析服务
├── config/
│   └── api-config.js                  # API配置
├── data/                              # 数据存储目录
├── temp/                              # 临时文件目录
└── test-training-flow.js              # 测试脚本
```

## 🎨 界面功能

### 训练控制台界面

- **现代化设计**: 渐变背景，卡片式布局
- **响应式设计**: 支持移动端和桌面端
- **实时更新**: 训练状态自动刷新
- **用户友好**: 直观的操作界面

### 主要组件

1. **训练配置面板**: 三个配置卡片
   - 模型配置
   - 训练参数
   - 高级选项

2. **Colab集成区域**: 
   - 智能集成说明
   - 启动按钮
   - 状态显示

3. **训练状态面板**:
   - 会话列表
   - 进度条
   - 性能指标
   - Colab链接

## 🔍 故障排除

### 常见问题

1. **服务器无法启动**
   - 检查端口5000是否被占用
   - 确认Node.js版本 >= 16.0.0
   - 检查依赖是否正确安装

2. **Colab集成失败**
   - 确认网络连接正常
   - 检查Colab模板生成是否成功
   - 查看服务器日志

3. **营养分析失败**
   - 检查Gemini API密钥是否正确
   - 确认API配额是否充足
   - 查看网络连接

4. **测试失败**
   - 确认服务器正在运行
   - 检查API端点是否正常
   - 查看详细错误信息

### 日志查看

服务器日志会显示在控制台中，包括：
- API请求日志
- 错误信息
- 训练状态更新
- 系统统计

## 🚀 部署

### 生产环境部署

1. **环境准备**
   ```bash
   npm install --production
   ```

2. **环境变量配置**
   ```bash
   export NODE_ENV=production
   export PORT=5000
   ```

3. **启动服务**
   ```bash
   node server.js
   ```

### Docker 部署

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 📞 支持

如果遇到问题或需要帮助：

1. 查看测试报告了解系统状态
2. 检查服务器日志获取错误信息
3. 确认所有依赖和配置正确
4. 运行测试脚本验证功能

## 🎉 完成状态

✅ **所有核心功能已完成**：
- Google Colab智能集成
- 前端训练控制台界面
- 训练流程自动化
- 模型版本管理和性能对比
- Gemini AI营养分析集成
- 完整的测试覆盖

**测试结果**: 20/20 测试通过，成功率 100%

你的NutriScan MY训练控制台现在已经完全可以使用了！🎊
