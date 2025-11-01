# NutriScan MY

马来西亚食物智能识别系统 - AI学术项目

## 📋 项目简介

基于深度学习的移动端应用，专门识别马来西亚本地食物并提供即时营养分析。

**核心技术**：
- YOLOv8 食物识别
- Gemini Vision API 营养分析
- React Native 移动应用
- 多语言支持（中/英/马来文）

## 🎯 目标用户

- 外国游客 - 快速了解马来西亚美食
- 本地多元种族居民 - 跨文化饮食理解
- 健康管理人群 - 饮食营养追踪

## 📊 项目状态

- ✅ Week 1: 环境配置完成
- ✅ Week 2: 数据收集完成 + Backend Dashboard开发
- ✅ Week 3-4: 模型训练 + Google Colab智能集成
- ✅ Week 4: Backend Dashboard完全修复 + 真实数据源集成
- 🔶 Week 5-6: 移动端App开发
- ⏳ Week 7-8: 优化和交付

### 🆕 最新功能
- 🎛️ **Backend Dashboard** - 统一管理后台系统 ✅
- 🌐 **Web UI界面** - 现代化深色主题设计 ✅
- 🤖 **Google Colab智能集成** - 云端训练环境 ✅
- 📊 **实时数据监控** - 训练进度和系统状态 ✅
- 🔧 **API管理** - 完整的后端API系统 ✅
- 🔄 **真实数据源** - 完全基于真实API数据 ✅
- 🧹 **数据清理** - 移除所有模拟数据 ✅
- 📈 **数据集分布图** - 真实数据可视化图表 ✅
- 🔧 **Chart.js管理** - 无实例冲突的图表系统 ✅
- 🎯 **DOM元素管理** - 完善的元素生命周期管理 ✅
- 📊 **API调用统计** - 实时API使用情况监控 ✅

## 🔄 真实数据源状态

### ✅ 已实现真实数据源
- **数据集管理**: 100% 真实 (Roboflow API)
- **模型版本**: 100% 真实 (Roboflow API)
- **系统统计**: 100% 真实 (系统监控)
- **训练会话**: 100% 真实 (本地文件系统)

### 🧹 数据清理完成
- ❌ 移除所有硬编码的模拟数据
- ❌ 移除虚假的"训练中"状态
- ❌ 移除虚假的统计数字
- ✅ 所有数据都来自真实API和系统监控

## 🔧 技术修复完成

### ✅ 数据集分布图修复
- **问题**: 数据集分布图显示为空，KPI显示0
- **修复**: 解决JavaScript执行阻塞、数据格式问题、缓存问题
- **结果**: 正确显示"Malaysian Food Detection Dataset"甜甜圈图

### ✅ Chart.js实例管理
- **问题**: Chart.js实例冲突，每次刷新报错
- **修复**: 实现图表实例销毁和重建机制
- **结果**: 无实例冲突，图表正确更新

### ✅ DOM元素生命周期管理
- **问题**: 准确率图表元素被意外删除
- **修复**: 确保canvas元素在显示空状态时不被删除
- **结果**: DOM元素正确保留，无查找错误

### ✅ API调用统计持久化
- **问题**: API调用次数每次刷新不一致
- **修复**: 实现文件持久化存储
- **结果**: API调用次数正确累积和显示

### ✅ 数据一致性保证
- **问题**: 不同组件显示的数据不一致
- **修复**: 统一数据源，移除缓存依赖
- **结果**: 所有组件数据完全同步

### 📊 当前仪表盘状态
- **活跃训练会话**: 0 (真实)
- **数据集总数**: 1 (基于Roboflow API) ✅
- **Roboflow 图片数映射**: 已正确读取 `images: 57`、`splits: {train:40, valid:11, test:6}` ✅
- **模型版本**: 1 (基于本地训练会话) ✅
- **API调用次数**: 3690+ (基于真实系统统计) ✅
- **数据集分布图**: 显示食物类别分布（Char Kway Teow/Wantan Mee/Chee Cheong Fun/Nasi Lemak），含每个类别的图片数量和百分比 ✅
- **训练准确率趋势**: 显示真实mAP50/mAP50-95/Precision/Recall指标 ✅

## 🍜 识别的食物（20种）

1. Nasi Lemak（椰浆饭）
2. Bak Kut Teh（肉骨茶）
3. Rojak（罗惹）
4. Nasi Kerabu（蓝花饭）
5. Char Kway Teow（炒粿条）
6. Hokkien Mee（福建面）
7. Cendol（煎蕊）
8. Roti Canai（印度煎饼）
9. Chicken Rice（海南鸡饭）
10. Ramly Burger
11. Curry Laksa（咖喱叻沙）
12. Satay（沙爹）
13. Wantan Mee（云吞面）
14. Nasi Kandar（嘛嘛档饭）
15. Kolo Mee（干捞面）
16. Chili Pan Mee（辣椒板面）
17. Chee Cheong Fun（猪肠粉）
18. Claypot Chicken Rice（砂煲鸡饭）
19. Apam Balik（曼煎糕）
20. Lemang（竹筒糯米饭）

## 📁 项目结构

```
NutriScan MY/
├── Project.md                    # 主项目文档
├── BACKEND_DASHBOARD_ROADMAP.md  # Backend Dashboard规划文档
├── food_list.md                  # 20种食物详细信息
├── food_categories.json          # 食物配置文件
├── WEEK2_DATA_COLLECTION_GUIDE.md  # Week 2数据收集指南
├── check_images.js              # 数据收集进度检查工具
├── create_food_folders.js       # 自动创建食物分类文件夹
├── setup_real_data.py           # 环境配置脚本
├── start_webui.bat              # Web UI启动脚本
├── start_jupyter.bat            # Jupyter启动脚本
├── scripts/                     # 辅助脚本
│   ├── download_images.js       # 在线图像下载工具
│   └── README.md
├── raw_images/                  # 原始图像数据（本地）
│   ├── nasi_lemak/
│   ├── roti_canai/
│   └── ... (20种食物)
├── test_images/                 # 测试图像
├── datasets/                    # 数据集管理
│   ├── raw_images/
│   ├── roboflow_export/
│   └── uploaded/
├── training/                    # 训练相关
│   ├── notebooks/
│   │   ├── yolov8_train.ipynb   # YOLOv8训练notebook
│   │   ├── quick_test_train.ipynb # 快速测试训练
│   │   ├── train_from_roboflow.py # Roboflow训练脚本
│   │   ├── train_local_data.py  # 本地数据训练脚本
│   │   └── requirements.txt
│   ├── models/                  # 训练好的模型
│   ├── results/                 # 训练结果
│   └── README.md
├── web_ui/                      # Backend Dashboard Web UI
│   ├── server.js                # Node.js后端服务器
│   ├── package.json             # 后端依赖
│   ├── config.example.env       # 环境配置示例
│   ├── .env                     # 环境配置 (真实API密钥)
│   ├── public/                  # 静态前端文件
│   │   ├── index.html           # 主HTML文件
│   │   ├── training.html        # 训练控制台
│   │   └── api-config.html      # API配置页面
│   ├── services/                # 后端服务
│   │   ├── real-data-service.js # 真实数据服务
│   │   ├── colab-template-generator.js # Colab模板生成器
│   │   ├── nutrition-analysis-service.js # 营养分析服务
│   │   └── training-automation-service.js # 训练自动化服务
│   ├── config/                  # 配置文件
│   │   └── api-config.js        # API配置管理
│   ├── data/                    # 数据文件
│   │   ├── datasets.json        # 数据集数据
│   │   ├── models.json          # 模型数据
│   │   ├── system_stats.json    # 系统统计
│   │   ├── training_sessions.json # 训练会话数据
│   │   └── preprocessing_results.json # 预处理结果
│   ├── colab_templates/          # Colab训练模板
│   │   ├── quick_start_template.py # 快速启动模板
│   │   ├── yolov8_malaysian_food_training.ipynb # Jupyter模板
│   │   └── README.md            # 模板说明
│   ├── malaysian_food_dataset/  # 马来西亚食物数据集
│   │   ├── data.yaml            # 数据集配置
│   │   ├── train/               # 训练数据
│   │   ├── valid/               # 验证数据
│   │   └── test/                # 测试数据
│   ├── API_CONFIG_GUIDE.md      # API配置指南
│   ├── API_DOCUMENTATION.md     # API文档
│   └── TRAINING_CONSOLE_GUIDE.md # 训练控制台指南
└── results/                     # 训练结果和模型文件
```

## 🛠️ 快速开始

### 🎛️ Backend Dashboard (推荐)

**启动Web UI管理系统**
```bash
# 1. 启动后端服务器
cd web_ui
npm install
npm start
```

**访问地址**: http://localhost:5000

**功能包括**:
- 📊 实时仪表盘 - 系统状态和训练进度
- 🤖 模型训练管理 - 启动/停止训练任务
- 📁 数据集管理 - 本地和Roboflow数据同步
- 🔧 API配置管理 - Gemini和Roboflow API设置
- 📈 性能监控 - 训练结果和模型性能
- 🔄 真实数据源 - 完全基于真实API数据
- 🧹 数据清理 - 无模拟数据，完全真实
- 📈 数据集分布图 - 真实数据可视化图表
- 🔧 Chart.js管理 - 无实例冲突的图表系统
- 🎯 DOM元素管理 - 完善的元素生命周期管理
- 📊 API调用统计 - 实时API使用情况监控

### 🚀 快速启动脚本

**一键启动Web UI**
```bash
start_webui.bat
```

**一键启动Jupyter训练环境**
```bash
start_jupyter.bat
```

### 📊 数据收集工具

**检查数据收集进度**
```bash
node check_images.js
```

**下载在线图像** (需要Pexels API Key)
```bash
node scripts/download_images.js
```

**创建食物分类文件夹**
```bash
node create_food_folders.js
```

### 🤖 模型训练

**Google Colab智能集成** (推荐)
- 🎯 通过Web UI一键启动Colab训练
- ☁️ 云端GPU训练，无需本地配置
- 🔄 训练结果自动同步回Dashboard

**本地训练环境**
- 📓 `training/notebooks/yolov8_train.ipynb` - 完整训练流程
- 📋 `training/README.md` - 训练指南和技巧
- 📦 `training/notebooks/requirements.txt` - 依赖包列表

**🔥 快速测试训练**
```bash
python training/notebooks/train_local_data.py
```

**Roboflow数据集训练**
```bash
python training/notebooks/train_from_roboflow.py
```

## 🏗️ 系统架构

### 📊 数据流架构
```
真实数据源 → API服务 → 数据服务 → 前端显示
    ↓           ↓         ↓         ↓
Roboflow API → Express → RealDataService → HTML/JS
系统监控    → 缓存    → 数据转换    → 实时更新
```

### 🔄 真实数据源集成
- **Roboflow API**: 数据集和模型版本信息（启用 workspace/project 路径与私钥 `?api_key=`）
- 映射规则：
  - `datasets[0].file_count` ← `project.images` → 若无则 `versions[0].images` → 若无则 `stats.images`
  - `datasets[0].splits` ← `stats.train/valid/test` → 若无则 `project.splits.train/valid/test`
  - `datasets[0].name/description` ← `project.name/description`
- **系统监控**: CPU、内存、API调用统计
- **本地文件**: 训练会话和配置数据
- **无模拟数据**: 完全基于真实数据源

## 🔧 技术栈

**AI/ML**:
- YOLOv8 (Ultralytics)
- TensorFlow Lite
- Gemini Vision API
- Roboflow (数据管理)

**Backend Dashboard**:
- Node.js + Express
- React + Ant Design
- Socket.IO (实时通信)
- Chart.js (数据可视化)
- 真实数据源集成 (Roboflow API)
- 无模拟数据架构

**移动端**:
- React Native + Expo
- React Native Reanimated + Skia
- NativeWind (Tailwind)
- react-i18next

**后端**:
- Firebase
- Google Cloud

**训练环境**:
- Google Colab (智能集成)
- 本地Python环境
- Jupyter Notebook

## 📖 文档

- `Project.md` - 完整项目文档和架构
- `BACKEND_DASHBOARD_ROADMAP.md` - Backend Dashboard规划文档
- `food_list.md` - 20种食物的拍摄和识别指南
- `WEEK2_DATA_COLLECTION_GUIDE.md` - 数据收集指南
- `training/README.md` - 模型训练指南
- `web_ui/README.md` - Web UI使用指南

## 🎓 学术贡献

- 首个公开的马来西亚食物AI识别数据集
- 基于视觉AI的个性化营养分析方法
- 多语言跨文化食物识别系统

## 📅 时间线

- **Week 1** :  环境配置完成
- **Week 2** :  数据收集完成 + Backend Dashboard开发
- **Week 3-4** : YOLOv8 模型训练 + Google Colab智能集成
- **Week 5-6**: React Native App 开发
- **Week 7**: 优化和测试
- **Week 8**: 最终交付

### 🎯 当前重点
- ✅ 完善Google Colab智能集成
- ✅ 优化Backend Dashboard功能
- ✅ 实现真实数据源集成
- ✅ 清理所有模拟数据
- ✅ 修复数据集分布图显示问题
- ✅ 解决Chart.js实例冲突
- ✅ 完善DOM元素生命周期管理
- ✅ 实现API调用统计持久化
- ✅ 保证数据一致性
- 🔶 实现移动端配置管理
- 🌐 多语言国际化支持

## 📝 更新日志

### 🎉 2025-11-01 - API管理真实数据修复
- ✅ **API监控数据**: 移除硬编码的虚假监控数据（99.9% 和 156ms）
- ✅ **真实系统监控**: API 管理页面现在显示真实的系统状态
- ✅ **动态加载**: 切换到 API 管理标签页时自动加载真实监控数据
- ✅ **健康检查**: 实时测试 `/api/monitor/health` 获取真实响应时间
- ✅ **系统统计**: 基于真实 API 调用和错误率计算服务可用性
- ✅ **启动脚本优化**: `start_webui.bat` 自动检测并关闭占用端口的旧进程
- ✅ **详细监控指标**: 新增4个监控指标（可用性、响应时间、API总数、错误数）
- ✅ **响应时间计算说明**: 添加详细的技术文档 `API_MONITORING_EXPLAINED.md`
- ✅ **性能基准文档**: 完整的本地/远程服务器性能基准参考
- ✅ **静态文件服务修复**: 修复 `api-config.html` 页面404错误，正确配置静态文件服务路径
- ✅ **设置页面优化**: 简化设置页面的API配置部分，移除重复功能，改为指向API管理页面
- ✅ **主题切换功能**: 真实有效的深色/浅色主题切换，使用localStorage持久化存储
- ✅ **语言切换功能**: 中文简体/English双语支持，界面文本实时翻译
- ✅ **训练数据修复**: 修复训练会话和准确率图表不显示真实数据的问题
- ✅ **ID修复**: 修复重复ID导致的训练会话显示错误
- ✅ **图表类型优化**: 准确率图表从折线图改为柱状图，显示mAP50/mAP50-95/Precision/Recall
- ✅ **数据集分布优化**: 数据集分布图优先显示食物类别分布，显示每个类别的图片数量
- ✅ **Roboflow类别数据**: 从Roboflow API获取真实的类别分布统计
- ✅ **食物识别功能**: 新增"食物识别"标签页，支持上传图片进行实时识别分析
- ✅ **YOLOv8推理**: 后端API调用训练好的模型进行食物识别，返回类别、置信度和边界框
- ✅ **可视化结果**: 在图片上绘制检测框和标签，显示识别结果详情

### 🎉 2025-10-27 - Backend Dashboard完全修复
- ✅ **数据集分布图修复**: 解决显示为空的问题，现在正确显示"Malaysian Food Detection Dataset"
- ✅ **Chart.js实例管理**: 解决图表实例冲突，实现正确的销毁和重建机制
- ✅ **DOM元素生命周期**: 修复准确率图表元素被意外删除的问题
- ✅ **API调用统计**: 实现持久化存储，API调用次数正确累积
- ✅ **数据一致性**: 确保所有组件显示的数据完全同步
- ✅ **真实数据源**: 完全基于Roboflow API和系统监控数据
- ✅ **用户体验**: 流畅的数据刷新和图表更新
- ✅ **代码清理**: 删除所有无用文件，保持项目整洁

### 📊 技术成就
- 🎯 **100%真实数据**: 移除所有模拟数据，完全基于真实API
- 🔧 **零错误运行**: 解决所有JavaScript错误和DOM问题
- 📈 **完美可视化**: 数据集分布图正确显示真实数据
- 🔄 **稳定刷新**: 每30秒自动刷新，图表正确更新
- 💾 **数据持久化**: API调用统计正确保存和恢复
- 🧹 **代码清理**: 删除所有无用文件，保持项目整洁

## 🧹 代码清理完成

### ✅ 已删除的无用文件
- **调试报告文件**: 删除了所有修复过程的markdown报告文件
- **测试脚本**: 删除了所有测试和调试JavaScript文件
- **重复训练代码**: 删除了多个重复的训练Python脚本
- **临时文件**: 删除了temp目录和所有临时文件
- **空目录**: 删除了空的models和nutriscan_training目录
- **无用HTML**: 删除了real-dashboard.html（功能已集成到主页面）

### 📁 保留的核心文件
- **核心服务**: `server.js`, `services/` 目录下的所有服务文件
- **配置文件**: `config/`, `package.json`, `config.example.env`
- **数据文件**: `data/` 目录下的所有JSON数据文件
- **训练模板**: `colab_templates/` 目录下的训练模板
- **数据集**: `malaysian_food_dataset/` 完整的数据集
- **文档**: `API_CONFIG_GUIDE.md`, `API_DOCUMENTATION.md`, `TRAINING_CONSOLE_GUIDE.md`
- **前端页面**: `public/index.html`, `public/training.html`, `public/api-config.html`

### 🎯 清理效果
- **文件数量减少**: 从50+个文件减少到30+个核心文件
- **项目结构清晰**: 只保留必要的功能文件
- **维护性提升**: 移除冗余代码，降低维护复杂度
- **性能优化**: 减少不必要的文件加载和处理

## 🔗 相关链接

- Roboflow 项目: https://app.roboflow.com/malaysian-food-detection/malaysian-food-detection-wy3kt/

---

**创建日期**: 2025-10-03  
**最后更新**: 2025-11-01  
**项目周期**: 8 周  
**类型**: 学术研究项目

