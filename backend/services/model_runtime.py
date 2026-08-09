from dataclasses import dataclass

try:
    import torch
except Exception as exc:  # pragma: no cover - exercised in environments without torch
    torch = None
    _torch_error = exc
else:
    _torch_error = None


@dataclass
class RuntimeProfile:
    device: str
    mixed_precision: bool
    warning: str | None = None


def get_runtime_profile() -> RuntimeProfile:
    if torch is None:
        return RuntimeProfile(
            device="cpu",
            mixed_precision=False,
            warning=(
                f"PyTorch unavailable ({_torch_error}). Falling back to CPU; "
                "audio and video jobs will be slower."
            ),
        )

    if torch.cuda.is_available():
        return RuntimeProfile(device="cuda", mixed_precision=True)
    return RuntimeProfile(
        device="cpu",
        mixed_precision=False,
        warning="GPU unavailable. Falling back to CPU; audio and video jobs will be slower.",
    )
