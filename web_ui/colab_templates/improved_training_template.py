#!/usr/bin/env python3
"""
🍜 NutriScan MY - 高准确率训练模板
针对 Wantan Mee 和 Char Kway Teow 混淆问题优化的训练配置

使用方法：
1. 在Google Colab中运行此脚本
2. 自动下载数据集并开始训练
3. 使用优化后的参数提升模型准确率
"""

# =============================================================================
# 配置参数 - 已优化用于提升准确率
# =============================================================================

# API配置
ROBOFLOW_API_KEY = "BwTemPbP39LHLFH4teds"
ROBOFLOW_PROJECT_ID = "projects/326667818607"
GEMINI_API_KEY = "AIzaSyAT6_BA42_EwFRDVgPKNV8A_w_E2llJVm8"

# 优化后的训练配置
TRAINING_CONFIG = {
    "model_type": "yolov8s",      # 从 nano 升级到 small，提升准确率
    "epochs": 200,                 # 增加训练轮次，让模型学习更充分
    "batch_size": 16,              # 批次大小（根据GPU内存调整）
    "learning_rate": 0.005,        # 降低学习率，更细致地学习
    "img_size": 640,               # 图像大小
    "patience": 40,                # 增加早停耐心值
    "save_period": 10              # 每10个epoch保存一次
}

# =============================================================================
# 自动安装依赖
# =============================================================================

import subprocess
import sys

def install_package(package):
    """安装Python包"""
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--quiet"])

print("🔧 安装依赖包...")
packages = [
    "ultralytics",
    "roboflow", 
    "torch",
    "torchvision",
    "matplotlib",
    "seaborn",
    "pandas",
    "numpy",
    "google-generativeai"
]

for package in packages:
    try:
        install_package(package)
        print(f"✅ {package} 安装完成")
    except Exception as e:
        print(f"❌ {package} 安装失败: {e}")

print("✅ 所有依赖包安装完成！")

# =============================================================================
# 导入库
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
# 设置输出目录
# =============================================================================

OUTPUT_DIR = "/content/nutriscan_training"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"📁 输出目录: {OUTPUT_DIR}")

# =============================================================================
# Roboflow数据集下载
# =============================================================================

print("🔗 连接到Roboflow项目...")
rf = Roboflow(api_key=ROBOFLOW_API_KEY)
project = rf.workspace("malaysian-food-detection").project("malaysian-food-detection")
dataset = project.version(1).download("yolov8")

print(f"✅ 数据集下载完成！")
print(f"📁 数据集路径: {dataset.location}")

# =============================================================================
# 数据集统计和分析
# =============================================================================

def count_files(directory):
    """统计目录中的图片和标签文件"""
    images = len([f for f in os.listdir(directory) if f.endswith(('.jpg', '.jpeg', '.png'))])
    labels = len([f for f in os.listdir(directory) if f.endswith('.txt')])
    return images, labels

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

# 检查数据平衡性
print("\n⚠️ 数据平衡性提醒:")
print("   如果 Wantan Mee 或 Char Kway Teow 样本较少，")
print("   建议在 Roboflow 中上传更多该类别的图片！")

# =============================================================================
# YOLOv8模型训练（优化配置）
# =============================================================================

print("\n🤖 初始化YOLOv8模型...")
model_type = TRAINING_CONFIG["model_type"]
model = YOLO(f"{model_type}.pt")

print(f"✅ YOLOv8模型初始化完成: {model_type}")
print(f"📊 模型参数: {sum(p.numel() for p in model.model.parameters())} 个参数")

print("\n🚀 开始模型训练（使用优化参数）...")
print(f"⏰ 开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# 优化后的训练参数
train_args = {
    "data": os.path.join(dataset.location, "data.yaml"),
    "epochs": TRAINING_CONFIG["epochs"],
    "batch": TRAINING_CONFIG["batch_size"],
    "imgsz": TRAINING_CONFIG["img_size"],
    "lr0": TRAINING_CONFIG["learning_rate"],      # 初始学习率
    "lrf": 0.01,                                   # 最终学习率（相对于初始）
    "patience": TRAINING_CONFIG["patience"],
    "save_period": TRAINING_CONFIG["save_period"],
    
    # 数据增强配置（优化用于食物识别）
    "hsv_h": 0.015,      # 色调增强（小幅调整，保持食物自然颜色）
    "hsv_s": 0.7,        # 饱和度增强
    "hsv_v": 0.4,        # 明度增强
    "degrees": 10,       # 旋转角度（-10 到 +10 度，食物图片适度旋转）
    "translate": 0.1,    # 平移
    "scale": 0.5,        # 缩放
    "flipud": 0.0,       # 上下翻转（食物图片不使用）
    "fliplr": 0.5,       # 左右翻转
    "mosaic": 1.0,       # Mosaic 增强（有助于提高鲁棒性）
    "mixup": 0.1,        # Mixup 增强（适度使用）
    
    # 其他配置
    "project": OUTPUT_DIR,
    "name": f"malaysian_food_{model_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "exist_ok": True,
    "device": 0,  # 使用GPU（如果有）
    "workers": 4,
    "verbose": True
}

print("\n📋 训练配置:")
print(f"  模型: {model_type}")
print(f"  训练轮次: {TRAINING_CONFIG['epochs']}")
print(f"  学习率: {TRAINING_CONFIG['learning_rate']}")
print(f"  批次大小: {TRAINING_CONFIG['batch_size']}")
print(f"  早停耐心值: {TRAINING_CONFIG['patience']}")
print(f"  数据增强: 已启用（优化配置）")

# 开始训练
results = model.train(**train_args)

print("\n✅ 训练完成！")
print(f"⏰ 完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# =============================================================================
# 模型验证和结果分析
# =============================================================================

print("\n🔍 模型验证...")
best_model_path = results.save_dir / "weights" / "best.pt"
print(f"📁 最佳模型路径: {best_model_path}")

# 验证模型
metrics = results.results_dict
print("\n📊 训练结果:")
print(f"  mAP50: {metrics.get('metrics/mAP50(B)', 'N/A'):.4f}")
print(f"  mAP50-95: {metrics.get('metrics/mAP50-95(B)', 'N/A'):.4f}")
print(f"  Precision: {metrics.get('metrics/precision(B)', 'N/A'):.4f}")
print(f"  Recall: {metrics.get('metrics/recall(B)', 'N/A'):.4f}")

# 检查混淆矩阵
confusion_matrix_path = results.save_dir / "confusion_matrix.png"
if os.path.exists(confusion_matrix_path):
    print(f"\n📈 混淆矩阵已生成: {confusion_matrix_path}")
    print("   请查看混淆矩阵，特别关注 Wantan Mee 和 Char Kway Teow 之间的混淆情况")

print("\n💡 改进建议:")
print("   1. 如果 Wantan Mee 和 Char Kway Teow 仍然混淆，")
print("      建议在 Roboflow 中增加更多这两个类别的训练数据")
print("   2. 查看混淆矩阵，找出容易混淆的样本，重新标注或增加类似样本")
print("   3. 如果准确率仍不满意，可以尝试使用 yolov8m 或 yolov8l 模型")

# =============================================================================
# 模型导出
# =============================================================================

print("\n📦 导出模型...")
try:
    # 导出ONNX格式
    model.export(format="onnx")
    print("✅ ONNX 格式导出完成")
    
    # 导出TorchScript格式
    model.export(format="torchscript")
    print("✅ TorchScript 格式导出完成")
except Exception as e:
    print(f"⚠️ 模型导出失败: {e}")

print("\n🎉 训练流程全部完成！")
print(f"📁 所有文件保存在: {results.save_dir}")

