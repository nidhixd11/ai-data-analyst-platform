import uuid
from datetime import datetime, timedelta
from threading import Lock


class SessionStore:
    """
    In-memory session store.
    Stores session data as a plain Python dictionary.
    Each session expires after 1 hour (TTL eviction).
    Thread-safe via a Lock so concurrent requests don't corrupt data.
    """

    TTL_HOURS = 1

    def __init__(self):
        self._store: dict = {}   # the main dictionary holding all sessions
        self._lock = Lock()      # prevents two requests editing _store at the same time

    def create_session(self) -> str:
        """
        Creates a new session and returns its unique ID.
        Think of this as: user arrives → give them a locker → hand them the key.
        """
        session_id = str(uuid.uuid4())       # generate a random unique ID
        with self._lock:
            self._store[session_id] = {
                "created_at": datetime.utcnow(),  # record when session was created
                "data": {}                         # empty dict to store session data later
            }
        return session_id

    def get_session(self, session_id: str) -> dict | None:
        """
        Retrieves session data if it exists and hasn't expired.
        Returns None if session is missing or older than 1 hour.
        """
        with self._lock:
            self._evict_expired()               # clean up old sessions first
            session = self._store.get(session_id)
            if session is None:
                return None
            return session["data"]

    def update_session(self, session_id: str, data: dict) -> bool:
        """
        Updates the data stored in a session.
        Returns True if successful, False if session doesn't exist or is expired.
        """
        with self._lock:
            self._evict_expired()
            if session_id not in self._store:
                return False
            self._store[session_id]["data"].update(data)
            return True

    def delete_session(self, session_id: str) -> None:
        """
        Manually deletes a session — e.g. when user logs out or clears their data.
        """
        with self._lock:
            # remove if exists, do nothing if not
            self._store.pop(session_id, None)

    def _evict_expired(self) -> None:
        """
        Internal method — deletes all sessions older than 1 hour.
        Called automatically before every read/write so stale sessions never linger.
        Note: starts with _ to signal it's private — only used inside this class.
        """
        cutoff = datetime.utcnow() - timedelta(hours=self.TTL_HOURS)
        expired = [
            sid for sid, session in self._store.items()
            if session["created_at"] < cutoff
        ]
        for sid in expired:
            del self._store[sid]


# Single shared instance — the whole app uses this one object
# Think of it as one physical locker room everyone shares
session_store = SessionStore()
