# 🍜 NutriScan MY - 马来西亚食物识别模型完整训练代码
# 在Google Colab中直接运行此代码

# =============================================================================
# 第1步：安装依赖包
# =============================================================================
!pip install ultralytics roboflow torch torchvision matplotlib seaborn pandas numpy google-generativeai --quiet
print("✅ 依赖包安装完成！")

# =============================================================================
# 第2步：导入库
# =============================================================================
import os
import json
import time
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# YOLOv8 和 Roboflow
from ultralytics import YOLO
from roboflow import Roboflow

# Google Generative AI (Gemini)
import google.generativeai as genai

print("✅ 库导入完成！")

# =============================================================================
# 第3步：配置参数
# =============================================================================

# API配置 - 已预配置您的API密钥
ROBOFLOW_API_KEY = "BwTemPbP39LHLFH4teds"
ROBOFLOW_PROJECT_ID = "projects/326667818607"
GEMINI_API_KEY = "AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8"

# 训练配置 - 可以根据需要调整
TRAINING_CONFIG = {
    "model_type": "yolov8n",      # 模型大小：yolov8n(最小) 到 yolov8x(最大)
    "epochs": 100,                # 训练轮次
    "batch_size": 16,             # 批次大小
    "learning_rate": 0.01,        # 学习率
    "img_size": 640,              # 图像大小
    "patience": 20,               # 早停耐心值
    "save_period": 10             # 保存周期
}

# 输出目录
OUTPUT_DIR = "/content/nutriscan_training"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("✅ 配置参数设置完成！")
print(f"📊 训练配置: {TRAINING_CONFIG}")

# =============================================================================
# 第4步：下载数据集
# =============================================================================

print("🔗 连接到Roboflow项目...")
rf = Roboflow(api_key=ROBOFLOW_API_KEY)
project = rf.workspace("malaysian-food-detection").project("malaysian-food-detection")
dataset = project.version(1).download("yolov8")

print(f"✅ 数据集下载完成！")
print(f"📁 数据集路径: {dataset.location}")

# =============================================================================
# 第5步：数据集统计
# =============================================================================

def count_files(directory):
    """统计文件数量"""
    if os.path.exists(directory):
        images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])
        labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])
        return images, labels
    return 0, 0

train_path = os.path.join(dataset.location, "train")
val_path = os.path.join(dataset.location, "valid")
test_path = os.path.join(dataset.location, "test")

train_images, train_labels = count_files(train_path)
val_images, val_labels = count_files(val_path)
test_images, test_labels = count_files(test_path)

print("📊 数据集统计:")
print(f"  训练集: {train_images} 张图片, {train_labels} 个标签文件")
print(f"  验证集: {val_images} 张图片, {val_labels} 个标签文件")
print(f"  测试集: {test_images} 张图片, {test_labels} 个标签文件")
print(f"  总计: {train_images + val_images + test_images} 张图片")

# =============================================================================
# 第6步：初始化YOLOv8模型
# =============================================================================

print("🤖 初始化YOLOv8模型...")
model_type = TRAINING_CONFIG["model_type"]
model = YOLO(f"{model_type}.pt")

print(f"✅ YOLOv8模型初始化完成: {model_type}")
print(f"📊 模型参数: {sum(p.numel() for p in model.model.parameters())} 个参数")

# =============================================================================
# 第7步：开始训练
# =============================================================================

print("🚀 开始模型训练...")
print(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# 训练参数
train_args = {
    "data": os.path.join(dataset.location, "data.yaml"),
    "epochs": TRAINING_CONFIG["epochs"],
    "batch": TRAINING_CONFIG["batch_size"],
    "imgsz": TRAINING_CONFIG["img_size"],
    "lr0": TRAINING_CONFIG["learning_rate"],
    "patience": TRAINING_CONFIG["patience"],
    "save_period": TRAINING_CONFIG["save_period"],
    "project": OUTPUT_DIR,
    "name": f"malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "exist_ok": True,
    "device": 0,  # 使用GPU
    "workers": 4,
    "verbose": True
}

# 开始训练
results = model.train(**train_args)

print("✅ 训练完成！")

# =============================================================================
# 第8步：模型验证
# =============================================================================

print("🔍 模型验证...")
best_model_path = os.path.join(results.save_dir, "weights", "best.pt")
best_model = YOLO(best_model_path)

# 在验证集上验证
val_results = best_model.val(data=os.path.join(dataset.location, "data.yaml"))

print("✅ 模型验证完成！")
print(f"📊 验证结果: {val_results}")

# =============================================================================
# 第9步：Gemini AI营养分析集成
# =============================================================================

print("🧠 配置Gemini AI...")
genai.configure(api_key=GEMINI_API_KEY)
model_gemini = genai.GenerativeModel('gemini-1.5-flash')

def analyze_food_nutrition(food_name):
    """使用Gemini分析食物营养信息"""
    prompt = f"""
    请分析以下马来西亚食物的营养信息：{food_name}
    
    请提供：
    1. 主要营养成分（卡路里、蛋白质、碳水化合物、脂肪）
    2. 维生素和矿物质含量
    3. 健康建议
    4. 适合的食用时间
    
    请用中文回答，格式清晰。
    """
    
    try:
        response = model_gemini.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"营养分析失败: {str(e)}"

print("✅ Gemini AI配置完成！")

# 测试营养分析
test_foods = ["Nasi Lemak", "Roti Canai", "Char Kway Teow", "Bak Kut Teh"]

print("🍜 马来西亚食物营养分析:")
print("=" * 50)

for food in test_foods:
    print(f"\n📊 分析食物: {food}")
    nutrition_info = analyze_food_nutrition(food)
    print(nutrition_info)
    print("-" * 30)

# =============================================================================
# 第10步：模型导出
# =============================================================================

print("📦 导出模型...")
export_formats = ['onnx', 'torchscript']
exported_models = {}

for fmt in export_formats:
    try:
        print(f"📦 导出模型格式: {fmt.upper()}")
        exported_path = best_model.export(format=fmt)
        exported_models[fmt] = exported_path
        print(f"✅ {fmt.upper()} 模型导出成功: {exported_path}")
    except Exception as e:
        print(f"❌ {fmt.upper()} 模型导出失败: {str(e)}")

# =============================================================================
# 第11步：训练总结
# =============================================================================

summary = {
    "project_info": {
        "name": "NutriScan MY - Malaysian Food Detection",
        "project_id": ROBOFLOW_PROJECT_ID,
        "model_type": model_type,
        "training_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    "training_config": TRAINING_CONFIG,
    "dataset_info": {
        "train_images": train_images,
        "val_images": val_images,
        "test_images": test_images,
        "total_images": train_images + val_images + test_images
    },
    "model_results": {
        "best_model_path": best_model_path,
        "exported_models": exported_models,
        "validation_results": str(val_results)
    },
    "api_integration": {
        "roboflow_connected": True,
        "gemini_configured": True,
        "nutrition_analysis_ready": True
    }
}

# 保存总结报告
summary_path = os.path.join(OUTPUT_DIR, "training_summary.json")
with open(summary_path, 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)

print("\n📋 训练总结报告:")
print("=" * 50)
print(f"项目名称: {summary['project_info']['name']}")
print(f"模型类型: {summary['project_info']['model_type']}")
print(f"训练时间: {summary['project_info']['training_date']}")
print(f"数据集大小: {summary['dataset_info']['total_images']} 张图片")
print(f"最佳模型: {os.path.basename(best_model_path)}")
print(f"导出格式: {', '.join(exported_models.keys())}")
print(f"\n📁 所有文件保存在: {OUTPUT_DIR}")
print(f"📄 详细报告: {summary_path}")

print("\n🎉 NutriScan MY 模型训练完成！")
print("✅ 您的马来西亚食物识别模型已准备就绪！")
print("🚀 现在可以部署到移动端或Web应用中使用！")
