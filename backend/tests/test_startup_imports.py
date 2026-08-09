import builtins
import importlib
import sys


def test_backend_main_imports_without_torch(monkeypatch):
    real_import = builtins.__import__

    def guarded_import(name, *args, **kwargs):
        if name == "torch":
            raise OSError("simulated torch import failure")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", guarded_import)

    for module_name in [
        "backend.main",
        "backend.services.model_runtime",
        "backend.services.job_service",
        "ml_models.inference",
        "ml_models.models",
    ]:
        sys.modules.pop(module_name, None)

    module = importlib.import_module("backend.main")

    assert module.app is not None
