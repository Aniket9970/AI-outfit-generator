from fastapi import BackgroundTasks
from typing import Callable, Dict
import asyncio

class BackgroundTaskManager:
    def __init__(self):
        self.tasks = {}
    
    async def add_task(
        self,
        task_id: str,
        func: Callable,
        *args,
        **kwargs
    ):
        """Add a background task"""
        self.tasks[task_id] = asyncio.create_task(func(*args, **kwargs))
    
    async def get_task_status(self, task_id: str) -> Dict:
        """Get status of a background task"""
        if task_id not in self.tasks:
            return {"status": "not_found"}
            
        task = self.tasks[task_id]
        if task.done():
            return {"status": "completed", "result": task.result()}
        return {"status": "running"}

background_tasks = BackgroundTaskManager() 