"""
FoodLoop AI - Image Preprocessing Utilities
Handles image loading, resizing (224x224), ImageNet normalization, and base64 decoding.
"""

import io
import base64
import torch
import numpy as np

# ImageNet normalization constants used during training
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
IMAGE_SIZE = (224, 224)

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    from torchvision import transforms
    HAS_TRANSFORMS = True
except ImportError:
    HAS_TRANSFORMS = False


def get_torchvision_transforms():
    """Returns standard torchvision transforms pipeline."""
    if not HAS_TRANSFORMS:
        raise ImportError("torchvision is required for get_torchvision_transforms")
    return transforms.Compose([
        transforms.Resize(IMAGE_SIZE),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
    ])


def preprocess_numpy(img_array):
    """
    Preprocess a numpy array image (H, W, 3) in uint8 [0..255] or float [0..1]
    
    Returns:
        torch.Tensor of shape (1, 3, 224, 224) normalized.
    """
    if HAS_PIL and isinstance(img_array, np.ndarray):
        img = Image.fromarray(img_array.astype(np.uint8)).convert("RGB")
        return preprocess_pil(img)

    # Pure numpy/torch path
    arr = np.array(img_array, dtype=np.float32)
    if arr.max() > 1.0:
        arr = arr / 255.0

    # Ensure shape is (H, W, 3)
    if arr.ndim == 2:
        arr = np.stack([arr] * 3, axis=-1)
    elif arr.ndim == 3 and arr.shape[2] == 4:
        arr = arr[:, :, :3]

    tensor = torch.from_numpy(arr).permute(2, 0, 1)  # (3, H, W)
    
    # Resize if necessary
    if tensor.shape[1] != IMAGE_SIZE[0] or tensor.shape[2] != IMAGE_SIZE[1]:
        tensor = torch.nn.functional.interpolate(
            tensor.unsqueeze(0),
            size=IMAGE_SIZE,
            mode='bilinear',
            align_corners=False
        ).squeeze(0)

    mean = torch.tensor(IMAGENET_MEAN).view(3, 1, 1)
    std = torch.tensor(IMAGENET_STD).view(3, 1, 1)
    normalized = (tensor - mean) / std
    return normalized.unsqueeze(0)


def preprocess_pil(pil_image):
    """
    Preprocess a PIL Image to (1, 3, 224, 224) normalized tensor.
    """
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")
    
    if pil_image.size != IMAGE_SIZE:
        pil_image = pil_image.resize(IMAGE_SIZE)

    arr = np.array(pil_image, dtype=np.float32) / 255.0
    tensor = torch.from_numpy(arr).permute(2, 0, 1)  # (3, 224, 224)
    mean = torch.tensor(IMAGENET_MEAN).view(3, 1, 1)
    std = torch.tensor(IMAGENET_STD).view(3, 1, 1)
    normalized = (tensor - mean) / std
    return normalized.unsqueeze(0)


def preprocess_base64(base64_str):
    """
    Decodes base64 string and preprocesses into (1, 3, 224, 224) tensor.
    Handles data URI prefixes ('data:image/jpeg;base64,') and missing padding.
    """
    if base64_str.startswith("data:"):
        base64_str = base64_str.split(",", 1)[1]

    # Add missing base64 padding if needed
    padding = len(base64_str) % 4
    if padding != 0:
        base64_str += "=" * (4 - padding)

    image_bytes = base64.b64decode(base64_str)
    
    if HAS_PIL:
        image = Image.open(io.BytesIO(image_bytes))
        return preprocess_pil(image)
    else:
        raise RuntimeError("Pillow is required to decode image bytes from base64 string.")
