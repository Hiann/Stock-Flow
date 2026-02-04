from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Schemas para Produto ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    min_stock: int = 5

class ProductCreate(ProductBase):
    pass

# NOVO: Schema para Atualização (Campos opcionais)
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    min_stock: Optional[int] = None

class ProductResponse(ProductBase):
    id: int
    quantity: int
    class Config:
        from_attributes = True

# --- Schemas para Movimentação ---
class MovementCreate(BaseModel):
    product_id: int
    type: str # "entrada" ou "saida"
    quantity: int

class MovementResponse(MovementCreate):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True