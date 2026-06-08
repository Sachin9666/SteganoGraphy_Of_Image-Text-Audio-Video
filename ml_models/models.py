import torch
from torch import nn


class ImageStegoNet(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv2d(32, 3, kernel_size=1),
        )

    def forward(self, cover: torch.Tensor) -> torch.Tensor:
        return torch.clamp(cover + 0.01 * self.encoder(cover), 0.0, 1.0)


class AudioStegoNet(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv1d(1, 16, kernel_size=7, padding=3),
            nn.GELU(),
            nn.Conv1d(16, 16, kernel_size=5, padding=2),
            nn.GELU(),
            nn.Conv1d(16, 1, kernel_size=1),
        )

    def forward(self, waveform: torch.Tensor) -> torch.Tensor:
        return torch.clamp(waveform + 0.005 * self.encoder(waveform), -1.0, 1.0)


class VideoStegoNet(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv3d(3, 8, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv3d(8, 8, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.Conv3d(8, 3, kernel_size=1),
        )

    def forward(self, frames: torch.Tensor) -> torch.Tensor:
        return torch.clamp(frames + 0.01 * self.encoder(frames), 0.0, 1.0)


class TextStegoTransformer(nn.Module):
    def __init__(self, embedding_dim: int = 64) -> None:
        super().__init__()
        layer = nn.TransformerEncoderLayer(
            d_model=embedding_dim,
            nhead=4,
            dim_feedforward=128,
            batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(layer, num_layers=2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.encoder(x)
