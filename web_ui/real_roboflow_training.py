# 🍜 NutriScan MY - 真实Roboflow数据集训练
# 使用您在Roboflow中标注的真实马来西亚食物数据

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
import torch

# YOLOv8 和 Roboflow
from ultralytics import YOLO
from roboflow import Roboflow

# Google Generative AI (Gemini)
import google.generativeai as genai

print("✅ 库导入完成！")

# =============================================================================
# 第3步：Roboflow配置 - 请修改这些信息
# =============================================================================

# 🔧 您的真实Roboflow项目配置
ROBOFLOW_CONFIG = {
    "api_key": "BwTemPbP39LHLFH4teds",  # 您的私有API密钥
    "workspace": "malaysian-food-detection",  # 工作空间名称
    "project": "malaysian-food-detection",    # 项目名称
    "version": 1,                             # 版本号
    "project_id": "malaysian-food-detection-wy3kt",  # 项目ID
    "published_key": "rf_tK4ZQsaI2aUDudEDgCK7R9VWGjl1"  # 发布密钥
}

print("🔧 请确保已正确配置Roboflow信息！")
print(f"📊 当前配置: {ROBOFLOW_CONFIG}")

# =============================================================================
# 第4步：设备检测和训练配置
# =============================================================================

# 自动检测设备
if torch.cuda.is_available():
    device = "cuda"
    print(f"🚀 检测到GPU: {torch.cuda.get_device_name(0)}")
else:
    device = "cpu"
    print("💻 使用CPU进行训练")

# 训练配置 - 可以根据需要调整
TRAINING_CONFIG = {
    "model_type": "yolov8n",      # 可选: yolov8n, yolov8s, yolov8m, yolov8l, yolov8x
    "epochs": 100,                # 训练轮次
    "batch_size": 16 if device == "cuda" else 8,  # 批次大小
    "learning_rate": 0.01,        # 学习率
    "img_size": 640,              # 图像大小
    "patience": 20,               # 早停耐心值
    "save_period": 10,            # 保存周期
    "device": device
}

# 输出目录
OUTPUT_DIR = "/content/nutriscan_training"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("✅ 配置参数设置完成！")
print(f"📊 训练配置: {TRAINING_CONFIG}")

# =============================================================================
# 第5步：下载真实Roboflow数据集
# =============================================================================

print("🔗 连接到您的Roboflow项目...")

try:
    # 初始化Roboflow客户端
    rf = Roboflow(api_key=ROBOFLOW_CONFIG["api_key"])
    
    # 获取项目
    workspace = rf.workspace(ROBOFLOW_CONFIG["workspace"])
    project = workspace.project(ROBOFLOW_CONFIG["project"])
    
    # 获取数据集
    dataset = project.version(ROBOFLOW_CONFIG["version"]).download("yolov8")
    
    print(f"✅ 真实数据集下载完成！")
    print(f"📁 数据集路径: {dataset.location}")
    
    # 显示数据集信息
    print(f"📊 数据集名称: {dataset.name}")
    print(f"📊 数据集版本: {dataset.version}")
    
except Exception as e:
    print(f"❌ 下载数据集失败: {e}")
    print("\n💡 请检查以下信息:")
    print("1. API密钥是否正确")
    print("2. 工作空间名称是否正确")
    print("3. 项目名称是否正确")
    print("4. 版本号是否正确")
    print("5. 网络连接是否正常")
    
    # 提供帮助信息
    print("\n🔧 如何获取正确的信息:")
    print("1. 登录 https://app.roboflow.com/")
    print("2. 选择您的项目")
    print("3. 在项目设置中查看工作空间和项目名称")
    print("4. 在API设置中获取API密钥")
    print("5. 在数据集版本中查看版本号")
    
    raise e

# =============================================================================
# 第6步：数据集统计
# =============================================================================

def count_files(directory):
    """统计文件数量"""
    if os.path.exists(directory):
        images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])
        labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])
        return images, labels
    return 0, 0

# 统计各数据集的文件数量
train_path = os.path.join(dataset.location, "train")
val_path = os.path.join(dataset.location, "valid")
test_path = os.path.join(dataset.location, "test")

train_images, train_labels = count_files(train_path)
val_images, val_labels = count_files(val_path)
test_images, test_labels = count_files(test_path)

print("\n📊 数据集统计:")
print(f"  训练集: {train_images} 张图片, {train_labels} 个标签文件")
print(f"  验证集: {val_images} 张图片, {val_labels} 个标签文件")
print(f"  测试集: {test_images} 张图片, {test_labels} 个标签文件")
print(f"  总计: {train_images + val_images + test_images} 张图片")

# 读取类别信息
data_yaml_path = os.path.join(dataset.location, "data.yaml")
if os.path.exists(data_yaml_path):
    with open(data_yaml_path, 'r') as f:
        data_config = f.read()
    print(f"\n📋 数据集配置:")
    print(data_config)

# =============================================================================
# 第7步：初始化YOLOv8模型
# =============================================================================

print("\n🤖 初始化YOLOv8模型...")
model_type = TRAINING_CONFIG["model_type"]
model = YOLO(f"{model_type}.pt")

print(f"✅ YOLOv8模型初始化完成: {model_type}")
print(f"📊 模型参数: {sum(p.numel() for p in model.model.parameters())} 个参数")

# =============================================================================
# 第8步：开始真实数据训练
# =============================================================================

print("\n🚀 开始真实数据训练...")
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
    "name": f"real_malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "exist_ok": True,
    "device": TRAINING_CONFIG["device"],
    "workers": 4 if device == "cuda" else 2,
    "verbose": True
}

# 开始训练
results = model.train(**train_args)

print("✅ 真实数据训练完成！")

# =============================================================================
# 第9步：模型验证
# =============================================================================

print("\n🔍 模型验证...")
best_model_path = os.path.join(results.save_dir, "weights", "best.pt")
best_model = YOLO(best_model_path)

# 在验证集上验证
val_results = best_model.val(data=os.path.join(dataset.location, "data.yaml"))

print("✅ 模型验证完成！")
print(f"📊 验证结果: {val_results}")

# 提取关键指标
try:
    metrics = {
        "mAP": float(val_results.box.map) if hasattr(val_results.box, 'map') else 0.0,
        "mAP50": float(val_results.box.map50) if hasattr(val_results.box, 'map50') else 0.0,
        "mAP75": float(val_results.box.map75) if hasattr(val_results.box, 'map75') else 0.0,
        "precision": float(val_results.box.mp) if hasattr(val_results.box, 'mp') else 0.0,
        "recall": float(val_results.box.mr) if hasattr(val_results.box, 'mr') else 0.0
    }
    
    print("\n📈 模型性能指标:")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")
        
except Exception as e:
    print(f"⚠️ 指标提取失败: {e}")

# =============================================================================
# 第10步：Gemini AI营养分析
# =============================================================================

print("\n🧠 配置Gemini AI...")
try:
    genai.configure(api_key="AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8")
    model_gemini = genai.GenerativeModel('gemini-pro')

    def analyze_food_nutrition(food_name):
        """使用Gemini分析食物营养信息"""
        prompt = f"""
        请分析以下马来西亚食物的营养信息：{food_name}
        
        请提供：
        1. 主要营养成分（卡路里、蛋白质、碳水化合物、脂肪）
        2. 维生素和矿物质含量
        3. 健康建议
        4. 适合的食用时间
        5. 文化背景和特色
        
        请用中文回答，格式清晰。
        """
        
        try:
            response = model_gemini.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"营养分析失败: {str(e)}"

    print("✅ Gemini AI配置完成！")

    # 根据实际数据集中的类别进行营养分析
    test_foods = ["Nasi Lemak", "Roti Canai", "Char Kway Teow", "Bak Kut Teh"]

    print("\n🍜 马来西亚食物营养分析:")
    print("=" * 60)

    for food in test_foods:
        print(f"\n📊 分析食物: {food}")
        nutrition_info = analyze_food_nutrition(food)
        print(nutrition_info)
        print("-" * 40)

except Exception as e:
    print(f"⚠️ Gemini AI配置失败: {e}")

# =============================================================================
# 第11步：模型导出
# =============================================================================

print("\n📦 导出模型...")
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
# 第12步：训练总结
# =============================================================================

summary = {
    "project_info": {
        "name": "NutriScan MY - Real Malaysian Food Detection",
        "roboflow_workspace": ROBOFLOW_CONFIG["workspace"],
        "roboflow_project": ROBOFLOW_CONFIG["project"],
        "model_type": model_type,
        "device": device,
        "training_date": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    },
    "training_config": TRAINING_CONFIG,
    "dataset_info": {
        "train_images": train_images,
        "val_images": val_images,
        "test_images": test_images,
        "total_images": train_images + val_images + test_images,
        "dataset_path": dataset.location
    },
    "model_results": {
        "best_model_path": best_model_path,
        "exported_models": exported_models,
        "metrics": metrics if 'metrics' in locals() else {}
    },
    "status": "completed"
}

# 保存总结报告
summary_path = os.path.join(OUTPUT_DIR, "real_training_summary.json")
with open(summary_path, 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)

print("\n📋 真实数据训练总结:")
print("=" * 60)
print(f"项目名称: {summary['project_info']['name']}")
print(f"Roboflow工作空间: {summary['project_info']['roboflow_workspace']}")
print(f"Roboflow项目: {summary['project_info']['roboflow_project']}")
print(f"模型类型: {summary['project_info']['model_type']}")
print(f"训练设备: {summary['project_info']['device']}")
print(f"训练时间: {summary['project_info']['training_date']}")
print(f"数据集大小: {summary['dataset_info']['total_images']} 张图片")
print(f"最佳模型: {os.path.basename(best_model_path)}")
print(f"导出格式: {', '.join(exported_models.keys())}")
print(f"\n📁 所有文件保存在: {OUTPUT_DIR}")
print(f"📄 详细报告: {summary_path}")

print("\n🎉 NutriScan MY 真实数据训练完成！")
print("✅ 您的马来西亚食物识别模型已准备就绪！")
print("🚀 现在可以部署到移动端或Web应用中使用！")

# =============================================================================
# 第13步：下一步建议
# =============================================================================

print("\n💡 下一步建议:")
print("1. 在Colab中启用GPU以获得更好的训练性能")
print("2. 收集更多食物照片以提高模型准确性")
print("3. 调整训练参数进行模型优化")
print("4. 将模型转换为TFLite格式用于移动端部署")
print("5. 创建移动应用集成训练好的模型")

print("\n🔧 性能优化建议:")
print("- 启用GPU: 运行时 → 更改运行时类型 → GPU")
print("- 增加训练轮次: 修改epochs参数")
print("- 使用更大的模型: yolov8s, yolov8m, yolov8l, yolov8x")
print("- 数据增强: 启用更多的数据增强选项")

print("\n📱 移动端部署:")
print("- 转换模型为TFLite格式")
print("- 集成到React Native应用")
print("- 实现实时摄像头识别")
print("- 添加营养分析功能")
