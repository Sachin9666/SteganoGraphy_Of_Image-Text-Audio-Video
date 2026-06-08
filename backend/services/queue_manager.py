import asyncio
from collections.abc import Awaitable, Callable

from backend.services.config import settings

TaskCallable = Callable[[], Awaitable[None]]


class QueueManager:
    def __init__(self, worker_count: int = 2) -> None:
        self.worker_count = worker_count
        self._queue: asyncio.Queue[TaskCallable] = asyncio.Queue()
        self._workers: list[asyncio.Task] = []
        self.running = False

    async def start(self) -> None:
        if self.running:
            return
        self.running = True
        self._workers = [asyncio.create_task(self._worker_loop()) for _ in range(self.worker_count)]

    async def stop(self) -> None:
        if not self.running:
            return
        self.running = False
        for worker in self._workers:
            worker.cancel()
        await asyncio.gather(*self._workers, return_exceptions=True)
        self._workers.clear()

    async def enqueue(self, task: TaskCallable) -> None:
        await self._queue.put(task)

    async def _worker_loop(self) -> None:
        while True:
            task = await self._queue.get()
            try:
                await task()
            finally:
                self._queue.task_done()


queue_manager = QueueManager(worker_count=settings.queue_workers)
