import os
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

def enhance_media(file_path: Path) -> None:
    """
    Apply post-processing quality enhancement to image or video files.
    """
    if not file_path.exists():
        print(f"Enhancer error: file {file_path} does not exist")
        return
        
    suffix = file_path.suffix.lower()
    
    if suffix in {".png", ".jpg", ".jpeg", ".bmp", ".webp"}:
        try:
            print(f"Enhancing image quality: {file_path}")
            image_bytes = file_path.read_bytes()
            img = Image.open(BytesIO(image_bytes))
            orig_format = img.format or "PNG"
            
            w, h = img.size
            # Only upscale if image resolution is small (under 2048 in both directions)
            if w < 2048 and h < 2048:
                img = img.resize((w * 2, h * 2), Image.Resampling.BICUBIC)
                print(f"Upscaled image from {w}x{h} to {w*2}x{h*2}")
                
            # Detail and sharpness enhancement
            img = img.filter(ImageFilter.DETAIL)
            
            sharpener = ImageEnhance.Sharpness(img)
            img = sharpener.enhance(1.5)
            
            contraster = ImageEnhance.Contrast(img)
            img = contraster.enhance(1.15)
            
            colorer = ImageEnhance.Color(img)
            img = colorer.enhance(1.1)
            
            out_buf = BytesIO()
            img.save(out_buf, format=orig_format)
            file_path.write_bytes(out_buf.getvalue())
            print(f"Successfully enhanced image: {file_path}")
        except Exception as e:
            print(f"Error enhancing decoded image: {e}")
            
    elif suffix in {".mp4", ".mov", ".avi", ".mkv"}:
        # Skip video enhancement on CPU to prevent excessive processing times and make operations instant
        print(f"Video enhancement skipped for {file_path} to ensure fast response times.")
        return
    else:
        print(f"File format {suffix} not supported for enhancement, skipping.")
