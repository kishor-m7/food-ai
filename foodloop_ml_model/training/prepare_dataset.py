"""
FoodLoop AI - Dataset Preparation Pipeline
Reads folder-structured food images, resizes them to 224x224 RGB, and pickles data for fast model training.
"""

import os
import argparse
import numpy as np
import pandas as pd
from PIL import Image


def process_image_directory(data_dir, output_dir=None, target_size=(224, 224)):
    """
    Scans a folder containing category subdirectories of images or flat resized images.
    Returns a dictionary of category -> numpy array of images.
    """
    data = {}
    valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)

    for root, dirs, files in os.walk(data_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in valid_extensions:
                continue

            filepath = os.path.join(root, file)
            # If subdirectories exist, category is directory name; otherwise parse filename prefix
            rel_dir = os.path.relpath(root, data_dir)
            if rel_dir != ".":
                category = rel_dir.replace("\\", "_").replace("/", "_").lower()
            else:
                category = "_".join(os.path.splitext(file)[0].split("_")[:-1]).lower()

            try:
                img = Image.open(filepath).convert("RGB")
                if img.size != target_size:
                    img = img.resize(target_size)

                if output_dir:
                    save_name = f"{category}_{len(data.get(category, []))}.jpg"
                    img.save(os.path.join(output_dir, save_name))

                arr = np.array(img, dtype=np.uint8)
                if arr.shape == (target_size[0], target_size[1], 3):
                    if category not in data:
                        data[category] = []
                    data[category].append(arr)
            except Exception as e:
                print(f"Skipping corrupt image {filepath}: {e}")

    return data


def save_to_dataframe(image_dict, output_pkl="images.pkl", target_size=(224, 224)):
    """
    Flattens 224x224x3 image matrices into pandas DataFrame rows and serializes to pickle.
    """
    rows = []
    expected_pixels = target_size[0] * target_size[1] * 3

    for label, img_list in image_dict.items():
        for img in img_list:
            flat = img.flatten()
            if len(flat) == expected_pixels:
                rows.append([label] + flat.tolist())

    columns = ["label"] + [f"pixel_{i}" for i in range(expected_pixels)]
    df = pd.DataFrame(rows, columns=columns)
    df.to_pickle(output_pkl)
    print(f"Saved {len(df)} images across {len(image_dict)} categories to {output_pkl}")
    return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FoodLoop AI Dataset Preparation")
    parser.add_argument("--data_dir", type=str, required=True, help="Path to input images directory")
    parser.add_argument("--output_dir", type=str, default=None, help="Optional directory to save resized 224x224 images")
    parser.add_argument("--output_pkl", type=str, default="images.pkl", help="Output pickle filename")
    args = parser.parse_args()

    data = process_image_directory(args.data_dir, output_dir=args.output_dir)
    save_to_dataframe(data, output_pkl=args.output_pkl)
