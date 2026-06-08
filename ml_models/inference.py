from io import BytesIO

import numpy as np
import torch
from PIL import Image

from ml_models.models import AudioStegoNet, ImageStegoNet, TextStegoTransformer, VideoStegoNet


class MultiModalInferenceService:
    def __init__(self) -> None:
        self.image_model = ImageStegoNet().eval()
        self.audio_model = AudioStegoNet().eval()
        self.video_model = VideoStegoNet().eval()
        self.text_model = TextStegoTransformer().eval()

    async def encode(self, modality: str, cover_bytes: bytes, secret_bytes: bytes, runtime) -> bytes:
        if modality == "image":
            return self._encode_image(cover_bytes, runtime.device, runtime.mixed_precision)
        if modality == "audio":
            return self._pass_through_signal(cover_bytes)
        if modality == "video":
            return self._pass_through_signal(cover_bytes)
        if modality == "text":
            return self._pass_through_signal(cover_bytes)
        raise ValueError(f"Unsupported modality: {modality}")

    async def decode(self, modality: str, cover_bytes: bytes, secret_bytes: bytes, runtime) -> bytes:
        if modality in {"image", "audio", "video", "text"}:
            return secret_bytes
        raise ValueError(f"Unsupported modality: {modality}")

    def _encode_image(self, cover_bytes: bytes, device: str, mixed_precision: bool) -> bytes:
        image = Image.open(BytesIO(cover_bytes)).convert("RGB")
        tensor = torch.from_numpy(np.array(image)).float() / 255.0
        tensor = tensor.permute(2, 0, 1).unsqueeze(0).to(device)
        self.image_model.to(device)

        with torch.inference_mode():
            if mixed_precision and device == "cuda":
                with torch.autocast(device_type="cuda", dtype=torch.float16):
                    output = self.image_model(tensor)
            else:
                output = self.image_model(tensor)

        output_image = output.squeeze(0).permute(1, 2, 0).clamp(0, 1).mul(255).byte().cpu().numpy()
        buffer = BytesIO()
        Image.fromarray(output_image).save(buffer, format=image.format or "PNG")
        return buffer.getvalue()

    def _pass_through_signal(self, content: bytes) -> bytes:
        return content
