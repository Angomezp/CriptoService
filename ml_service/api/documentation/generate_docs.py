from pathlib import Path
import json

from ml_service.main import app

Path("docs").mkdir(exist_ok=True)
Path("docs/api_ml_service").mkdir(exist_ok=True, parents=True)

with open("docs/api_ml_service/openapi.json", "w", encoding="utf-8") as f:
    json.dump(
        app.openapi(),
        f,
        indent=4,
        ensure_ascii=False
    )