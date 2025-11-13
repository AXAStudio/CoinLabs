from fastapi import APIRouter, HTTPException
from app.models.crypto import Crypto, CryptoCreate
from app.services.market import (
    market_add_crypto,
    market_list_cryptos,
    market_get_crypto,
    market_update_price,
    market_delete_crypto,
)

router = APIRouter(prefix="/market", tags=["Market"])


@router.post("/add_new", response_model=Crypto)
def market_add_new_crypto(data: CryptoCreate):
    crypto = Crypto(
        symbol=data.symbol,
        price=data.price,
        volume=data.volume,
        initial_price=data.price,
        history=[],
        order_book={}
    )

    result = market_add_crypto(crypto)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result


@router.get("/list")
def market_list():
    return market_list_cryptos()


@router.get("/{symbol}")
def market_get(symbol: str):
    crypto = market_get_crypto(symbol)
    if not crypto:
        raise HTTPException(status_code=404, detail="Crypto not found")
    return crypto


@router.put("/{symbol}/price")
def market_update(symbol: str, price: float):
    crypto = market_update_price(symbol, price)
    if not crypto:
        raise HTTPException(status_code=404, detail="Crypto not found")
    return crypto


@router.delete("/{symbol}")
def market_delete(symbol: str):
    deleted = market_delete_crypto(symbol)
    if not deleted:
        raise HTTPException(status_code=404, detail="Crypto not found")
    return deleted
