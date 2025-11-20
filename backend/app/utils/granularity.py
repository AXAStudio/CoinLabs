"""
Utility functions for handling granularity levels and aggregating price history.
"""

import app.sim_config as cfg

def _granularity_to_seconds(g: str) -> int:
    """Convert a granularity label from cfg.GRANULARITY_LEVELS to seconds.
    """
    g = g.strip().lower()
    num = ''
    i = 0
    while i < len(g) and (g[i].isdigit() or g[i] == '.'):
        num += g[i]
        i += 1
    if not num:
        raise ValueError(f"invalid granularity: {g}")
    n = int(float(num))
    unit = g[i:]

    if unit == 's':
        return n
    if unit == 'm':
        return n * 60
    if unit == 'h':
        return n * 3600
    if unit == 'd':
        return n * 86400
    if unit == 'wk':
        return n * 7 * 86400
    if unit == 'mo':
        return n * 30 * 86400
    if unit == 'y':
        return n * 365 * 86400

    raise ValueError(f"unsupported granularity unit: {unit}")


def get_history_for_granularity(history, granularity: str):
    if granularity not in cfg.GRANULARITY_LEVELS:
        raise ValueError(f"granularity '{granularity}' not supported; allowed: {cfg.GRANULARITY_LEVELS}")

    bucket_seconds = _granularity_to_seconds(granularity)
    if bucket_seconds <= 0:
        raise ValueError("bucket size must be > 0 seconds")

    bucket_size = bucket_seconds

    if not history:
        return []

    results = []

    n = len(history)
    idx = 0
    while idx < n:
        chunk = history[idx: idx + bucket_size]
        if not chunk:
            break
        o = float(chunk[0])
        c = float(chunk[-1])
        hi = float(max(chunk))
        lo = float(min(chunk))
        results.append({
            'start_index': idx,
            'open': o,
            'high': hi,
            'low': lo,
            'close': c,
            'count': len(chunk),
            'bucket_size_seconds': bucket_seconds,
            'granularity': granularity,
        })
        idx += bucket_size

    return results
