#!/usr/bin/env python3
"""
NutriScan MY - 本地 YOLOv8 训练脚本
使用 Roboflow 数据集 + Ultralytics API
"""

import os
import sys
from pathlib import Path
from ultralytics import YOLO
import yaml
import json
from datetime import datetime
import uuid

def download_roboflow_dataset():
    """从 Roboflow 下载数据集"""
    try:
        from roboflow import Roboflow
        
        print("🔗 连接到 Roboflow...")
        rf = Roboflow(api_key="BwTemPbP39LHLFH4teds")
        project = rf.workspace("malaysian-food-detection").project("malaysian-food-detection-wy3kt")
        
        print("📥 下载数据集版本 2...")
        dataset = project.version(2).download("yolov8")
        
        print(f"✅ 数据集下载完成: {dataset.location}")
        return dataset.location
        
    except Exception as e:
        print(f"❌ Roboflow 下载失败: {e}")
        return None

def train_model(dataset_path, epochs=100, batch=16, imgsz=640):
    """训练 YOLOv8 模型"""
    
    # 检查数据集
    data_yaml = os.path.join(dataset_path, "data.yaml")
    if not os.path.exists(data_yaml):
        print(f"❌ 找不到 data.yaml: {data_yaml}")
        return None
    
    print("🤖 初始化 YOLOv8 模型...")
    model = YOLO('yolov8n.pt')  # 使用预训练模型
    
    print("🚀 开始训练...")
    print(f"📊 训练参数:")
    print(f"  - 数据集: {dataset_path}")
    print(f"  - 轮次: {epochs}")
    print(f"  - 批次大小: {batch}")
    print(f"  - 图像尺寸: {imgsz}")
    
    # 开始训练
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        batch=batch,
        imgsz=imgsz,
        device='cpu',  # CPU (自动兼容无GPU环境)
        project='nutriscan_training',
        name=f'malaysian_food_yolov8n_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
        save=True,
        plots=True
    )
    
    print("✅ 训练完成!")
    return model, results

def validate_model(model, dataset_path):
    """验证模型"""
    print("🔍 验证模型...")
    data_yaml = os.path.join(dataset_path, "data.yaml")
    results = model.val(data=data_yaml)
    print("✅ 验证完成!")
    return results

def export_model(model):
    """导出模型"""
    print("📦 导出模型...")
    
    formats = ['onnx', 'torchscript', 'tflite']
    exported = {}
    
    for fmt in formats:
        try:
            path = model.export(format=fmt)
            exported[fmt] = path
            print(f"✅ {fmt.upper()} 导出成功: {path}")
        except Exception as e:
            print(f"❌ {fmt.upper()} 导出失败: {e}")
    
    return exported

def save_training_session(training_info, session_file):
    os.makedirs(os.path.dirname(session_file), exist_ok=True)
    # 加载原有会话列表
    try:
        if os.path.exists(session_file):
            with open(session_file, 'r', encoding='utf-8') as f:
                sessions = json.load(f)
        else:
            sessions = {}
    except Exception:
        sessions = {}
    session_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    sessions[session_id] = {
        "id": session_id,
        "status": "completed",
        "created_at": now,
        "updated_at": now,
        "dataset_id": "roboflow_downloaded",
        "model_config": training_info.get("model_config", {}),
        "metrics": training_info.get("metrics", {}),
        "best_model_path": training_info.get("best_model_path", ""),
        "exported_models": training_info.get("exported_models", {}),
        "validation_results": training_info.get("validation_results", ""),
    }
    with open(session_file, 'w', encoding='utf-8') as f:
        json.dump(sessions, f, ensure_ascii=False, indent=2)
    print(f"📜 会话记录已同步到: {session_file}")

def main():
    """主函数"""
    print("🎯 NutriScan MY - 本地训练开始")
    print("=" * 50)
    
    # 1. 下载数据集
    dataset_path = download_roboflow_dataset()
    if not dataset_path:
        print("❌ 无法下载数据集，退出")
        return
    
    # 2. 训练模型
    model, results = train_model(dataset_path)
    if not model:
        print("❌ 训练失败，退出")
        return
    
    # 3. 验证模型
    val_results = validate_model(model, dataset_path)
    
    # 4. 导出模型
    exported_models = export_model(model)
    
    # 5. 保存训练信息
    training_info = {
        "timestamp": datetime.now().isoformat(),
        "dataset_path": dataset_path,
        "model_path": model.ckpt_path,
        "validation_results": str(val_results),
        "exported_models": exported_models
    }
    
    with open("training_results.json", "w") as f:
        json.dump(training_info, f, indent=2)
    
    # 尝试提取更丰富的训练参数和可视化指标
    best_model_path = ""
    try:
        if hasattr(model, "trainer") and hasattr(model.trainer, "best"):
            best_model_path = model.trainer.best
        elif hasattr(model, "best"):
            best_model_path = model.best
        elif hasattr(model, "ckpt_path"):
            best_model_path = model.ckpt_path
    except Exception:
        best_model_path = ""

    # 获取准确率等训练指标  
    metric_info = {}
    try:
        metric_info = results.results_dict if hasattr(results, 'results_dict') else {}
    except Exception:
        pass
    # 获取训练超参数（全部真实参数优先）
    train_config = None
    try:
        train_config = model.trainer.args if hasattr(model, 'trainer') and hasattr(model.trainer, 'args') else None
    except Exception:
        train_config = None
    model_config = train_config if train_config else {
        "model_type": "yolov8n",
        "epochs": 100,
        "batch_size": 16,
        "learning_rate": 0.01,
        "img_size": 640
    }
    # 生成完整训练历史
    session_file_path = os.path.join("data", "training_sessions.json")
    save_training_session({
        "model_config": model_config,
        "metrics": metric_info,
        "best_model_path": str(best_model_path),
        "exported_models": exported_models,
        "validation_results": str(val_results)
    }, session_file_path)
    # 立即输出调试检查
    import json
    if os.path.exists(session_file_path):
        with open(session_file_path, 'r', encoding='utf-8') as f:
            sessions = json.load(f)
            print('写入历史:', json.dumps(sessions, ensure_ascii=False, indent=2))

    print("\n🎉 训练完成!")
    print(f"📁 模型保存在: {model.ckpt_path}")
    print(f"📄 训练信息: training_results.json")
    print("🚀 现在可以部署到你的应用中了!")

if __name__ == "__main__":
    main()

