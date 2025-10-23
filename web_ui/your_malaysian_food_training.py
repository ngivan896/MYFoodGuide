# 🍜 NutriScan MY - 您的马来西亚食物识别模型训练
# 使用您在Roboflow中标注的真实数据

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
# 第3步：您的Roboflow项目配置
# =============================================================================

# 🎯 您的真实项目信息
ROBOFLOW_CONFIG = {
    "api_key": "BwTemPbP39LHLFH4teds",
    "workspace": "malaysian-food-detection",
    "project": "malaysian-food-detection", 
    "version": 1,
    "project_id": "malaysian-food-detection-wy3kt"
}

print("🎯 使用您的真实Roboflow项目！")
print(f"📊 项目配置: {ROBOFLOW_CONFIG}")

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

# 训练配置
TRAINING_CONFIG = {
    "model_type": "yolov8n",      # 可以改为yolov8s/m/l/x获得更好性能
    "epochs": 100,                # 训练轮次
    "batch_size": 16 if device == "cuda" else 8,
    "learning_rate": 0.01,        # 学习率
    "img_size": 640,              # 图像大小
    "patience": 20,               # 早停耐心值
    "save_period": 10,            # 保存周期
    "device": device
}

# 输出目录
OUTPUT_DIR = "/content/your_malaysian_food_training"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("✅ 配置参数设置完成！")
print(f"📊 训练配置: {TRAINING_CONFIG}")

# =============================================================================
# 第5步：下载您的真实数据集
# =============================================================================

print("🔗 正在下载您的真实马来西亚食物数据集...")

try:
    # 初始化Roboflow客户端
    rf = Roboflow(api_key=ROBOFLOW_CONFIG["api_key"])
    
    # 获取您的项目
    workspace = rf.workspace(ROBOFLOW_CONFIG["workspace"])
    project = workspace.project(ROBOFLOW_CONFIG["project"])
    
    # 下载数据集
    dataset = project.version(ROBOFLOW_CONFIG["version"]).download("yolov8")
    
    print(f"✅ 您的真实数据集下载完成！")
    print(f"📁 数据集路径: {dataset.location}")
    print(f"📊 数据集名称: {dataset.name}")
    print(f"📊 数据集版本: {dataset.version}")
    
except Exception as e:
    print(f"❌ 下载失败: {e}")
    print("\n💡 可能的解决方案:")
    print("1. 检查API密钥是否正确")
    print("2. 确认项目名称和工作空间是否正确")
    print("3. 检查网络连接")
    print("4. 确认项目是否已发布")
    raise e

# =============================================================================
# 第6步：数据集分析
# =============================================================================

def count_files(directory):
    """统计文件数量"""
    if os.path.exists(directory):
        images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])
        labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])
        return images, labels
    return 0, 0

# 统计数据集
train_path = os.path.join(dataset.location, "train")
val_path = os.path.join(dataset.location, "valid")
test_path = os.path.join(dataset.location, "test")

train_images, train_labels = count_files(train_path)
val_images, val_labels = count_files(val_path)
test_images, test_labels = count_files(test_path)

print("\n📊 您的数据集统计:")
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
# 第8步：开始训练您的真实数据
# =============================================================================

print("\n🚀 开始训练您的马来西亚食物识别模型...")
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
    "name": f"your_malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "exist_ok": True,
    "device": TRAINING_CONFIG["device"],
    "workers": 4 if device == "cuda" else 2,
    "verbose": True
}

# 开始训练
results = model.train(**train_args)

print("✅ 训练完成！")
print(f"📁 训练结果保存在: {results.save_dir}")

# =============================================================================
# 第9步：模型验证
# =============================================================================

print("\n🔍 验证您的模型性能...")
best_model_path = os.path.join(results.save_dir, "weights", "best.pt")
best_model = YOLO(best_model_path)

# 在验证集上验证
val_results = best_model.val(data=os.path.join(dataset.location, "data.yaml"))

print("✅ 模型验证完成！")

# 提取性能指标
try:
    metrics = {
        "mAP": float(val_results.box.map) if hasattr(val_results.box, 'map') else 0.0,
        "mAP50": float(val_results.box.map50) if hasattr(val_results.box, 'map50') else 0.0,
        "precision": float(val_results.box.mp) if hasattr(val_results.box, 'mp') else 0.0,
        "recall": float(val_results.box.mr) if hasattr(val_results.box, 'mr') else 0.0
    }
    
    print("\n📈 您的模型性能指标:")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")
        
    # 性能评估
    if metrics["mAP50"] > 0.7:
        print("🎉 优秀！您的模型性能很好！")
    elif metrics["mAP50"] > 0.5:
        print("👍 良好！您的模型性能不错！")
    else:
        print("💡 建议增加训练数据或调整参数以提高性能")
        
except Exception as e:
    print(f"⚠️ 指标提取失败: {e}")

# =============================================================================
# 第10步：Gemini AI营养分析
# =============================================================================

print("\n🧠 配置Gemini AI进行营养分析...")
try:
    genai.configure(api_key="AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8")
    model_gemini = genai.GenerativeModel('gemini-pro')

    def analyze_food_nutrition(food_name):
        """分析马来西亚食物营养信息"""
        prompt = f"""
        请详细分析马来西亚食物 {food_name} 的营养信息：
        
        1. 主要营养成分（每100g）：
           - 卡路里
           - 蛋白质
           - 碳水化合物
           - 脂肪
        
        2. 维生素和矿物质含量
        
        3. 健康建议和注意事项
        
        4. 最佳食用时间
        
        5. 文化背景和特色
        
        请用中文回答，格式清晰易读。
        """
        
        try:
            response = model_gemini.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"营养分析失败: {str(e)}"

    print("✅ Gemini AI配置完成！")

    # 分析您数据集中的食物
    test_foods = ["Nasi Lemak", "Roti Canai", "Char Kway Teow", "Bak Kut Teh", "Curry Laksa"]

    print("\n🍜 马来西亚食物营养分析:")
    print("=" * 60)

    for food in test_foods:
        print(f"\n📊 分析食物: {food}")
        nutrition_info = analyze_food_nutrition(food)
        print(nutrition_info)
        print("-" * 50)

except Exception as e:
    print(f"⚠️ Gemini AI配置失败: {e}")
    print("💡 使用离线营养信息...")

# =============================================================================
# 第11步：模型导出
# =============================================================================

print("\n📦 导出您的模型...")
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
# 第12步：训练总结报告
# =============================================================================

summary = {
    "project_info": {
        "name": "NutriScan MY - Your Malaysian Food Detection Model",
        "roboflow_project_id": ROBOFLOW_CONFIG["project_id"],
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

# 保存详细报告
summary_path = os.path.join(OUTPUT_DIR, "your_training_summary.json")
with open(summary_path, 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)

print("\n📋 您的训练总结:")
print("=" * 60)
print(f"项目名称: {summary['project_info']['name']}")
print(f"Roboflow项目ID: {summary['project_info']['roboflow_project_id']}")
print(f"模型类型: {summary['project_info']['model_type']}")
print(f"训练设备: {summary['project_info']['device']}")
print(f"训练时间: {summary['project_info']['training_date']}")
print(f"数据集大小: {summary['dataset_info']['total_images']} 张图片")
print(f"最佳模型: {os.path.basename(best_model_path)}")
print(f"导出格式: {', '.join(exported_models.keys())}")

if 'metrics' in locals() and metrics:
    print(f"\n📈 模型性能:")
    for metric, value in metrics.items():
        print(f"  {metric}: {value:.4f}")

print(f"\n📁 所有文件保存在: {OUTPUT_DIR}")
print(f"📄 详细报告: {summary_path}")

print("\n🎉 恭喜！您的马来西亚食物识别模型训练完成！")
print("✅ 现在您有了一个专业的AI模型！")
print("🚀 可以部署到移动应用中使用！")

# =============================================================================
# 第13步：下一步建议
# =============================================================================

print("\n💡 下一步建议:")
print("1. 🚀 启用GPU: 运行时 → 更改运行时类型 → GPU（获得更好性能）")
print("2. 📊 收集更多数据: 增加食物照片提高准确性")
print("3. 🔧 模型优化: 尝试yolov8s/m/l/x获得更好性能")
print("4. 📱 移动部署: 转换为TFLite格式用于手机应用")
print("5. 🌐 Web部署: 创建Web应用展示您的模型")

print("\n🔧 性能优化:")
print("- 更大模型: yolov8s (更快) 或 yolov8m (更准确)")
print("- 更多训练: 增加epochs到200-500")
print("- 数据增强: 启用更多数据增强选项")

print("\n📱 移动端集成:")
print("- 转换模型为TFLite格式")
print("- 集成到React Native应用")
print("- 实现实时摄像头识别")
print("- 添加营养分析功能")

print("\n🎯 您的项目链接:")
print(f"- Roboflow项目: https://app.roboflow.com/{ROBOFLOW_CONFIG['workspace']}/{ROBOFLOW_CONFIG['project']}")
print("- 模型文件已保存在Colab中，可以下载使用")

