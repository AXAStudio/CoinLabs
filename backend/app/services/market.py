"""
Market-related services: manage in-memory cryptos (simulator-backed)
"""
from app.utils.db import cryptos
from app.models.crypto import Crypto
from app.utils.simulator import create_order_book


def market_add_crypto(data: Crypto):
    symbol = data.symbol.upper()

    if symbol in cryptos:
        return None

    data.symbol = symbol
    data.initial_price = data.price
    data.order_book = create_order_book(data.price)
    data.history = [data.price]

    cryptos[symbol] = data
    return data


def market_get_crypto(symbol: str):
    return cryptos.get(symbol.upper())


def market_list_cryptos():
    return list(cryptos.values())


def market_update_price(symbol: str, price: float):
    c = market_get_crypto(symbol)
    if not c:
        return None
    c.price = price
    c.history.append(price)
    return c


def market_delete_crypto(symbol: str):
    return cryptos.pop(symbol.upper(), None)
