"""
Persistent session storage.
Backed by local disk (one pickle file per session) so sessions survive
process restarts — e.g. uvicorn --reload picking up a file save locally,
or a container restart in production.
Note: on Render's free tier, the container filesystem is not guaranteed
to persist across a full spin-down/restart cycle. This still fixes the
local --reload problem completely. For guaranteed production durability,
swap this for an external store (Postgres, Redis, S3) behind the same
get/set/delete interface.
"""
from __future__ import annotations

import pickle
import tempfile
from pathlib import Path
from typing import Any


class SessionStore:
    def __init__(self, base_dir: str | None = None) -> None:
        self.base_dir = Path(
            base_dir or Path(tempfile.gettempdir()) /
            "ai-data-analyst-sessions"
        )
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, session_id: str) -> Path:
        return self.base_dir / f"{session_id}.pkl"

    def set(self, session_id: str, data: dict[str, Any]) -> None:
        with open(self._path(session_id), "wb") as f:
            pickle.dump(data, f)

    def get(self, session_id: str) -> dict[str, Any] | None:
        path = self._path(session_id)
        if not path.exists():
            return None
        with open(path, "rb") as f:
            return pickle.load(f)

    def delete(self, session_id: str) -> None:
        path = self._path(session_id)
        if path.exists():
            path.unlink()
