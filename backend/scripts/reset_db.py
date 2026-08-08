import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def reset():
    engine = create_async_engine(str(settings.DATABASE_URI).replace("postgresql://", "postgresql+asyncpg://"), isolation_level="AUTOCOMMIT")
    async with engine.connect() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))

asyncio.run(reset())
