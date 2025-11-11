"""
Exchange Service
"""

from app.utils.db import cryptos
from app.models.crypto import Crypto, CryptoPortfolioAdd
from app.utils.simulator import create_order_book
from supabase import create_client
from app.sim_config import config

supabase = create_client(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY
)

def add_crypto(data: Crypto):
    symbol = data.symbol.upper()

    if symbol in cryptos:
        return None

    data.symbol = symbol
    # store the initial price on the public field expected by the Pydantic model
    data.initial_price = data.price
    data.order_book = create_order_book(data.price)
    data.history = [data.price]

    cryptos[symbol] = data
    return data

def add_crypto_to_portfolio_service(user_id: str, data: CryptoPortfolioAdd):
    crypto = get_crypto(data.name)
    if not crypto:
        return None

    # access attribute on the Crypto object rather than dict-style indexing
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

    return res

def delete_crypto_from_portfolio(user_id: str, data: CryptoPortfolioAdd):

    res = supabase.table(config.DB_SCHEMA.CRYPTO_EXCHANGE).delete().eq("user_id", user_id).eq("name", data.name).execute()

    return res

def get_cryptos_from_portfolio_service(user_id: str):
    res = supabase.table(config.DB_SCHEMA.CRYPTO_EXCHANGE).select("*").eq("user_id", str(user_id)).execute()
    return res.data

def get_crypto(symbol: str):
    return cryptos.get(symbol.upper())

def list_cryptos():
    return list(cryptos.values())

def update_price(symbol: str, price: float):
    c = get_crypto(symbol)
    if not c:
        return None
    c.price = price
    c.history.append(price)
    return c

def delete_crypto(symbol: str):
    return cryptos.pop(symbol.upper(), None)
