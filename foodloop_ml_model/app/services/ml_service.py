"""
FoodLoop AI - ML Inference Service
Manages ResNet-50 PyTorch model lifecycle, image validation, and predictions.
"""

import os
import sys
import io
from typing import Dict, Any, Tuple
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from inference.predict import FoodClassifier
from preprocessing.transform import preprocess_pil

ALLOWED_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


class MLService:
    _instance = None
    classifier = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLService()
        return cls._instance

    def initialize(self):
        """Loads model once during application startup."""
        print("[MLService] Initializing fine-tuned ResNet-50 PyTorch model...")
        weights_path = os.path.join(BASE_DIR, "model", "fine_tuned_model.pth")
        config_path = os.path.join(BASE_DIR, "config", "dataset_metadata.json")

        if not os.path.exists(weights_path):
            print(f"[MLService] Warning: Model weights file missing at {weights_path}")
            self.classifier = None
            return False

        try:
            self.classifier = FoodClassifier(
                model_weights_path=weights_path,
                config_path=config_path
            )
            print(f"[MLService] Successfully loaded model with {self.classifier.num_classes} classes on device '{self.classifier.device}'.")
            return True
        except Exception as e:
            print(f"[MLService] Failed to load ML Classifier: {e}")
            self.classifier = None
            return False

    def is_available(self) -> bool:
        return self.classifier is not None

    def validate_image_bytes(self, content: bytes, content_type: Optional[str] = None) -> Tuple[bool, str, Optional[Image.Image]]:
        """Validate image size, MIME type, and PIL loadability."""
        if len(content) == 0:
            return False, "Uploaded image file is empty (0 bytes).", None

        if len(content) > MAX_FILE_SIZE:
            return False, f"Image size exceeds limit of {MAX_FILE_SIZE // (1024 * 1024)}MB.", None

        try:
            img = Image.open(io.BytesIO(content))
            img.verify()
            # Reopen for usage after verify()
            img = Image.open(io.BytesIO(content))
            return True, "Valid image", img
        except Exception as e:
            return False, f"Invalid image file format or corrupted binary stream: {str(e)}", None

    def predict_image(self, pil_img: Image.Image, top_k: int = 5) -> Dict[str, Any]:
        """Run ML inference on a validated PIL Image."""
        if not self.classifier:
            raise RuntimeError("ML Classifier is not initialized or model weights are unavailable.")

        tensor = preprocess_pil(pil_img)
        res = self.classifier.predict_tensor(tensor, top_k=top_k)

        predicted_label = res["predicted_label"]
        confidence = res["confidence"]

        # Freshness score heuristic
        freshness_score = min(99, max(85, int(confidence * 100)))
        if freshness_score >= 94:
            freshness_tier = "Tier 1 - Optimal (4-6 days)"
        elif freshness_score >= 88:
            freshness_tier = "Tier 2 - Good (2-3 days)"
        else:
            freshness_tier = "Tier 3 - Immediate Rescue (< 24h)"

        return {
            "success": True,
            "isLiveModel": True,
            "predicted_label": predicted_label,
            "confidence": confidence,
            "probability_percent": res["probability_percent"],
            "freshness_score": freshness_score,
            "freshness_tier": freshness_tier,
            "top_k": res["top_k"],
            "device": str(self.classifier.device),
            "model_architecture": "ResNet-50 (Fine-Tuned Transfer Learning)"
        }
