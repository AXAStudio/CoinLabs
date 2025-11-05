import requests
import time
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from collections import deque

BASE_URL = "http://localhost:8000/crypto"

# Store the most recent data (e.g. last 100 points)
prices = deque(maxlen=100)
timestamps = deque(maxlen=100)

symbol = "FAH"

def get_crypto(symbol: str):
    """Fetch crypto data from FastAPI"""
    try:
        response = requests.get(f"{BASE_URL}/{symbol}")
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print("❌ Connection error:", e)
        return None

# --- Matplotlib Setup ---
plt.style.use("seaborn-v0_8-darkgrid")
fig, ax = plt.subplots()
line, = ax.plot([], [], "g-", linewidth=2)
ax.set_title(f"📈 Live Price of {symbol}")
ax.set_xlabel("Time (s)")
ax.set_ylabel("Price (USD)")

def init():
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100000)  # Adjust range if needed
    return line,

def update(frame):
    data = get_crypto(symbol)
    if not data or "price" not in data:
        return line,
    
    price = data["price"]
    prices.append(price)
    timestamps.append(time.time() % 1000)  # seconds modulo for axis simplicity

    line.set_data(range(len(prices)), prices)
    ax.set_xlim(0, len(prices))
    ax.set_ylim(min(prices) * 0.95, max(prices) * 1.05)
    
    ax.set_title(f"📈 {symbol} | Current Price: ${price:,.2f}")
    return line,

# Create live animation
ani = animation.FuncAnimation(fig, update, init_func=init, interval=500, blit=True)

print(f"🚀 Streaming live prices for {symbol} from {BASE_URL}")
plt.show()
