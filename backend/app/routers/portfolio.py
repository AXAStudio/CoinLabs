from fastapi import APIRouter, HTTPException, Request, Query
from app.models.crypto import CryptoCreate, CryptoPortfolioAdd, Crypto
from app.services.portfolio import (
    portfolio_add_crypto,
    portfolio_delete_crypto,
    portfolio_get_user_cryptos,
    portfolio_seed_crypto_from_row,
)
from app.services.market import (
    market_add_crypto,
    market_get_crypto,
)
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.post("/add_new_to_portfolio")
def portfolio_add_new_crypto(data: CryptoCreate, request: Request):
    user_id = get_current_user_id(request)

    crypto = Crypto(
        symbol=data.symbol,
        price=data.price,
        volume=data.volume,
        initial_price=data.price,
        history=[],
        order_book={}
    )

    # register in-memory via market service
    market_add_crypto(crypto)

    crypto_add = CryptoPortfolioAdd(
        user_id=user_id,
        name=data.symbol
    )

    result = portfolio_add_crypto(user_id, crypto_add)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result


@router.post("/add")
def portfolio_add_existing_crypto(data: CryptoPortfolioAdd, request: Request):
    user_id = get_current_user_id(request)
    result = portfolio_add_crypto(user_id, data)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto already exists")

    return result


@router.delete("/delete")
def portfolio_delete(user_id: str, data: CryptoPortfolioAdd, request: Request):
    # Note: kept signature but ensure we get user from auth helper for consistency
    user_id = get_current_user_id(request)
    result = portfolio_delete_crypto(user_id, data)

    if not result:
        raise HTTPException(status_code=400, detail="Crypto does not exist in portfolio")

    return result
@router.get("")
def portfolio_list(user_id: str = Query(..., description="User ID")):
    """Get all cryptos in user's portfolio"""
    rows = portfolio_get_user_cryptos(user_id) or []

    result = []
    for r in rows:
        name = (r.get('name') or r.get('symbol') or '').upper()
        if not name:
            continue

        live = market_get_crypto(name)
        if not live:
            # attempt seeding using portfolio service helper
            seeded = portfolio_seed_crypto_from_row(r)
            live = seeded or market_get_crypto(name)

        if live:
            result.append(live.dict())
        else:
            result.append({
                'symbol': name,
                'price': float(r.get('initial_price') or r.get('price') or 0.0),
                'volume': float(r.get('volume') or 0.0),
                'history': [],
                'initial_price': float(r.get('initial_price') or r.get('price') or 0.0),
                'order_book': {},
            })

    return result
