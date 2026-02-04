from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException
from . import models, schemas

# --- PRODUTOS ---
def get_products(db: Session):
    return db.query(models.Product).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict(), quantity=0)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: schemas.ProductUpdate):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        return None
    
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        # Opcional: Deletar movimentações associadas antes (CASCADE)
        db.query(models.Movement).filter(models.Movement.product_id == product_id).delete()
        db.delete(product)
        db.commit()
        return True
    return False

# --- MOVIMENTAÇÕES ---
def create_movement(db: Session, movement: schemas.MovementCreate):
    db_product = db.query(models.Product).filter(models.Product.id == movement.product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    if movement.type == "saida":
        if db_product.quantity < movement.quantity:
            raise HTTPException(status_code=400, detail="Estoque insuficiente!")
        db_product.quantity -= movement.quantity
    elif movement.type == "entrada":
        db_product.quantity += movement.quantity
    else:
        raise HTTPException(status_code=400, detail="Tipo inválido")

    db_movement = models.Movement(**movement.dict())
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement

def get_recent_movements(db: Session, limit: int = 5):
    return db.query(models.Movement)\
             .order_by(desc(models.Movement.timestamp))\
             .limit(limit)\
             .all()

# --- NOVO: Histórico por Produto ---
def get_movements_by_product(db: Session, product_id: int):
    return db.query(models.Movement)\
             .filter(models.Movement.product_id == product_id)\
             .order_by(desc(models.Movement.timestamp))\
             .all()

# --- RELATÓRIOS ---
def get_low_stock(db: Session):
    return db.query(models.Product).filter(models.Product.quantity <= models.Product.min_stock).all()