from fastapi import APIRouter, HTTPException
from app.models.crypto import Crypto, CryptoCreate
from app.services.crypto import (
    add_crypto, list_cryptos, get_crypto, update_price, delete_crypto
)

router = APIRouter(prefix="/crypto", tags=["Crypto"])

@router.post("/add", response_model=Crypto)
def api_add_crypto(data: CryptoCreate):
    crypto = Crypto(
        symbol=data.symbol,
        price=data.price,
        volume=data.volume,
        initial_price=data.price,
        history=[],
        order_book={}
    )

    result = add_crypto(crypto)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result

@router.get("/list")
def api_list():
    return list_cryptos()

@router.get("/{symbol}")
def api_get(symbol: str):
    crypto = get_crypto(symbol)
    if not crypto:
        return {"error": "Crypto not found"}
    return crypto

@router.put("/{symbol}/price")
def api_update_price(symbol: str, price: float):
    crypto = update_price(symbol, price)
    if not crypto:
        return {"error": "Crypto not found"}
    return crypto

@router.delete("/{symbol}")
def api_delete(symbol: str):
    deleted = delete_crypto(symbol)
    if not deleted:
        return {"error": "Crypto not found"}
    return deleted
