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
- 🔶 Week 3-4: 模型训练 + Google Colab智能集成
- ⏳ Week 5-6: 移动端App开发
- ⏳ Week 7-8: 优化和交付

### 🆕 新增功能
- 🎛️ **Backend Dashboard** - 统一管理后台系统
- 🌐 **Web UI界面** - 现代化深色主题设计
- 🤖 **Google Colab智能集成** - 云端训练环境
- 📊 **实时数据监控** - 训练进度和系统状态
- 🔧 **API管理** - 完整的后端API系统

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
│   └── client/                  # React前端
│       ├── src/
│       │   ├── App.js           # 主应用组件
│       │   ├── components/      # 通用组件
│       │   └── pages/           # 页面组件
│       │       ├── Dashboard.js # 仪表盘
│       │       ├── Training.js  # 训练管理
│       │       ├── Models.js    # 模型管理
│       │       ├── Datasets.js  # 数据集管理
│       │       ├── API.js       # API管理
│       │       └── Settings.js  # 系统设置
│       └── package.json         # 前端依赖
└── results/                     # 训练结果和模型文件
```

## 🛠️ 快速开始

### 🎛️ Backend Dashboard (推荐)

**启动Web UI管理系统**
```bash
# 1. 启动后端服务器
cd web_ui
npm install
node server.js

# 2. 启动前端界面
cd client
npm install
npm start
```

**访问地址**: http://localhost:3000

**功能包括**:
- 📊 实时仪表盘 - 系统状态和训练进度
- 🤖 模型训练管理 - 启动/停止训练任务
- 📁 数据集管理 - 本地和Roboflow数据同步
- 🔧 API配置管理 - Gemini和Roboflow API设置
- 📈 性能监控 - 训练结果和模型性能

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
- 🤖 完善Google Colab智能集成
- 📊 优化Backend Dashboard功能
- 🔧 实现移动端配置管理
- 🌐 多语言国际化支持

## 🔗 相关链接

- Roboflow 项目: https://app.roboflow.com/malaysian-food-detection/malaysian-food-detection-wy3kt/

---

**创建日期**: 2025-10-03  
**项目周期**: 8 周  
**类型**: 学术研究项目

