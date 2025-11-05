import random
import numpy as np
import time
import threading
from app.utils.db import cryptos
import app.sim_config as cfg

running = True
_state = {}
_market_sentiment = 0.0
_step = 0

def _t_noise(df=cfg.DF_T, size=None):
    z = np.random.standard_t(df, size=size)

    return z / np.sqrt(df / (df - 2.0))

def _tick_size_for_price(p):
    if p < 1:       return 0.0001
    if p < 10:      return 0.001
    if p < 100:     return 0.01
    if p < 1000:    return 0.1
    if p < 20000:   return 1.0
    return 5.0

def _round_tick(x, tick):
    return np.round(x / tick) * tick

def _is_stablecoin(symbol: str):
    return any(k in symbol.upper() for k in cfg.STABLECOIN_TOKENS)

def _intraday_seasonality(step):
    period = int((24 * 60 * 60) / cfg.TICK_SPEED)
    if period <= 0:
        return 1.0
    
    phase = 2 * np.pi * (step % period) / period
    return 1.0 + cfg.SEASONAL_AMP * np.sin(phase)

def _ensure_state(symbol, price0):
    if symbol in _state:
        return _state[symbol]
    st = {
        "sigma2": cfg.SIGMA0**2,
        "last_r": 0.0,
        "fund_log": np.log(max(price0, 1e-8)),
        "last_bid_vol": 0.0,
        "last_ask_vol": 0.0,
        "sentiment": 0.0,
    }
    _state[symbol] = st
    return st

def create_order_book(price, sigma=None, depth=None):
    if sigma is None:
        sigma = cfg.SIGMA0

    if depth is None:
        depth = cfg.ORDER_BOOK_DEPTH

    tick = _tick_size_for_price(price)

    base_spread = max(1.5 * tick, cfg.VOL_TO_SPREAD * sigma * price)

    mid = price

    best_bid = _round_tick(mid - base_spread / 2.0, tick)
    best_ask = _round_tick(mid + base_spread / 2.0, tick)
    level_gap = max(tick, cfg.LEVEL_SPACING_FACTOR * base_spread / max(depth, 1))

    bids, asks = [], []
    base_size = 1.5 / max(1.0, sigma * 200.0)

    for i in range(depth):
        b_px = _round_tick(best_bid - i * level_gap, tick)
        a_px = _round_tick(best_ask + i * level_gap, tick)

        decay = np.exp(-cfg.DEPTH_DECAY * i)

        b_sz = max(0.05, np.random.lognormal(mean=np.log(base_size), sigma=0.35) * decay)
        a_sz = max(0.05, np.random.lognormal(mean=np.log(base_size), sigma=0.35) * decay)

        bids.append((float(b_px), float(b_sz)))
        asks.append((float(a_px), float(a_sz)))

    return {"bids": bids, "asks": asks}

def _microprice(order_book):

    if not order_book["bids"] or not order_book["asks"]:
        return None
    
    bb, vb = order_book["bids"][0]
    ba, va = order_book["asks"][0]
    denom = (vb + va) or 1.0

    return (ba * vb + bb * va) / denom

def simulate_tick(crypto, symbol=None, common_eps=None, seasonality=None):
    global _market_sentiment

    if symbol is None:
        symbol = getattr(crypto, "symbol", None) or "UNKNOWN"

    st = _ensure_state(symbol, crypto.initial_price)
    seasonality = 1.0 if seasonality is None else seasonality
    eps_idio = _t_noise()

    if common_eps is None:
        eps = eps_idio
    else:
        rho = max(0.0, min(1.0, cfg.COMMON_RHO))
        eps = np.sqrt(rho) * common_eps + np.sqrt(max(0.0, 1.0 - rho)) * eps_idio
    ob = getattr(crypto, "order_book", None)

    if not ob or not isinstance(ob, dict) or "bids" not in ob or "asks" not in ob:
        ob = create_order_book(crypto.price, sigma=np.sqrt(st["sigma2"]) * seasonality)
        crypto.order_book = ob

    bid_vol = float(sum(v for _, v in ob["bids"]))
    ask_vol = float(sum(v for _, v in ob["asks"]))
    ofi = (bid_vol - ask_vol) / max(bid_vol + ask_vol, 1.0)

    _market_sentiment = cfg.MARKET_SENTI_PERSIST * _market_sentiment + np.random.normal(0.0, cfg.MARKET_SENTI_SHOCK)
    _market_sentiment = float(np.clip(_market_sentiment, -cfg.SENTI_CLIP, cfg.SENTI_CLIP))

    st["sentiment"] = cfg.SENTI_PERSIST * st["sentiment"] + np.random.normal(0.0, cfg.SENTI_SHOCK)
    st["sentiment"] = float(np.clip(st["sentiment"], -cfg.SENTI_CLIP, cfg.SENTI_CLIP))
    st["fund_log"] += cfg.FUND_DRIFT * cfg.TICK_SPEED + np.random.normal(0.0, cfg.FUND_VOL * np.sqrt(cfg.TICK_SPEED))

    log_p = np.log(max(crypto.price, 1e-12))
    mean_rev = cfg.THETA_F * (st["fund_log"] - log_p) * cfg.TICK_SPEED
    vol_scale = np.sqrt(st["sigma2"]) * np.sqrt(cfg.TICK_SPEED) * seasonality

    jump = 0.0
    if np.random.rand() < cfg.JUMP_LAMBDA:
        jump = np.random.normal(cfg.JUMP_MU, cfg.JUMP_SIGMA)

    drift = cfg.MU * cfg.TICK_SPEED + st["sentiment"] + _market_sentiment + cfg.OFI_IMPACT * ofi
    r = drift + mean_rev + vol_scale * eps + jump

    new_log_p = log_p + r
    new_price = float(np.exp(new_log_p))

    if _is_stablecoin(symbol):
        new_price = float(np.clip(new_price, crypto.initial_price * 0.997, crypto.initial_price * 1.003))

    tick = _tick_size_for_price(new_price)

    new_price = float(_round_tick(new_price, tick))
    new_price = max(tick, new_price)

    crypto.price = new_price
    crypto.volume += abs(r) * max(1.0, new_price)
    crypto.history.append(new_price)

    if len(crypto.history) > cfg.HISTORY_LIMIT:
        crypto.history.pop(0)

    sigma_next = cfg.GARCH_W + cfg.GARCH_A * (r ** 2) + cfg.GARCH_B * st["sigma2"]

    if _is_stablecoin(symbol):
        sigma_next *= 0.25

    st["sigma2"] = float(max(1e-12, sigma_next))
    crypto.order_book = create_order_book(new_price, sigma=np.sqrt(st["sigma2"]) * seasonality)

    st["last_r"] = r
    st["last_bid_vol"] = bid_vol
    st["last_ask_vol"] = ask_vol

def simulation_loop():
    global _step
    while running:
        seasonality = _intraday_seasonality(_step)
        common_eps = _t_noise()
        for symbol, crypto in cryptos.items():
            simulate_tick(crypto, symbol=symbol, common_eps=common_eps, seasonality=seasonality)
        _step += 1
        time.sleep(cfg.TICK_SPEED)

def start_simulation():
    thread = threading.Thread(target=simulation_loop, daemon=True)
    thread.start()
