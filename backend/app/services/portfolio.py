"""
Portfolio-related services: interact with Supabase and portfolio DB table
"""
from supabase import create_client
from app.models.crypto import CryptoPortfolioAdd
from app.sim_config import config
from app.utils.db import cryptos
from app.models.crypto import Crypto


supabase = create_client(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY
)


def portfolio_add_crypto(user_id: str, data: CryptoPortfolioAdd):
    """Insert a portfolio row for a user. Expects the crypto to exist in-memory."""
    # Ensure crypto exists in memory
    crypto = cryptos.get((data.name or '').upper())
    if not crypto:
        return None

    initial_price = getattr(crypto, 'initial_price', None)
    if not initial_price:
        return None

    new_crypto = {
        "user_id": user_id,
        "name": data.name,
        "initial_price": initial_price,
    }

    res = supabase.table(config.DB_SCHEMA.CRYPTO_EXCHANGE).insert(
        new_crypto
    ).execute()

    # supabase-py returns an object with .data and .error. Normalize the
    # return value to either the inserted row (dict) or None on error so
    # callers (and the router) can make a clear decision.
    if getattr(res, 'error', None):
        return None

    # res.data is typically a list of inserted rows
    if getattr(res, 'data', None):
        return res.data[0]

    return None


def portfolio_delete_crypto(user_id: str, data: CryptoPortfolioAdd):
    res = supabase.table(config.DB_SCHEMA.CRYPTO_EXCHANGE).delete().eq("user_id", user_id).eq("name", data.name).execute()
    if getattr(res, 'error', None):
        return None
    return res.data


def portfolio_get_user_cryptos(user_id: str):
    res = supabase.table(config.DB_SCHEMA.CRYPTO_EXCHANGE).select("*").eq("user_id", str(user_id)).execute()
    return res.data


def portfolio_seed_crypto_from_row(row: dict):
    """Create an in-memory Crypto object from a DB row if possible and register it.
    Returns the created Crypto or None."""
    name = (row.get('name') or row.get('symbol') or '').upper()
    if not name:
        return None

    try:
        init_price = float(row.get('initial_price') or row.get('price') or 0.0)
    except (TypeError, ValueError):
        init_price = 0.0

    try:
        vol = float(row.get('volume') or 0.0)
    except (TypeError, ValueError):
        vol = 0.0

    if init_price <= 0.0:
        return None

    c = Crypto(
        symbol=name,
        price=init_price,
        volume=vol,
        initial_price=init_price,
        history=[],
        order_book={},
    )

    # register in-memory
    cryptos[name] = c
    return c
