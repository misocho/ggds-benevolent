from pydantic import BaseModel
from typing import Optional


class Message(BaseModel):
    """Generic message response schema"""
    message: str


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str


class HealthCheck(BaseModel):
    """Health check response schema"""
    status: str
    version: str
    database: str
