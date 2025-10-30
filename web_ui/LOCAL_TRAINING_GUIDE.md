# NutriScan MY - 本地训练环境设置

## 🚀 快速开始

### 1. 安装依赖
```bash
pip install ultralytics roboflow torch torchvision
```

### 2. 运行训练
```bash
python local_training.py
```

## 📋 训练流程

1. **自动下载**: 从 Roboflow 下载你的马来西亚食物数据集
2. **模型训练**: 使用 YOLOv8n 预训练模型进行训练
3. **模型验证**: 自动验证训练结果
4. **模型导出**: 导出为 ONNX、TorchScript、TFLite 格式

## 🎯 优势

- ✅ **本地训练**: 不需要 Colab，完全控制
- ✅ **GPU 加速**: 使用本地 GPU 训练更快
- ✅ **实时监控**: 可以随时查看训练进度
- ✅ **多格式导出**: 支持多种部署格式

## 📊 训练参数

- **模型**: YOLOv8n (轻量级)
- **数据集**: 137张马来西亚食物图片
- **轮次**: 100 epochs
- **批次**: 16
- **图像尺寸**: 640x640

## 🔧 自定义训练

修改 `local_training.py` 中的参数：

```python
# 训练参数
epochs = 100      # 训练轮次
batch = 16        # 批次大小
imgsz = 640       # 图像尺寸
device = '0'      # GPU 设备
```

## 📁 输出文件

训练完成后会生成：

- `nutriscan_training/` - 训练结果目录
- `best.pt` - 最佳模型权重
- `last.pt` - 最后轮次权重
- `results.png` - 训练曲线图
- `confusion_matrix.png` - 混淆矩阵
- `training_results.json` - 训练信息

## 🚀 部署

训练完成后，你可以：

1. **移动端**: 使用 TFLite 格式
2. **Web端**: 使用 ONNX 格式
3. **服务器**: 使用 PyTorch 格式

## 💡 提示

- 确保有足够的 GPU 内存 (建议 8GB+)
- 训练时间约 2-4 小时 (取决于硬件)
- 可以随时中断训练，会自动保存检查点

