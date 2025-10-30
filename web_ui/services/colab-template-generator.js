/**
 * 🍜 NutriScan MY - Google Colab 模板生成器 (简化版)
 * 生成无JSON语法错误的训练模板
 */

class ColabTemplateGenerator {
    constructor() {
        this.templateBase = this.getBaseTemplate();
    }

    /**
     * 生成包含用户配置的Colab模板
     */
    generateTemplate(trainingConfig) {
        const config = {
            model_type: trainingConfig.model_type || 'yolov8n',
            epochs: trainingConfig.epochs || 100,
            batch_size: trainingConfig.batch_size || 16,
            learning_rate: trainingConfig.learning_rate || 0.01,
            img_size: trainingConfig.img_size || 640,
            patience: trainingConfig.patience || 20,
            save_period: trainingConfig.save_period || 10,
            session_id: trainingConfig.session_id || this.generateSessionId(),
            dashboard_url: trainingConfig.dashboard_url || 'http://localhost:5000',
            dataset_id: trainingConfig.dataset_id || 'default_dataset',
            augment: trainingConfig.augment || true,
            optimizer: trainingConfig.optimizer || 'AdamW',
            loss_function: trainingConfig.loss_function || 'BCE'
        };

        // 根据模型类型调整默认参数
        if (config.model_type === 'yolov8s') {
            config.batch_size = Math.min(config.batch_size, 12);
            config.learning_rate = Math.min(config.learning_rate, 0.005);
        } else if (config.model_type === 'yolov8m') {
            config.batch_size = Math.min(config.batch_size, 8);
            config.learning_rate = Math.min(config.learning_rate, 0.003);
        }

        return this.templateBase
            .replace(/{{MODEL_TYPE}}/g, config.model_type)
            .replace(/{{EPOCHS}}/g, config.epochs)
            .replace(/{{BATCH_SIZE}}/g, config.batch_size)
            .replace(/{{LEARNING_RATE}}/g, config.learning_rate)
            .replace(/{{IMG_SIZE}}/g, config.img_size)
            .replace(/{{PATIENCE}}/g, config.patience)
            .replace(/{{SAVE_PERIOD}}/g, config.save_period)
            .replace(/{{SESSION_ID}}/g, config.session_id)
            .replace(/{{DASHBOARD_URL}}/g, config.dashboard_url)
            .replace(/{{DATASET_ID}}/g, config.dataset_id)
            .replace(/{{AUGMENT}}/g, config.augment ? 'True' : 'False')
            .replace(/{{OPTIMIZER}}/g, config.optimizer)
            .replace(/{{LOSS_FUNCTION}}/g, config.loss_function);
    }

    /**
     * 生成会话ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取基础模板 - 使用简化的JSON结构
     */
    getBaseTemplate() {
        return `{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {
    "id": "nutriscan_header"
   },
   "source": [
    "# 🍜 NutriScan MY - 马来西亚食物识别模型训练\\n",
    "\\n",
    "## 📋 训练配置\\n",
    "- **会话ID**: {{SESSION_ID}}\\n",
    "- **模型类型**: {{MODEL_TYPE}}\\n",
    "- **训练轮次**: {{EPOCHS}}\\n",
    "- **批次大小**: {{BATCH_SIZE}}\\n",
    "- **学习率**: {{LEARNING_RATE}}\\n",
    "- **图像大小**: {{IMG_SIZE}}\\n",
    "\\n",
    "---\\n",
    "\\n",
    "## 🚀 自动配置完成，点击运行所有单元格开始训练！"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "install_dependencies"
   },
   "outputs": [],
   "source": [
    "# 🔧 安装依赖包\\n",
    "!pip install ultralytics torch torchvision matplotlib seaborn pandas numpy requests --quiet\\n",
    "print('✅ 依赖包安装完成！')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "import_libraries"
   },
   "outputs": [],
   "source": [
    "# 📚 导入库\\n",
    "import os\\n",
    "import json\\n",
    "import time\\n",
    "import requests\\n",
    "from datetime import datetime\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "import pandas as pd\\n",
    "import numpy as np\\n",
    "\\n",
    "# YOLOv8\\n",
    "from ultralytics import YOLO\\n",
    "\\n",
    "print('✅ 库导入完成！')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "config_parameters"
   },
   "outputs": [],
   "source": [
    "# ⚙️ 配置参数 - 来自Dashboard\\n",
    "SESSION_ID = '{{SESSION_ID}}'\\n",
    "DASHBOARD_URL = '{{DASHBOARD_URL}}'\\n",
    "\\n",
    "# 训练配置 - 从Dashboard传递\\n",
    "TRAINING_CONFIG = {\\n",
    "    'model_type': '{{MODEL_TYPE}}',\\n",
    "    'epochs': {{EPOCHS}},\\n",
    "    'batch_size': {{BATCH_SIZE}},\\n",
    "    'learning_rate': {{LEARNING_RATE}},\\n",
    "    'img_size': {{IMG_SIZE}},\\n",
    "    'patience': {{PATIENCE}},\\n",
    "    'save_period': {{SAVE_PERIOD}},\\n",
    "    'augment': {{AUGMENT}},\\n",
    "    'optimizer': '{{OPTIMIZER}}',\\n",
    "    'loss_function': '{{LOSS_FUNCTION}}'\\n",
    "}\\n",
    "\\n",
    "# 输出目录\\n",
    "OUTPUT_DIR = f'/content/nutriscan_training_{SESSION_ID}'\\n",
    "os.makedirs(OUTPUT_DIR, exist_ok=True)\\n",
    "\\n",
    "print('✅ 配置参数设置完成！')\\n",
    "print(f'📊 训练配置: {TRAINING_CONFIG}')\\n",
    "print(f'🆔 会话ID: {SESSION_ID}')\\n",
    "print(f'📁 输出目录: {OUTPUT_DIR}')\\n",
    "\\n",
    "# 通知Dashboard训练开始\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'started', 'timestamp': datetime.now().isoformat(), 'config': TRAINING_CONFIG})\\n",
    "    print('✅ 已通知Dashboard训练开始')\\n",
    "except:\\n",
    "    print('⚠️ 无法连接到Dashboard，继续训练...')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "download_roboflow_dataset"
   },
   "outputs": [],
   "source": [
    "# 📊 从Roboflow下载马来西亚食物数据集\\n",
    "print('🔗 从Roboflow下载马来西亚食物数据集...')\\n",
    "\\n",
    "# 安装Roboflow\\n",
    "!pip install roboflow --quiet\\n",
    "\\n",
    "# 导入Roboflow\\n",
    "from roboflow import Roboflow\\n",
    "\\n",
    "# Roboflow配置 - 使用正确的项目信息\\n",
    "ROBOFLOW_API_KEY = 'BwTemPbP39LHLFH4teds'\\n",
    "ROBOFLOW_PROJECT_ID = 'malaysian-food-detection-wy3kt'\\n",
    "ROBOFLOW_WORKSPACE = 'malaysian-food-detection'\\n",
    "\\n",
    "print('🔗 连接到Roboflow项目...')\\n",
    "rf = Roboflow(api_key=ROBOFLOW_API_KEY)\\n",
    "project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT_ID)\\n",
    "\\n",
    "# 检查项目版本\\n",
    "print('📋 检查项目版本...')\\n",
    "try:\\n",
    "    versions = project.list_versions()\\n",
    "    print(f'可用版本: {versions}')\\n",
    "    \\n",
    "    # 使用最新版本\\n",
    "    if versions and len(versions) > 0:\\n",
    "        # 获取版本号（从id中提取数字）\\n",
    "        version_numbers = []\\n",
    "        for v in versions:\\n",
    "            if 'id' in v:\\n",
    "                version_id = v['id']\\n",
    "                # 提取版本号，例如从 'malaysian-food-detection/malaysian-food-detection-wy3kt/2' 提取 '2'\\n",
    "                if '/' in version_id:\\n",
    "                    version_num = version_id.split('/')[-1]\\n",
    "                    try:\\n",
    "                        version_numbers.append(int(version_num))\\n",
    "                    except ValueError:\\n",
    "                        continue\\n",
    "        \\n",
    "        if version_numbers:\\n",
    "            version_number = max(version_numbers)\\n",
    "            print(f'使用版本: {version_number}')\\n",
    "        else:\\n",
    "            print('⚠️ 无法解析版本号，尝试使用版本2')\\n",
    "            version_number = 2\\n",
    "    else:\\n",
    "        print('⚠️ 没有找到版本，尝试使用版本2')\\n",
    "        version_number = 2\\n",
    "except Exception as e:\\n",
    "    print(f'⚠️ 版本检查失败: {str(e)}')\\n",
    "    print('使用默认版本2')\\n",
    "    version_number = 2\\n",
    "\\n",
    "print('📥 下载数据集...')\\n",
    "try:\\n",
    "    dataset = project.version(version_number).download('yolov8')\\n",
    "    print(f'✅ 数据集下载完成！')\\n",
    "    print(f'📁 数据集路径: {dataset.location}')\\n",
    "except Exception as e:\\n",
    "    print(f'❌ 下载失败: {str(e)}')\\n",
    "    print('\\n💡 请检查以下内容:')\\n",
    "    print('1. Roboflow项目ID是否正确')\\n",
    "    print('2. API密钥是否有效')\\n",
    "    print('3. 项目是否有可用的版本')\\n",
    "    print('4. 网络连接是否正常')\\n",
    "    raise e\\n",
    "\\n",
    "# 统计数据集\\n",
    "def count_files(directory):\\n",
    "    if os.path.exists(directory):\\n",
    "        images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])\\n",
    "        labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])\\n",
    "        return images, labels\\n",
    "    return 0, 0\\n",
    "\\n",
    "train_path = os.path.join(dataset.location, 'train')\\n",
    "val_path = os.path.join(dataset.location, 'valid')\\n",
    "test_path = os.path.join(dataset.location, 'test')\\n",
    "\\n",
    "train_images, train_labels = count_files(train_path)\\n",
    "val_images, val_labels = count_files(val_path)\\n",
    "test_images, test_labels = count_files(test_path)\\n",
    "\\n",
    "dataset_stats = {\\n",
    "    'train_images': train_images,\\n",
    "    'val_images': val_images,\\n",
    "    'test_images': test_images,\\n",
    "    'total_images': train_images + val_images + test_images,\\n",
    "    'dataset_path': dataset.location,\\n",
    "    'source': 'roboflow',\\n",
    "    'version': version_number\\n",
    "}\\n",
    "\\n",
    "print('\\n📊 数据集统计:')\\n",
    "print(f'  训练集: {train_images} 张图片, {train_labels} 个标签文件')\\n",
    "print(f'  验证集: {val_images} 张图片, {val_labels} 个标签文件')\\n",
    "print(f'  测试集: {test_images} 张图片, {test_labels} 个标签文件')\\n",
    "print(f'  总计: {dataset_stats[\\\"total_images\\\"]} 张图片')\\n",
    "print(f'  来源: Roboflow (专业标注)')\\n",
    "print(f'  项目: {ROBOFLOW_PROJECT_ID}')\\n",
    "print(f'  版本: {version_number}')\\n",
    "\\n",
    "# 通知Dashboard数据集信息\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'dataset_ready', 'dataset_stats': dataset_stats})\\n",
    "except:\\n",
    "    pass"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "initialize_model"
   },
   "outputs": [],
   "source": [
    "# 🤖 初始化YOLOv8模型\\n",
    "print('🤖 初始化YOLOv8模型...')\\n",
    "model_type = TRAINING_CONFIG['model_type']\\n",
    "model = YOLO(f'{model_type}.pt')\\n",
    "\\n",
    "print(f'✅ YOLOv8模型初始化完成: {model_type}')\\n",
    "print(f'📊 模型参数: {sum(p.numel() for p in model.model.parameters())} 个参数')\\n",
    "\\n",
    "# 通知Dashboard模型初始化完成\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'model_ready', 'model_type': model_type})\\n",
    "except:\\n",
    "    pass"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "start_training"
   },
   "outputs": [],
   "source": [
    "# 🚀 开始训练\\n",
    "print('🚀 开始模型训练...')\\n",
    "print(f'⏰ 开始时间: {datetime.now().strftime(\\\"%Y-%m-%d %H:%M:%S\\\")}')\\n",
    "\\n",
    "# 训练参数\\n",
    "train_args = {\\n",
    "    'data': os.path.join(dataset.location, 'data.yaml'),\\n",
    "    'epochs': TRAINING_CONFIG['epochs'],\\n",
    "    'batch': TRAINING_CONFIG['batch_size'],\\n",
    "    'imgsz': TRAINING_CONFIG['img_size'],\\n",
    "    'lr0': TRAINING_CONFIG['learning_rate'],\\n",
    "    'patience': TRAINING_CONFIG['patience'],\\n",
    "    'save_period': TRAINING_CONFIG['save_period'],\\n",
    "    'project': OUTPUT_DIR,\\n",
    "    'name': f'malaysian_food_{model_type}_{datetime.now().strftime(\\\"%Y%m%d_%H%M%S\\\")}',\\n",
    "    'exist_ok': True,\\n",
    "    'device': 0,\\n",
    "    'workers': 4,\\n",
    "    'verbose': True\\n",
    "}\\n",
    "\\n",
    "# 通知Dashboard开始训练\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'training_started', 'config': TRAINING_CONFIG})\\n",
    "except:\\n",
    "    pass\\n",
    "\\n",
    "# 开始训练\\n",
    "results = model.train(**train_args)\\n",
    "\\n",
    "print('✅ 训练完成！')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "model_validation"
   },
   "outputs": [],
   "source": [
    "# 🔍 模型验证\\n",
    "print('🔍 模型验证...')\\n",
    "best_model_path = os.path.join(results.save_dir, 'weights', 'best.pt')\\n",
    "best_model = YOLO(best_model_path)\\n",
    "\\n",
    "# 在验证集上验证\\n",
    "val_results = best_model.val(data=os.path.join(dataset.location, 'data.yaml'))\\n",
    "\\n",
    "print('✅ 模型验证完成！')\\n",
    "print(f'📊 验证结果: {val_results}')\\n",
    "\\n",
    "# 提取关键指标\\n",
    "metrics = {\\n",
    "    'accuracy': float(val_results.box.map) if hasattr(val_results.box, 'map') else 0.0,\\n",
    "    'loss': float(val_results.box.map50) if hasattr(val_results.box, 'map50') else 0.0,\\n",
    "    'precision': float(val_results.box.mp) if hasattr(val_results.box, 'mp') else 0.0,\\n",
    "    'recall': float(val_results.box.mr) if hasattr(val_results.box, 'mr') else 0.0\\n",
    "}\\n",
    "\\n",
    "# 通知Dashboard验证完成\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'validation_completed', 'metrics': metrics})\\n",
    "except:\\n",
    "    pass"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "export_models"
   },
   "outputs": [],
   "source": [
    "# 📦 导出模型\\n",
    "print('📦 导出模型...')\\n",
    "export_formats = ['onnx', 'torchscript']\\n",
    "exported_models = {}\\n",
    "\\n",
    "for fmt in export_formats:\\n",
    "    try:\\n",
    "        print(f'📦 导出模型格式: {fmt.upper()}')\\n",
    "        exported_path = best_model.export(format=fmt)\\n",
    "        exported_models[fmt] = exported_path\\n",
    "        print(f'✅ {fmt.upper()} 模型导出成功: {exported_path}')\\n",
    "    except Exception as e:\\n",
    "        print(f'❌ {fmt.upper()} 模型导出失败: {str(e)}')\\n",
    "\\n",
    "# 通知Dashboard模型导出完成\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}', \\n",
    "                 json={'status': 'models_exported', 'exported_models': exported_models})\\n",
    "except:\\n",
    "    pass"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "training_summary"
   },
   "outputs": [],
   "source": [
    "# 📋 训练总结\\n",
    "summary = {\\n",
    "    'project_info': {\\n",
    "        'name': 'NutriScan MY - Malaysian Food Detection',\\n",
    "        'model_type': model_type,\\n",
    "        'session_id': SESSION_ID,\\n",
    "        'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')\\n",
    "    },\\n",
    "    'training_config': TRAINING_CONFIG,\\n",
    "    'dataset_info': dataset_stats,\\n",
    "    'model_results': {\\n",
    "        'best_model_path': best_model_path,\\n",
    "        'exported_models': exported_models,\\n",
    "        'validation_results': str(val_results),\\n",
    "        'metrics': metrics\\n",
    "    }\\n",
    "}\\n",
    "\\n",
    "# 保存总结报告\\n",
    "summary_path = os.path.join(OUTPUT_DIR, 'training_summary.json')\\n",
    "with open(summary_path, 'w', encoding='utf-8') as f:\\n",
    "    json.dump(summary, f, indent=2, ensure_ascii=False)\\n",
    "\\n",
    "print('\\n📋 训练总结报告:')\\n",
    "print('=' * 50)\\n",
    "print(f'项目名称: {summary[\\\"project_info\\\"][\\\"name\\\"]}')\\n",
    "print(f'模型类型: {summary[\\\"project_info\\\"][\\\"model_type\\\"]}')\\n",
    "print(f'训练时间: {summary[\\\"project_info\\\"][\\\"training_date\\\"]}')\\n",
    "print(f'数据集大小: {summary[\\\"dataset_info\\\"][\\\"total_images\\\"]} 张图片')\\n",
    "print(f'最佳模型: {os.path.basename(best_model_path)}')\\n",
    "print(f'导出格式: {\\\", \\\".join(exported_models.keys())}')\\n",
    "print(f'\\n📁 所有文件保存在: {OUTPUT_DIR}')\\n",
    "print(f'📄 详细报告: {summary_path}')\\n",
    "\\n",
    "# 最终通知Dashboard训练完成\\n",
    "try:\\n",
    "    requests.post(f'{DASHBOARD_URL}/api/training/colab/result', \\n",
    "                 json={\\n",
    "                     'session_id': SESSION_ID,\\n",
    "                     'status': 'completed',\\n",
    "                     'summary': summary,\\n",
    "                     'timestamp': datetime.now().isoformat()\\n",
    "                 })\\n",
    "    print('✅ 训练结果已同步到Dashboard')\\n",
    "except:\\n",
    "    print('⚠️ 无法同步结果到Dashboard')\\n",
    "\\n",
    "print('\\n🎉 NutriScan MY 模型训练完成！')\\n",
    "print('✅ 您的马来西亚食物识别模型已准备就绪！')\\n",
    "print('🚀 现在可以部署到移动端或Web应用中使用！')\\n",
    "print(f'\\n🔗 请在Dashboard中查看训练结果: {DASHBOARD_URL}/training')"
   ]
  }
 ],
 "metadata": {
  "colab": {
   "provenance": []
  },
  "kernelspec": {
   "display_name": "Python 3",
   "name": "python3"
  },
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 0
}`;
    }
}

module.exports = ColabTemplateGenerator;