from dataclasses import dataclass

import torch


@dataclass
class RuntimeProfile:
    device: str
    mixed_precision: bool
    warning: str | None = None


def get_runtime_profile() -> RuntimeProfile:
    if torch.cuda.is_available():
        return RuntimeProfile(device="cuda", mixed_precision=True)
    return RuntimeProfile(
        device="cpu",
        mixed_precision=False,
        warning="GPU unavailable. Falling back to CPU; audio and video jobs will be slower.",
    )
