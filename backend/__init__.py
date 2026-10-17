import sys
import os

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

_parent_dir = os.path.dirname(_backend_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)

try:
    import backend.models
    sys.modules['models'] = backend.models
    import backend.models.schemas
    sys.modules['models.schemas'] = backend.models.schemas
except Exception:
    pass
