from pydantic import BaseModel
from typing import Optional

class Crypto(BaseModel):
    symbol: str
    price: float
    volume: float = 0
    history: list[float] = []
    initial_price: float = 0
    order_book: dict = {}

class CryptoCreate(BaseModel):
    symbol: str
    price: float
    volume: float

class CryptoPortfolioAdd(BaseModel):
    user_id: Optional[str] = None
    name: str
