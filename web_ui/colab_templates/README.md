# 🍜 NutriScan MY - Google Colab 训练模板

## 📋 模板说明

这个目录包含了用于在Google Colab中训练马来西亚食物识别模型的预配置模板。

### 🚀 快速开始

1. **选择模板**：
   - `quick_start_template.py` - 快速启动模板（推荐新手）
   - `yolov8_malaysian_food_training.ipynb` - 完整的Jupyter Notebook模板
   - `custom_training_template.py` - 自定义训练模板

2. **在Google Colab中运行**：
   - 打开 [Google Colab](https://colab.research.google.com/)
   - 上传选择的模板文件
   - 运行所有代码单元格

3. **自动配置**：
   - 自动安装所有依赖包
   - 自动下载您的Roboflow数据集
   - 自动配置训练参数

## 📊 模板特性

### ✅ 已集成功能

- **Roboflow数据集自动下载**
  - 项目ID: `projects/326667818607`
  - 自动格式转换为YOLOv8格式
  - 数据集统计和验证

- **YOLOv8模型训练**
  - 支持所有YOLOv8变体 (n/s/m/l/x)
  - 自动GPU检测和使用
  - 实时训练进度监控

- **Gemini AI营养分析**
  - 自动配置API密钥
  - 马来西亚食物营养信息分析
  - 健康建议和食用时间推荐

- **模型导出**
  - 自动导出ONNX格式
  - 自动导出TorchScript格式
  - 模型性能评估

### 🔧 配置参数

```python
TRAINING_CONFIG = {
    "model_type": "yolov8n",      # 模型类型
    "epochs": 100,                # 训练轮次
    "batch_size": 16,             # 批次大小
    "learning_rate": 0.01,        # 学习率
    "img_size": 640,              # 图像大小
    "patience": 20,               # 早停耐心值
    "save_period": 10             # 保存周期
}
```

## 🎯 使用步骤

### 1. 基础训练（推荐新手）

```bash
# 在Colab中运行
!wget https://your-dashboard.com/api/training/colab/templates/yolov8_basic/download
!python quick_start_template.py
```

### 2. 高级训练（推荐有经验用户）

```bash
# 在Colab中运行
!wget https://your-dashboard.com/api/training/colab/templates/yolov8_advanced/download
# 然后上传到Colab并运行
```

### 3. 自定义训练

```bash
# 在Colab中运行
!wget https://your-dashboard.com/api/training/colab/templates/custom_training/download
# 修改配置参数后运行
```

## 📈 训练结果

训练完成后，您将获得：

- **最佳模型文件**: `best.pt`
- **训练图表**: 损失函数、准确率、mAP等
- **模型导出文件**: ONNX、TorchScript格式
- **训练报告**: JSON格式的详细报告
- **营养分析结果**: 马来西亚食物营养信息

## 🔗 API集成

模板已预配置您的API密钥：

- **Roboflow API**: `BwTemPbP39LHLFH4teds`
- **Gemini API**: `AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8`
- **项目ID**: `projects/326667818607`

## 📱 移动端部署

训练完成后，模型可以：

1. **转换为TFLite格式**（移动端优化）
2. **部署到Android/iOS应用**
3. **集成到Web应用**
4. **API服务部署**

## 🆘 故障排除

### 常见问题

1. **GPU不可用**：
   - 在Colab中启用GPU：Runtime → Change runtime type → GPU

2. **内存不足**：
   - 减少batch_size
   - 使用更小的模型（yolov8n）

3. **API连接失败**：
   - 检查网络连接
   - 验证API密钥

4. **数据集下载失败**：
   - 检查Roboflow项目权限
   - 验证项目ID

### 获取帮助

- 查看训练日志输出
- 检查Colab控制台错误信息
- 联系技术支持

## 🎉 开始训练

现在您已经准备好开始训练您的马来西亚食物识别模型了！

选择适合您的模板，在Google Colab中运行，然后等待训练完成。您的模型将能够识别各种马来西亚美食，并提供详细的营养分析！

---

**NutriScan MY Team** 🍜
