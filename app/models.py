from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    price = Column(Integer)  # Preço em centavos para evitar erro de float
    quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=5) # Nível de alerta

    movements = relationship("Movement", back_populates="product")

class Movement(Base):
    __tablename__ = "movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    type = Column(String)  # "entrada" ou "saida"
    quantity = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="movements")