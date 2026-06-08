import time
from collections import defaultdict, deque

from fastapi import HTTPException

from backend.services.config import settings


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)

    def check(self, client_id: str) -> None:
        now = time.time()
        window_start = now - 60
        events = self._events[client_id]

        while events and events[0] < window_start:
            events.popleft()

        if len(events) >= settings.rate_limit_per_minute:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

        events.append(now)


rate_limiter = InMemoryRateLimiter()
