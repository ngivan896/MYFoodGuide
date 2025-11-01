import sys
import json
from pathlib import Path

try:
    from ultralytics import YOLO
    
    model_path = r"C:\\Users\\ngiva\\Desktop\\MYFoodGuide\\nutriscan_training\\malaysian_food_yolov8n_20251030_181025\\weights\\best.pt"
    image_path = r"C:\\Users\\ngiva\\Desktop\\MYFoodGuide\\web_ui\\uploads\\f52739895c431cef4b2afd1d34cc3158"
    
    # 加载模型
    model = YOLO(model_path)
    
    # 进行推理
    results = model(image_path, conf=0.25, save=False, verbose=False)
    
    detections = []
    for result in results:
        boxes = result.boxes
        for i in range(len(boxes)):
            box = boxes[i]
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            
            # 获取类别名称
            class_name = result.names[cls] if hasattr(result, 'names') and cls < len(result.names) else f"class_{cls}"
            
            detections.append({
                "class": class_name,
                "confidence": conf,
                "bbox": [xyxy[0], xyxy[1], xyxy[2] - xyxy[0], xyxy[3] - xyxy[1]]
            })
    
    print(json.dumps({"success": True, "detections": detections}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
