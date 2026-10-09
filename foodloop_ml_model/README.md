# FoodLoop AI - Machine Learning Model Component

This directory contains the standalone Computer Vision Machine Learning model extracted and restructured from FoodBank-AI for the **FoodLoop AI** project (food recognition, food waste reduction, and food donations).

---

## 📌 Model Overview

- **Architecture:** ResNet-50 (`torchvision.models.resnet50` / Pure PyTorch `ResNet` with Bottleneck residual blocks).
- **Framework:** PyTorch (v2.0+)
- **Pretrained Base:** ImageNet-1k (V1)
- **Classification Head:** Linear layer (`2048` features $\rightarrow$ `59` food categories).
- **Trained Weights:** `model/fine_tuned_model.pth` (~94.8 MB, 320 state dictionary tensors).
- **Input Specifications:** `3 x 224 x 224` RGB image tensor normalized with ImageNet stats (`mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`).
- **Output:** Multi-class softmax probability distribution across 59 food classes.

---

## 🏷️ Supported Food Classes (59 Total)

```json
[
  "apple", "banana", "bread", "broccoli", "carrot", "cheese", "coriander seeds",
  "corn", "cucumber", "cumin seed", "eggplant", "egg", "galangal", "gandum",
  "garlic", "ginger", "grated coconut", "green chilli", "green paprika", "honey",
  "mango", "milk", "mung beans", "mustard leaf", "noodles", "olive oil", "orange",
  "peanuts", "peanut butter", "pepper powder", "pineapple", "potato", "raw chicken",
  "raw cow meat", "raw fish", "raw goat meat", "raw squid", "red beans",
  "red chilli", "red onion", "red paprika", "rice", "rice flour", "salt",
  "shrimp", "soybeans raw", "spaghetti", "spinach", "sugar", "sun kara",
  "sweet corn", "sweet potato", "tapioca flour", "tempe mentah", "tofu", "tomato",
  "turmeric", "wheat flour", "yogurt"
]
```

---

## 📂 Directory Layout

```text
foodloop_ml_model/
├── model/
│   ├── fine_tuned_model.pth    # Fine-tuned ResNet-50 PyTorch weights (94.8 MB)
│   └── architecture.py         # Pure PyTorch and torchvision compatible model definition
├── inference/
│   └── predict.py              # FoodClassifier inference engine (File, PIL, Base64, Numpy)
├── preprocessing/
│   └── transform.py            # ImageNet transforms, resizing (224x224), and base64 decoders
├── training/
│   ├── train.py                # Retraining / fine-tuning script
│   └── prepare_dataset.py      # Dataset loader and image preprocessing pipeline
├── config/
│   ├── dataset_metadata.json   # 59 class labels and label-to-index mapping
│   ├── num_classes.json        # Class count configuration
│   └── device.json             # Execution device configuration
├── requirements.txt            # ML runtime dependencies
└── README.md                   # Model documentation and running instructions
```

---

## 🚀 Step-by-Step Running Instructions

### Step 1: Set Up Python Virtual Environment

Navigate to the `foodloop_ml_model` directory and create an isolated virtual environment:

#### Windows (PowerShell / Command Prompt):
```powershell
# Navigate to the directory
cd foodloop_ml_model

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Or in CMD:
# .\venv\Scripts\activate.bat
```

#### macOS / Linux:
```bash
# Navigate to the directory
cd foodloop_ml_model

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

---

### Step 2: Install ML Dependencies

Install the required PyTorch, Pillow, NumPy, and Pandas packages:

```bash
pip install -r requirements.txt
```

---

### Step 3: Run Model Predictions (Inference)

You can run predictions using the Command Line Interface (CLI) or directly within your Python backend services.

#### Option A: Command Line Interface (CLI)

Run inference directly on any image file:

```bash
python inference/predict.py --image "path/to/your/food_image.jpg" --top_k 5
```

**Example Output:**
```text
Loaded FoodClassifier successfully with 59 classes on cpu.

Prediction Results:
Top 1: apple (99.03%)

Top Rankings:
  - apple: 99.03% (score: 0.9903)
  - red onion: 0.39% (score: 0.0039)
  - mango: 0.18% (score: 0.0018)
  - tomato: 0.14% (score: 0.0014)
  - red paprika: 0.08% (score: 0.0008)
```

---

#### Option B: Python Integration (In-Memory / Backend API)

Import and use the `FoodClassifier` in your project:

```python
from inference.predict import FoodClassifier

# 1. Initialize classifier (automatically loads fine_tuned_model.pth on CPU or CUDA)
classifier = FoodClassifier()

# 2. Predict from a local file path:
result = classifier.predict_image("test_image.jpg", top_k=5)
print(f"Item: {result['predicted_label']} ({result['probability_percent']}%)")

# 3. Predict from a Base64 string (ideal for mobile/web upload endpoints):
base64_data = "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
result = classifier.predict_base64(base64_data, top_k=3)
print(result)

# 4. Predict from a PIL Image:
# from PIL import Image
# img = Image.open("food.png")
# result = classifier.predict_pil(img)

# 5. Predict from a NumPy array (H, W, 3):
# result = classifier.predict_numpy(np_array)
```

---

#### Option C: Quick Verification Test Script

Run a quick inline Python verification:

```bash
python -c "from inference.predict import FoodClassifier; clf = FoodClassifier(); print('Model initialized successfully with', clf.num_classes, 'classes on', clf.device)"
```

---

## 🔄 Dataset Preparation & Model Re-training

If you want to fine-tune the model on new food items or expand the dataset:

### Step 1: Organize Raw Images

Create a folder structure with subfolders for each category:

```text
dataset/
├── apple/
│   ├── img1.jpg
│   └── img2.jpg
├── banana/
│   ├── img1.jpg
│   └── img2.jpg
└── ...
```

### Step 2: Prepare & Pickle the Dataset

Convert raw images into normalized $224 \times 224$ tensors:

```bash
python training/prepare_dataset.py --data_dir dataset/ --output_pkl images.pkl
```

### Step 3: Train / Fine-Tune the Model

Run transfer learning with the ResNet-50 backbone:

```bash
python training/train.py --data_pickle images.pkl --epochs 10 --batch_size 32 --learning_rate 0.001
```

The new weights will be automatically saved to `model/fine_tuned_model.pth`.

---

## 🔬 Model Verification & Benchmark Results

Verified on real sample test images using `model/fine_tuned_model.pth`:

| Input Image | Ground Truth | Top-1 Prediction | Top-1 Confidence | Top-2 Prediction |
| :--- | :--- | :--- | :--- | :--- |
| `apple_0.jpg` | `apple` | **`apple`** | **99.03%** | `red onion` (0.39%) |
| `banana_0.png` | `banana` | **`banana`** | **90.85%** | `mango` (5.13%) |

---

## ⚖️ Attribution & License
Original model backbone: ResNet-50 (He et al., ImageNet pre-trained).  
Fine-tuning code and weights adapted from the FoodBank-AI project (MIT License).
