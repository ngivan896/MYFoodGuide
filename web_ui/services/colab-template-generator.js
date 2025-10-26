/**
 * 🍜 NutriScan MY - Google Colab 模板生成器
 * 动态生成包含用户配置的训练模板
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
            .replace(/{{AUGMENT}}/g, config.augment)
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
     * 获取基础模板
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
    "!pip install ultralytics roboflow torch torchvision matplotlib seaborn pandas numpy google-generativeai requests --quiet\\n",
    "print("✅ 依赖包安装完成！")"
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
    "# YOLOv8 和 Roboflow\\n",
    "from ultralytics import YOLO\\n",
    "from roboflow import Roboflow\\n",
    "\\n",
    "# Google Generative AI (Gemini)\\n",
    "import google.generativeai as genai\\n",
    "\\n",
    "print("✅ 库导入完成！")"
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
    "SESSION_ID = "{{SESSION_ID}}"\n",
    "DASHBOARD_URL = "{{DASHBOARD_URL}}"\n",
    "\n",
    "# API配置\n",
    "ROBOFLOW_API_KEY = "BwTemPbP39LHLFH4teds"\n",
    "ROBOFLOW_PROJECT_ID = "projects/326667818607"\n",
    "GEMINI_API_KEY = "AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8"\n",
    "\n",
    "# 训练配置 - 从Dashboard传递\n",
    "TRAINING_CONFIG = {\n",
    "    "model_type": "{{MODEL_TYPE}}",\n",
    "    "epochs": {{EPOCHS}},\n",
    "    "batch_size": {{BATCH_SIZE}},\n",
    "    "learning_rate": {{LEARNING_RATE}},\n",
    "    "img_size": {{IMG_SIZE}},\n",
    "    "patience": {{PATIENCE}},\n",
    "    "save_period": {{SAVE_PERIOD}},\n",
    "    "augment": {{AUGMENT}},\n",
    "    "optimizer": "{{OPTIMIZER}}",\n",
    "    "loss_function": "{{LOSS_FUNCTION}}"\n",
    "}\n",
    "\n",
    "# 输出目录\n",
    "OUTPUT_DIR = f"/content/nutriscan_training_{SESSION_ID}"\n",
    "os.makedirs(OUTPUT_DIR, exist_ok=True)\n",
    "\n",
    "# 创建日志目录\n",
    "LOG_DIR = os.path.join(OUTPUT_DIR, "logs")\n",
    "os.makedirs(LOG_DIR, exist_ok=True)\n",
    "\n",
    "print("✅ 配置参数设置完成！")\n",
    "print(f"📊 训练配置: {TRAINING_CONFIG}")\n",
    "print(f"🆔 会话ID: {SESSION_ID}")\n",
    "print(f"📁 输出目录: {OUTPUT_DIR}")\n",
    "\n",
    "# 通知Dashboard训练开始\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "started", "timestamp": datetime.now().isoformat(), "config": TRAINING_CONFIG})\n",
    "    print("✅ 已通知Dashboard训练开始")\n",
    "except:\n",
    "    print("⚠️ 无法连接到Dashboard，继续训练...")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "download_dataset"
   },
   "outputs": [],
   "source": [
    "# 📊 下载Roboflow数据集\n",
    "print("🔗 连接到Roboflow项目...")\n",
    "rf = Roboflow(api_key=ROBOFLOW_API_KEY)\n",
    "project = rf.workspace("malaysian-food-detection").project("malaysian-food-detection")\n",
    "dataset = project.version(1).download("yolov8")\n",
    "\n",
    "print(f"✅ 数据集下载完成！")\n",
    "print(f"📁 数据集路径: {dataset.location}")\n",
    "\n",
    "# 统计数据集\n",
    "def count_files(directory):\n",
    "    if os.path.exists(directory):\n",
    "        images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])\n",
    "        labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])\n",
    "        return images, labels\n",
    "    return 0, 0\n",
    "\n",
    "train_path = os.path.join(dataset.location, "train")\n",
    "val_path = os.path.join(dataset.location, "valid")\n",
    "test_path = os.path.join(dataset.location, "test")\n",
    "\n",
    "train_images, train_labels = count_files(train_path)\n",
    "val_images, val_labels = count_files(val_path)\n",
    "test_images, test_labels = count_files(test_path)\n",
    "\n",
    "dataset_stats = {\n",
    "    "train_images": train_images,\n",
    "    "val_images": val_images,\n",
    "    "test_images": test_images,\n",
    "    "total_images": train_images + val_images + test_images\n",
    "}\n",
    "\n",
    "print("📊 数据集统计:")\n",
    "print(f"  训练集: {train_images} 张图片, {train_labels} 个标签文件")\n",
    "print(f"  验证集: {val_images} 张图片, {val_labels} 个标签文件")\n",
    "print(f"  测试集: {test_images} 张图片, {test_labels} 个标签文件")\n",
    "print(f"  总计: {dataset_stats['total_images']} 张图片")\n",
    "\n",
    "# 通知Dashboard数据集信息\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "dataset_ready", "dataset_stats": dataset_stats})\n",
    "except:\n",
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
    "# 🤖 初始化YOLOv8模型\n",
    "print("🤖 初始化YOLOv8模型...")\n",
    "model_type = TRAINING_CONFIG["model_type"]\n",
    "model = YOLO(f"{model_type}.pt")\n",
    "\n",
    "print(f"✅ YOLOv8模型初始化完成: {model_type}")\n",
    "print(f"📊 模型参数: {sum(p.numel() for p in model.model.parameters())} 个参数")\n",
    "\n",
    "# 通知Dashboard模型初始化完成\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "model_ready", "model_type": model_type})\n",
    "except:\n",
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
    "# 🚀 开始训练\n",
    "print("🚀 开始模型训练...")\n",
    "print(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")\n",
    "\n",
    "# 训练参数\n",
    "train_args = {\n",
    "    "data": os.path.join(dataset.location, "data.yaml"),\n",
    "    "epochs": TRAINING_CONFIG["epochs"],\n",
    "    "batch": TRAINING_CONFIG["batch_size"],\n",
    "    "imgsz": TRAINING_CONFIG["img_size"],\n",
    "    "lr0": TRAINING_CONFIG["learning_rate"],\n",
    "    "patience": TRAINING_CONFIG["patience"],\n",
    "    "save_period": TRAINING_CONFIG["save_period"],\n",
    "    "project": OUTPUT_DIR,\n",
    "    "name": f"malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",\n",
    "    "exist_ok": True,\n",
    "    "device": 0,  # 使用GPU\n",
    "    "workers": 4,\n",
    "    "verbose": True\n",
    "}\n",
    "\n",
    "# 通知Dashboard开始训练\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "training_started", "config": TRAINING_CONFIG})\n",
    "except:\n",
    "    pass\n",
    "\n",
    "# 开始训练\n",
    "results = model.train(**train_args)\n",
    "\n",
    "print("✅ 训练完成！")"
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
    "# 🔍 模型验证\n",
    "print("🔍 模型验证...")\n",
    "best_model_path = os.path.join(results.save_dir, "weights", "best.pt")\n",
    "best_model = YOLO(best_model_path)\n",
    "\n",
    "# 在验证集上验证\n",
    "val_results = best_model.val(data=os.path.join(dataset.location, "data.yaml"))\n",
    "\n",
    "print("✅ 模型验证完成！")\n",
    "print(f"📊 验证结果: {val_results}")\n",
    "\n",
    "# 提取关键指标\n",
    "metrics = {\n",
    "    "accuracy": float(val_results.box.map) if hasattr(val_results.box, 'map') else 0.0,\n",
    "    "loss": float(val_results.box.map50) if hasattr(val_results.box, 'map50') else 0.0,\n",
    "    "precision": float(val_results.box.mp) if hasattr(val_results.box, 'mp') else 0.0,\n",
    "    "recall": float(val_results.box.mr) if hasattr(val_results.box, 'mr') else 0.0\n",
    "}\n",
    "\n",
    "# 通知Dashboard验证完成\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "validation_completed", "metrics": metrics})\n",
    "except:\n",
    "    pass"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {
    "id": "nutrition_analysis"
   },
   "outputs": [],
   "source": [
    "# 🧠 Gemini AI营养分析集成\n",
    "print("🧠 配置Gemini AI...")\n",
    "genai.configure(api_key=GEMINI_API_KEY)\n",
    "model_gemini = genai.GenerativeModel('gemini-1.5-flash')\n",
    "\n",
    "def analyze_food_nutrition(food_name):\n",
    "    """使用Gemini分析食物营养信息"""\n",
    "    prompt = f"""\n",
    "    请分析以下马来西亚食物的营养信息：{food_name}\n",
    "    \n",
    "    请提供：\n",
    "    1. 主要营养成分（卡路里、蛋白质、碳水化合物、脂肪）\n",
    "    2. 维生素和矿物质含量\n",
    "    3. 健康建议\n",
    "    4. 适合的食用时间\n",
    "    \n",
    "    请用中文回答，格式清晰。\n",
    "    """\n",
    "    \n",
    "    try:\n",
    "        response = model_gemini.generate_content(prompt)\n",
    "        return response.text\n",
    "    except Exception as e:\n",
    "        return f"营养分析失败: {str(e)}"\n",
    "\n",
    "print("✅ Gemini AI配置完成！")\n",
    "\n",
    "# 测试营养分析\n",
    "test_foods = ["Nasi Lemak", "Roti Canai", "Char Kway Teow", "Bak Kut Teh"]\n",
    "nutrition_results = {}\n",
    "\n",
    "print("🍜 马来西亚食物营养分析:")\n",
    "print("=" * 50)\n",
    "\n",
    "for food in test_foods:\n",
    "    print(f"\\n📊 分析食物: {food}")\n",
    "    nutrition_info = analyze_food_nutrition(food)\n",
    "    nutrition_results[food] = nutrition_info\n",
    "    print(nutrition_info)\n",
    "    print("-" * 30)\n",
    "\n",
    "# 通知Dashboard营养分析完成\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "nutrition_analysis_completed", "nutrition_results": nutrition_results})\n",
    "except:\n",
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
    "# 📦 导出模型\n",
    "print("📦 导出模型...")\n",
    "export_formats = ['onnx', 'torchscript']\n",
    "exported_models = {}\n",
    "\n",
    "for fmt in export_formats:\n",
    "    try:\n",
    "        print(f"📦 导出模型格式: {fmt.upper()}")\n",
    "        exported_path = best_model.export(format=fmt)\n",
    "        exported_models[fmt] = exported_path\n",
    "        print(f"✅ {fmt.upper()} 模型导出成功: {exported_path}")\n",
    "    except Exception as e:\n",
    "        print(f"❌ {fmt.upper()} 模型导出失败: {str(e)}")\n",
    "\n",
    "# 通知Dashboard模型导出完成\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/status/{SESSION_ID}", \n",
    "                 json={"status": "models_exported", "exported_models": exported_models})\n",
    "except:\n",
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
    "# 📋 训练总结\n",
    "summary = {\n",
    "    "project_info": {\n",
    "        "name": "NutriScan MY - Malaysian Food Detection",\n",
    "        "project_id": ROBOFLOW_PROJECT_ID,\n",
    "        "model_type": model_type,\n",
    "        "session_id": SESSION_ID,\n",
    "        "training_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')\n",
    "    },\n",
    "    "training_config": TRAINING_CONFIG,\n",
    "    "dataset_info": dataset_stats,\n",
    "    "model_results": {\n",
    "        "best_model_path": best_model_path,\n",
    "        "exported_models": exported_models,\n",
    "        "validation_results": str(val_results),\n",
    "        "metrics": metrics\n",
    "    },\n",
    "    "nutrition_analysis": nutrition_results,\n",
    "    "api_integration": {\n",
    "        "roboflow_connected": True,\n",
    "        "gemini_configured": True,\n",
    "        "nutrition_analysis_ready": True\n",
    "    }\n",
    "}\n",
    "\n",
    "# 保存总结报告\n",
    "summary_path = os.path.join(OUTPUT_DIR, "training_summary.json")\n",
    "with open(summary_path, 'w', encoding='utf-8') as f:\n",
    "    json.dump(summary, f, indent=2, ensure_ascii=False)\n",
    "\n",
    "print("\\n📋 训练总结报告:")\n",
    "print("=" * 50)\n",
    "print(f"项目名称: {summary['project_info']['name']}")\n",
    "print(f"模型类型: {summary['project_info']['model_type']}")\n",
    "print(f"训练时间: {summary['project_info']['training_date']}")\n",
    "print(f"数据集大小: {summary['dataset_info']['total_images']} 张图片")\n",
    "print(f"最佳模型: {os.path.basename(best_model_path)}")\n",
    "print(f"导出格式: {', '.join(exported_models.keys())}")\n",
    "print(f"\\n📁 所有文件保存在: {OUTPUT_DIR}")\n",
    "print(f"📄 详细报告: {summary_path}")\n",
    "\n",
    "# 最终通知Dashboard训练完成\n",
    "try:\n",
    "    requests.post(f"{DASHBOARD_URL}/api/training/colab/result", \n",
    "                 json={\n",
    "                     "session_id": SESSION_ID,\n",
    "                     "status": "completed",\n",
    "                     "summary": summary,\n",
    "                     "timestamp": datetime.now().isoformat()\n",
    "                 })\n",
    "    print("✅ 训练结果已同步到Dashboard")\n",
    "except:\n",
    "    print("⚠️ 无法同步结果到Dashboard")\n",
    "\n",
    "print("\\n🎉 NutriScan MY 模型训练完成！")\n",
    "print("✅ 您的马来西亚食物识别模型已准备就绪！")\n",
    "print("🚀 现在可以部署到移动端或Web应用中使用！")\n",
    "print(f"\\n🔗 请在Dashboard中查看训练结果: {DASHBOARD_URL}/training")"
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
