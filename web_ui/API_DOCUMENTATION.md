# NutriScan Backend Dashboard API 文档

## 📋 概述

本文档详细说明了NutriScan Backend Dashboard的所有API接口，包括Google Colab智能集成、数据集管理、模型训练等功能。

## 🔧 基础配置

**Base URL**: `http://localhost:5000/api`  
**Content-Type**: `application/json`  
**认证方式**: 暂未实现，后续版本将添加JWT认证

## 🚀 Google Colab 智能集成 API

### 1. 启动Colab训练
```http
POST /api/training/colab/launch
```

**请求体**:
```json
{
  "dataset_id": "dataset_123",
  "model_config": {
    "model_type": "yolov8n",
    "epochs": 100,
    "batch_size": 16,
    "learning_rate": 0.01,
    "img_size": 640
  },
  "training_params": {
    "augment": true,
    "optimizer": "AdamW",
    "loss_function": "focal_loss"
  }
}
```

**响应**:
```json
{
  "success": true,
  "session_id": "session_456",
  "colab_url": "https://colab.research.google.com/drive/your-template-id?session_id=session_456",
  "message": "Colab训练会话已创建"
}
```

### 2. 获取训练状态
```http
GET /api/training/colab/status/:sessionId
```

**响应**:
```json
{
  "success": true,
  "session": {
    "id": "session_456",
    "status": "training",
    "progress": 45,
    "dataset_id": "dataset_123",
    "model_config": {...},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:15:00Z",
    "colab_url": "https://colab.research.google.com/drive/...",
    "logs": [
      {
        "timestamp": "2024-01-15T11:15:00Z",
        "level": "info",
        "message": "Epoch 45/100 completed"
      }
    ],
    "metrics": {
      "accuracy": 0.89,
      "loss": 0.12,
      "precision": 0.87,
      "recall": 0.91
    }
  }
}
```

### 3. 接收训练结果
```http
POST /api/training/colab/result
```

**请求体**:
```json
{
  "session_id": "session_456",
  "status": "completed",
  "progress": 100,
  "logs": [
    {
      "timestamp": "2024-01-15T12:00:00Z",
      "level": "info",
      "message": "Training completed successfully"
    }
  ],
  "model_path": "/content/drive/MyDrive/models/best.pt",
  "metrics": {
    "final_accuracy": 0.92,
    "final_loss": 0.08,
    "training_time": "2h 30m",
    "best_epoch": 87
  }
}
```

### 4. 获取Colab模板列表
```http
GET /api/training/colab/templates
```

**响应**:
```json
{
  "success": true,
  "templates": [
    {
      "id": "yolov8_basic",
      "name": "YOLOv8 基础训练",
      "description": "适用于马来西亚食物识别的YOLOv8基础训练模板",
      "url": "https://colab.research.google.com/drive/yolov8-basic-template",
      "parameters": ["epochs", "batch_size", "learning_rate", "img_size"]
    },
    {
      "id": "yolov8_advanced",
      "name": "YOLOv8 高级训练",
      "description": "包含数据增强和超参数优化的高级训练模板",
      "url": "https://colab.research.google.com/drive/yolov8-advanced-template",
      "parameters": ["epochs", "batch_size", "learning_rate", "img_size", "augment", "optimizer"]
    }
  ]
}
```

### 5. 配置训练参数
```http
POST /api/training/colab/config
```

**请求体**:
```json
{
  "session_id": "session_456",
  "config": {
    "epochs": 150,
    "batch_size": 32,
    "learning_rate": 0.005,
    "img_size": 640,
    "augment": true,
    "optimizer": "AdamW"
  }
}
```

### 6. 停止训练
```http
POST /api/training/colab/stop/:sessionId
```

## 📊 数据集管理 API

### 1. 获取数据集列表
```http
GET /api/datasets
```

**响应**:
```json
{
  "success": true,
  "datasets": [
    {
      "id": "dataset_123",
      "name": "Malaysian Food Dataset v1",
      "description": "包含20种马来西亚食物的数据集",
      "type": "yolo",
      "source": "roboflow",
      "status": "ready",
      "created_at": "2024-01-10T09:00:00Z",
      "file_count": 1000,
      "total_size": "2.5GB"
    }
  ]
}
```

### 2. 上传数据集
```http
POST /api/datasets/upload
```

**请求体**:
```json
{
  "name": "Custom Dataset",
  "description": "用户自定义数据集",
  "type": "yolo",
  "source": "local"
}
```

### 3. 同步Roboflow数据
```http
POST /api/datasets/sync
```

**请求体**:
```json
{
  "roboflow_project_id": "malaysian-food-detection/1",
  "dataset_name": "Malaysian Food Dataset"
}
```

### 4. 数据集分析
```http
GET /api/datasets/analyze/:datasetId
```

**响应**:
```json
{
  "success": true,
  "analysis": {
    "total_images": 1000,
    "classes": 20,
    "class_distribution": {
      "nasi_lemak": 50,
      "roti_canai": 45,
      "char_kway_teow": 40
    },
    "image_quality": {
      "high": 800,
      "medium": 150,
      "low": 50
    },
    "average_size": "1024x768",
    "format_distribution": {
      "jpg": 70,
      "png": 25,
      "webp": 5
    }
  }
}
```

## 🤖 模型管理 API

### 1. 获取模型版本
```http
GET /api/models/versions
```

**响应**:
```json
{
  "success": true,
  "models": [
    {
      "id": "model_v1",
      "name": "YOLOv8n Malaysian Food",
      "version": "1.0.0",
      "accuracy": 0.89,
      "created_at": "2024-01-15T12:00:00Z",
      "status": "active",
      "file_size": "6.2MB"
    }
  ]
}
```

### 2. 部署模型
```http
POST /api/training/deploy
```

**请求体**:
```json
{
  "model_id": "model_v1",
  "deployment_type": "mobile",
  "target_platform": "android"
}
```

### 3. 模型性能对比
```http
GET /api/models/compare?model_ids=model_v1,model_v2
```

**响应**:
```json
{
  "success": true,
  "comparison": {
    "models": [
      {
        "id": "model_v1",
        "name": "YOLOv8n",
        "accuracy": 0.85,
        "inference_time": 15,
        "model_size": 6.2
      },
      {
        "id": "model_v2",
        "name": "YOLOv8s",
        "accuracy": 0.89,
        "inference_time": 22,
        "model_size": 21.5
      }
    ],
    "metrics": ["accuracy", "inference_time", "model_size"]
  }
}
```

## 📈 系统监控 API

### 1. API统计
```http
GET /api/monitor/stats
```

**响应**:
```json
{
  "success": true,
  "stats": {
    "api_calls": 1250,
    "errors": 5,
    "uptime": 86400,
    "active_sessions": 3,
    "memory_usage": "256MB",
    "cpu_usage": "15%"
  }
}
```

### 2. 健康检查
```http
GET /api/monitor/health
```

**响应**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-15T12:00:00Z",
  "version": "1.0.0"
}
```

### 3. 错误日志
```http
GET /api/monitor/logs?level=error&limit=50
```

**响应**:
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_123",
      "level": "error",
      "message": "Training session failed",
      "timestamp": "2024-01-15T11:30:00Z",
      "source": "colab_integration"
    }
  ]
}
```

## 🔧 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**常见错误代码**:
- `INVALID_PARAMETERS`: 参数无效
- `SESSION_NOT_FOUND`: 训练会话不存在
- `DATASET_NOT_FOUND`: 数据集不存在
- `TRAINING_FAILED`: 训练失败
- `UPLOAD_FAILED`: 上传失败

## 📝 使用示例

### 完整的训练流程示例

```javascript
// 1. 启动Colab训练
const launchResponse = await fetch('/api/training/colab/launch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataset_id: 'dataset_123',
    model_config: {
      model_type: 'yolov8n',
      epochs: 100,
      batch_size: 16
    }
  })
});

const { session_id, colab_url } = await launchResponse.json();

// 2. 打开Colab链接
window.open(colab_url, '_blank');

// 3. 定期检查训练状态
const checkStatus = async () => {
  const response = await fetch(`/api/training/colab/status/${session_id}`);
  const { session } = await response.json();
  
  console.log(`训练进度: ${session.progress}%`);
  console.log(`状态: ${session.status}`);
  
  if (session.status === 'completed') {
    console.log('训练完成！');
    console.log('模型准确率:', session.metrics.final_accuracy);
  }
};

// 每30秒检查一次状态
setInterval(checkStatus, 30000);
```

## 🚀 快速开始

1. **安装依赖**:
```bash
cd web_ui
npm install
```

2. **配置环境**:
```bash
cp config.example.env .env
# 编辑.env文件，填入你的API密钥
```

3. **启动服务器**:
```bash
npm start
```

4. **测试API**:
```bash
curl http://localhost:5000/api/monitor/health
```

---

**文档版本**: v1.0  
**最后更新**: 2024年1月  
**维护者**: NutriScan开发团队
