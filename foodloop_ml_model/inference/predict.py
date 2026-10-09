"""
FoodLoop AI - Model Inference Engine
Loads fine-tuned ResNet-50 weights and runs predictions on images.
"""

import os
import sys
import json
import torch

# Ensure local packages can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from model.architecture import build_model
from preprocessing.transform import preprocess_pil, preprocess_numpy, preprocess_base64


class FoodClassifier:
    """
    FoodClassifier loads the fine-tuned ResNet-50 model and performs food recognition.
    """
    def __init__(self, model_weights_path=None, config_path=None, device=None):
        if config_path is None:
            config_path = os.path.join(BASE_DIR, "config", "dataset_metadata.json")

        if not os.path.exists(config_path):
            raise FileNotFoundError(f"Configuration metadata file not found at: {config_path}")

        with open(config_path, "r") as f:
            meta = json.load(f)
            self.labels = meta["labels"]
            self.label_to_index = meta.get("label_to_index", {l: i for i, l in enumerate(self.labels)})
            self.num_classes = len(self.labels)

        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        if model_weights_path is None:
            model_weights_path = os.path.join(BASE_DIR, "model", "fine_tuned_model.pth")

        self.model = build_model(
            num_classes=self.num_classes,
            weights_path=model_weights_path if os.path.exists(model_weights_path) else None,
            device=self.device
        )
        self.model.eval()

    def predict_tensor(self, tensor, top_k=5):
        """
        Run forward pass on a preprocessed (1, 3, 224, 224) tensor.
        """
        tensor = tensor.to(self.device)
        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.softmax(logits, dim=1)
            
            k = min(top_k, self.num_classes)
            top_probs, top_indices = torch.topk(probabilities, k=k, dim=1)

        top_predictions = []
        for i in range(k):
            idx = top_indices[0][i].item()
            prob = top_probs[0][i].item()
            top_predictions.append({
                "label": self.labels[idx],
                "confidence": round(prob, 4),
                "probability_percent": round(prob * 100, 2)
            })

        return {
            "predicted_label": top_predictions[0]["label"],
            "confidence": top_predictions[0]["confidence"],
            "probability_percent": top_predictions[0]["probability_percent"],
            "top_k": top_predictions
        }

    def predict_image(self, image_path, top_k=5):
        """Predict food class from a local image file path."""
        try:
            from PIL import Image
            img = Image.open(image_path)
            tensor = preprocess_pil(img)
            return self.predict_tensor(tensor, top_k=top_k)
        except ImportError:
            raise RuntimeError("Pillow is required for image file reading. Run: pip install Pillow")

    def predict_base64(self, base64_str, top_k=5):
        """Predict food class from a base64 encoded image string."""
        tensor = preprocess_base64(base64_str)
        return self.predict_tensor(tensor, top_k=top_k)

    def predict_numpy(self, np_array, top_k=5):
        """Predict food class from a numpy array (H, W, 3)."""
        tensor = preprocess_numpy(np_array)
        return self.predict_tensor(tensor, top_k=top_k)


def run_prediction(base64_img):
    """
    Compatibility wrapper matching original FoodBank-AI API.
    """
    classifier = FoodClassifier()
    result = classifier.predict_base64(base64_img, top_k=1)
    return {
        "label": result["predicted_label"],
        "probability": result["confidence"]
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="FoodLoop AI Model Inference")
    parser.add_argument("--image", type=str, help="Path to input food image")
    parser.add_argument("--top_k", type=int, default=5, help="Number of top predictions to display")
    args = parser.parse_args()

    classifier = FoodClassifier()
    print(f"Loaded FoodClassifier successfully with {classifier.num_classes} classes on {classifier.device}.")

    if args.image:
        res = classifier.predict_image(args.image, top_k=args.top_k)
        print("\nPrediction Results:")
        print(f"Top 1: {res['predicted_label']} ({res['probability_percent']}%)")
        print("\nTop Rankings:")
        for r in res["top_k"]:
            print(f"  - {r['label']}: {r['probability_percent']}% (score: {r['confidence']})")
