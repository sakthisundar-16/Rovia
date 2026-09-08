"""
ROVIA Return Verification Router
Endpoint for verifying returned rental assets using OpenCV Computer Vision
"""

import io
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel, Field
import httpx

from app.rentals.damage_detector import detect_damage_opencv

router = APIRouter(prefix="/api/rentals", tags=["Return Inspection & OpenCV Verification"])


class ReturnDamageRequest(BaseModel):
    order_id: Optional[str] = Field(None, description="Rental order number or ID")
    baseline_image_url: Optional[str] = Field(None, description="URL of clean dispatch asset image")
    baseline_image_base64: Optional[str] = Field(None, description="Base64 string of clean dispatch asset image")
    return_image_url: Optional[str] = Field(None, description="URL of returned asset photo")
    return_image_base64: Optional[str] = Field(None, description="Base64 string of returned asset photo")
    min_defect_area: Optional[int] = Field(150, description="Minimum pixel area to qualify as a scratch/crack")


async def _fetch_bytes(url: Optional[str], b64_str: Optional[str]) -> bytes:
    """Helper to convert URL or base64 into raw bytes"""
    if b64_str:
        # Strip header like data:image/jpeg;base64, if present
        if "," in b64_str:
            b64_str = b64_str.split(",", 1)[1]
        return base64.b64decode(b64_str)
    
    if url:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.content
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch reference image from URL: {url} (HTTP {resp.status_code})"
            )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Must provide either image_url or image_base64"
    )


@router.post(
    "/verify-return-damage",
    summary="Compare dispatch baseline vs return asset image using OpenCV"
)
async def verify_return_damage(payload: ReturnDamageRequest):
    """
    OpenCV Return Verification Engine:
    - Analyzes structural difference between original asset & returned asset
    - Detects scratches, cracks, broken casing, and missing attachments
    - Returns match score, bounding box overlay, and recommended security deposit deduction
    """
    try:
        baseline_bytes = await _fetch_bytes(payload.baseline_image_url, payload.baseline_image_base64)
        return_bytes = await _fetch_bytes(payload.return_image_url, payload.return_image_base64)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Image extraction error: {str(e)}"
        )

    result = detect_damage_opencv(
        baseline_bytes=baseline_bytes,
        return_bytes=return_bytes,
        min_defect_area=payload.min_defect_area or 150
    )

    return {
        "status": "success",
        "order_id": payload.order_id,
        **result
    }
