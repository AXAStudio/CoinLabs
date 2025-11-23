from fastapi import APIRouter, HTTPException, Request
from app.models.crypto import Crypto, CryptoCreate, CryptoPortfolioAdd
from app.services.crypto import (
    add_crypto, 
    list_cryptos, 
    get_crypto, 
    update_price, 
    delete_crypto, 
    get_cryptos_from_portfolio_service,
    add_crypto_to_portfolio_service
)
from app.utils.auth import get_current_user_id

router = APIRouter(tags=["Crypto"])

@router.post("/add_new", response_model=Crypto)
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

@router.post("/add_new_to_portfolio")
def add_new_crypto_to_portfolio(data: CryptoCreate, request: Request):
    user_id = get_current_user_id(request)

    crypto = Crypto(
        symbol=data.symbol,
        price=data.price,
        volume=data.volume,
        initial_price=data.price,
        history=[],
        order_book={}
    )

    add_crypto(crypto)

    crypto = CryptoPortfolioAdd(
        user_id=user_id,
        name=data.symbol
    )

    result = add_crypto_to_portfolio_service(user_id, crypto)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result

@router.post("/add", response_model=CryptoPortfolioAdd)
def add_crypto_to_portfolio(data: CryptoPortfolioAdd, request: Request):
    user_id = get_current_user_id(request)
    result = add_crypto_to_portfolio_service(user_id, data)

    print("ADD TO PORTFOLIO", result)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result

@router.delete("/delete", response_model=CryptoPortfolioAdd)
def delete_crypto_from_portfolio(data: CryptoPortfolioAdd, request: Request):
    user_id = get_current_user_id(request)
    result = delete_crypto_from_portfolio(user_id, data)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto does not exist in portfolio")

    return result

@router.get("/portfolio")
def get_cryptos_from_portfolio(user_id: str):
    rows = get_cryptos_from_portfolio_service(user_id) or []

    # Map DB rows to frontend-expected Crypto-like objects.
    # If a crypto isn't in memory, try to seed it from DB fields so we can return a live price.
    result = []
    for r in rows:
        # Supabase row should include a 'name' field for the crypto symbol
        name = (r.get('name') or r.get('symbol') or '').upper()
        if not name:
            continue

        live = get_crypto(name)
        if not live:
            # Attempt to seed the in-memory store from DB row values
            try:
                init_price = float(r.get('initial_price') or r.get('price') or 0.0)
            except (TypeError, ValueError):
                init_price = 0.0

            try:
                vol = float(r.get('volume') or 0.0)
            except (TypeError, ValueError):
                vol = 0.0

            if init_price > 0.0:
                # create and register the crypto in-memory so the simulator can provide live prices
                seed = Crypto(
                    symbol=name,
                    price=init_price,
                    volume=vol,
                    initial_price=init_price,
                    history=[],
                    order_book={},
                )
                # add_crypto returns the stored object or None if already exists
                added = add_crypto(seed)
                live = added or get_crypto(name)

        if live:
            result.append(live.dict())
        else:
            # Fallback: construct a minimal object from DB row
            result.append({
                'symbol': name,
                'price': float(r.get('initial_price') or r.get('price') or 0.0),
                'volume': float(r.get('volume') or 0.0),
                'history': [],
                'initial_price': float(r.get('initial_price') or r.get('price') or 0.0),
                'order_book': {},
            })

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
