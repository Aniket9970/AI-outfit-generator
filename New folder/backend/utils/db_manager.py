from contextlib import asynccontextmanager
from typing import AsyncGenerator
from utils.database import Database

@asynccontextmanager
async def get_db() -> AsyncGenerator[Database, None]:
    db = Database()
    try:
        yield db
    finally:
        await db.close() 