# 🎯 模型准确率提升指南

## 📊 当前模型状态

**模型配置：**
- 模型类型：YOLOv8n (nano - 最小版本)
- 训练轮次：100 epochs
- 批次大小：16
- 学习率：0.01
- 图像大小：640x640

**当前指标：**
- mAP50: 0.995 (很高)
- mAP50-95: 0.79 (中等)
- Precision: 0.98
- Recall: 0.99

**问题：**
- Wantan Mee 被误识别为 Char Kway Teow
- 两个类别外观相似，需要更多区分性数据

---

## 🚀 提升准确率的方法（按优先级排序）

### 1. 📸 增加训练数据量（最重要）

**问题根源：**
Wantan Mee 和 Char Kway Teow 在外观上非常相似，需要更多样本来帮助模型学习它们之间的细微差别。

**具体行动：**

#### 1.1 增加 Wantan Mee 样本
- **目标：** 至少增加到 100-200 张 Wantan Mee 图片
- **策略：**
  - 收集不同角度的照片（俯视、侧面、近景、远景）
  - 不同餐厅/店铺的 Wantan Mee（不同制作风格）
  - 不同配菜组合（有些有叉烧，有些有云吞）
  - 不同光照条件（自然光、室内光、餐厅灯光）
  - 不同背景（不同盘子、桌面、环境）

#### 1.2 增加 Char Kway Teow 样本
- **目标：** 确保 Char Kway Teow 样本数量与 Wantan Mee 接近
- **重点：**
  - 突出 Char Kway Teow 的特征（通常更黑、更多酱油色）
  - 不同地区的制作风格（槟城式、KL式等）

#### 1.3 平衡数据集
- **目标：** 三个类别（Wantan Mee、Char Kway Teow、Chee Cheong Fun）的数量尽可能平衡
- **当前建议分布：**
  ```
  Wantan Mee: 40%
  Char Kway Teow: 40%
  Chee Cheong Fun: 20%
  ```

**如何操作：**
1. 登录 [Roboflow](https://app.roboflow.com/)
2. 进入你的项目：`malaysian-food-detection`
3. 上传更多 Wantan Mee 和 Char Kway Teow 图片
4. 仔细标注每一张图片（确保边界框准确）

---

### 2. ✅ 提高数据标注质量

**常见标注问题：**
- 边界框太大（包含了盘子边缘、背景）
- 边界框太小（漏掉了部分食物）
- 标签错误（Wantan Mee 标注成 Char Kway Teow）

**标注最佳实践：**

#### 2.1 边界框要求
- ✅ **准确框选：** 只框住食物本身，不包括盘子边缘
- ✅ **完整包含：** 确保所有主要部分都在框内
- ❌ **避免过大：** 不要包含太多背景或盘子

#### 2.2 标签检查
- 逐一检查容易混淆的样本
- 如果一张图片既有 Wantan Mee 又有 Char Kway Teow，分别标注两个框

#### 2.3 质量控制
- 在 Roboflow 中创建一个 "Review" 阶段
- 让第二个人复查标注
- 标记有疑问的样本，重新审查

**如何操作：**
1. 在 Roboflow 中打开"Annotate"标签
2. 逐个检查已标注的图片
3. 修正不准确的边界框
4. 确保标签正确

---

### 3. 🤖 升级模型类型（简单有效）

**当前：** YOLOv8n (nano) - 最小、最快、但准确率较低
**建议升级到：** YOLOv8s (small) 或 YOLOv8m (medium)

**各模型对比：**
| 模型 | 参数量 | 速度 | 准确率 | 推荐场景 |
|------|--------|------|--------|----------|
| yolov8n | ~3M | 最快 | 最低 | 移动端、实时推理 |
| yolov8s | ~11M | 快 | 中等 | **推荐开始** ⭐ |
| yolov8m | ~26M | 中等 | 高 | 更高准确率需求 |
| yolov8l | ~44M | 慢 | 很高 | 高精度应用 |
| yolov8x | ~68M | 最慢 | 最高 | 追求极致准确率 |

**修改方法：**
在训练模板中修改：
```python
TRAINING_CONFIG = {
    "model_type": "yolov8s",  # 改为 yolov8s 或 yolov8m
    "epochs": 150,            # 增加到 150-200
    "batch_size": 16,
    "learning_rate": 0.01,
    "img_size": 640,
    "patience": 30,           # 增加到 30
    "save_period": 10
}
```

---

### 4. ⚙️ 优化训练参数

#### 4.1 增加训练轮次
```python
"epochs": 150,  # 从 100 增加到 150-200
```
- 给模型更多学习机会
- 注意观察验证集指标，避免过拟合

#### 4.2 调整学习率
```python
"learning_rate": 0.005,  # 从 0.01 降低到 0.005
```
- 更小的学习率让模型学习更细致
- 适合区分相似类别

#### 4.3 增加早停耐心值
```python
"patience": 30,  # 从 20 增加到 30
```
- 给模型更多时间改善

#### 4.4 使用学习率调度
在训练参数中添加：
```python
train_args = {
    # ... 其他参数 ...
    "lr0": 0.01,          # 初始学习率
    "lrf": 0.01,          # 最终学习率（相对于初始）
    "warmup_epochs": 3,   # 预热轮次
    "warmup_momentum": 0.8,
    "warmup_bias_lr": 0.1,
}
```

---

### 5. 🔄 增强数据（Data Augmentation）

YOLOv8 默认会应用一些数据增强，但可以手动配置更激进的增强策略：

```python
train_args = {
    # ... 其他参数 ...
    "hsv_h": 0.015,      # 色调增强
    "hsv_s": 0.7,        # 饱和度增强
    "hsv_v": 0.4,        # 明度增强
    "degrees": 10,       # 旋转角度（-10 到 +10 度）
    "translate": 0.1,    # 平移
    "scale": 0.5,        # 缩放
    "flipud": 0.0,       # 上下翻转概率（食物一般不用）
    "fliplr": 0.5,       # 左右翻转概率
    "mosaic": 1.0,       # Mosaic 增强概率
    "mixup": 0.1,        # Mixup 增强概率
}
```

**注意事项：**
- 对于食物图片，避免上下翻转（flipud）
- 适度使用旋转（不要超过 15 度）
- Mosaic 和 Mixup 有助于提高鲁棒性

---

### 6. 📈 分析混淆矩阵

训练完成后，查看混淆矩阵（confusion matrix）：

1. **找到混淆矩阵图片：**
   ```
   nutriscan_training/malaysian_food_yolov8n_xxx/confusion_matrix.png
   ```

2. **分析混淆：**
   - 看 Wantan Mee 和 Char Kway Teow 之间的混淆值
   - 找出哪些样本最容易被误识别

3. **针对性改进：**
   - 收集更多容易混淆的样本
   - 重新标注有问题的样本

---

### 7. 🎯 针对性的改进策略

#### 策略 A：快速提升（推荐先试）
1. ✅ 升级到 `yolov8s`
2. ✅ 增加训练轮次到 150
3. ✅ 降低学习率到 0.005
4. ⏱️ 预计时间：2-3 小时训练

#### 策略 B：数据驱动（最有效但需要时间）
1. ✅ 收集 50-100 张 Wantan Mee 新图片
2. ✅ 收集 50-100 张 Char Kway Teow 新图片
3. ✅ 仔细标注所有新图片
4. ✅ 重新训练模型
5. ⏱️ 预计时间：标注 2-3 小时 + 训练 2-3 小时

#### 策略 C：综合优化（最佳效果）
1. ✅ 结合策略 A 和 B
2. ✅ 升级到 `yolov8m`（如果计算资源允许）
3. ✅ 调整数据增强参数
4. ⏱️ 预计时间：5-6 小时

---

### 8. 📝 训练模板修改示例

完整的高准确率训练配置：

```python
TRAINING_CONFIG = {
    "model_type": "yolov8s",        # 升级模型
    "epochs": 200,                   # 增加轮次
    "batch_size": 16,                # 根据GPU内存调整
    "learning_rate": 0.005,          # 降低学习率
    "img_size": 640,
    "patience": 40,                  # 增加耐心值
    "save_period": 10
}

train_args = {
    "data": os.path.join(dataset.location, "data.yaml"),
    "epochs": TRAINING_CONFIG["epochs"],
    "batch": TRAINING_CONFIG["batch_size"],
    "imgsz": TRAINING_CONFIG["img_size"],
    "lr0": TRAINING_CONFIG["learning_rate"],
    "lrf": 0.01,                     # 学习率衰减
    "patience": TRAINING_CONFIG["patience"],
    "save_period": TRAINING_CONFIG["save_period"],
    
    # 数据增强
    "hsv_h": 0.015,
    "hsv_s": 0.7,
    "hsv_v": 0.4,
    "degrees": 10,
    "translate": 0.1,
    "scale": 0.5,
    "fliplr": 0.5,
    "mosaic": 1.0,
    "mixup": 0.1,
    
    # 其他参数
    "project": OUTPUT_DIR,
    "name": f"malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "exist_ok": True,
    "device": 0,
    "workers": 4,
    "verbose": True
}
```

---

## 🔍 验证改进效果

### 训练后检查：

1. **查看训练曲线：**
   - `results.png` - 整体训练曲线
   - `BoxP_curve.png` - Precision 曲线
   - `BoxR_curve.png` - Recall 曲线
   - `BoxF1_curve.png` - F1 分数曲线

2. **查看混淆矩阵：**
   - `confusion_matrix.png` - 看类别间混淆情况
   - `confusion_matrix_normalized.png` - 归一化版本

3. **测试集评估：**
   - 使用 `val_batch0_pred.jpg` 查看验证集预测结果
   - 手动测试容易混淆的图片

4. **实际使用测试：**
   - 上传 Wantan Mee 图片，看是否能正确识别
   - 上传 Char Kway Teow 图片，确认不会误识别

---

## 📋 改进检查清单

- [ ] **数据层面**
  - [ ] 增加 Wantan Mee 样本（目标：100+ 张）
  - [ ] 增加 Char Kway Teow 样本（目标：100+ 张）
  - [ ] 检查并修正现有标注错误
  - [ ] 确保三个类别数据平衡

- [ ] **模型层面**
  - [ ] 升级到 yolov8s 或 yolov8m
  - [ ] 增加训练轮次到 150-200
  - [ ] 降低学习率到 0.005

- [ ] **训练参数**
  - [ ] 调整数据增强参数
  - [ ] 增加早停耐心值
  - [ ] 配置学习率调度

- [ ] **验证与测试**
  - [ ] 查看混淆矩阵分析问题
  - [ ] 手动测试容易混淆的样本
  - [ ] 记录改进前后的准确率对比

---

## 🎓 持续改进建议

1. **建立测试集：**
   - 保留一些真实的 Wantan Mee 和 Char Kway Teow 图片作为测试集
   - 每次模型更新后都用这个测试集验证

2. **记录误识别样本：**
   - 收集被误识别的图片
   - 分析为什么会被误识别
   - 将这些样本加入训练集

3. **定期重新训练：**
   - 每次增加新数据后重新训练
   - 比较不同模型配置的效果
   - 选择最佳配置保存

---

## 💡 快速开始

**如果你想立即尝试提升准确率，按以下顺序操作：**

1. **最简单（5分钟）：**
   - 修改训练模板中的 `model_type` 从 `yolov8n` 改为 `yolov8s`
   - 重新训练模型

2. **中等难度（1-2小时）：**
   - 在 Roboflow 中上传 20-30 张 Wantan Mee 新图片
   - 仔细标注
   - 使用 `yolov8s` 重新训练

3. **最佳效果（3-5小时）：**
   - 上传 50+ 张 Wantan Mee 和 Char Kway Teow 新图片
   - 使用优化后的训练参数
   - 使用 `yolov8m` 模型训练

---

**记住：** 数据质量 > 数据数量 > 模型大小 > 训练参数

最重要的是收集更多高质量、正确标注的 Wantan Mee 和 Char Kway Teow 图片！

