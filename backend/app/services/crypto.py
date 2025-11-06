"""
Exchange Service
"""

from app.utils.db import cryptos
from app.models.crypto import Crypto
from app.utils.simulator import create_order_book

def add_crypto(data: Crypto):
    symbol = data.symbol.upper()

    if symbol in cryptos:
        return None

    data.symbol = symbol
    data._initial_price = data.price
    data.order_book = create_order_book(data.price)
    data.history = [data.price]

    cryptos[symbol] = data
    return data


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
