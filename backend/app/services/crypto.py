"""Compatibility wrapper - re-export market and portfolio services under
the older `services.crypto` module names so existing imports keep working.
"""
from app.services.market import (
    market_add_crypto,
    market_get_crypto,
    market_list_cryptos,
    market_update_price,
    market_delete_crypto,
)
from app.services.portfolio import (
    portfolio_add_crypto,
    portfolio_delete_crypto,
    portfolio_get_user_cryptos,
)


def add_crypto(data):
    return market_add_crypto(data)


def get_crypto(symbol: str):
    return market_get_crypto(symbol)


def list_cryptos():
    return market_list_cryptos()


def update_price(symbol: str, price: float):
    return market_update_price(symbol, price)


def delete_crypto(symbol: str):
    return market_delete_crypto(symbol)


def add_crypto_to_portfolio_service(user_id: str, data):
    return portfolio_add_crypto(user_id, data)


def delete_crypto_from_portfolio(user_id: str, data):
    return portfolio_delete_crypto(user_id, data)


def get_cryptos_from_portfolio_service(user_id: str):
    return portfolio_get_user_cryptos(user_id)
