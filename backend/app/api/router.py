from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.auth.router import router as auth_router

from app.products.router import router as products_router
from app.assets.router import router as assets_router
from app.rentals.router import router as rentals_router
from app.pricing.router import router as pricing_router
from app.payments.router import router as payments_router
from app.deposits.router import router as deposits_router
from app.operations.router import router as operations_router
from app.trust.router import router as trust_router
from app.maintenance.router import router as maintenance_router
from app.analytics.router import router as analytics_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(assets_router)
api_router.include_router(rentals_router)
api_router.include_router(pricing_router)
api_router.include_router(payments_router)
api_router.include_router(deposits_router)
api_router.include_router(operations_router)
api_router.include_router(trust_router)
api_router.include_router(maintenance_router)
api_router.include_router(analytics_router)




@api_router.get("/health")
async def health_check():
    return {"status": "ok", "message": "ROVIA API is running"}

@api_router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import text
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database not ready")
